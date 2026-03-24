import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/atlas/lib/db"
import { signToken } from "@/atlas/lib/jwt"

export async function POST(req: Request) {
  try {
    const { username, displayName, password } = await req.json() as {
      username:    string
      displayName: string
      password:    string
    }

    if (!username || !password || !displayName) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 })
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "Username deve ter ao menos 3 caracteres" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter ao menos 6 caracteres" }, { status: 400 })
    }

    // Username só letras, números e _
    if (!/^[a-z0-9_]+$/i.test(username)) {
      return NextResponse.json({ error: "Username só pode ter letras, números e _" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { username: username.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: "Username já está em uso" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username:    username.toLowerCase(),
        displayName: displayName.trim(),
        passwordHash,
        // Dar 3 tickets de boas-vindas
        tickets: {
          create: [
            { type: "FOUNDER", note: "Ticket de fundador — bem-vindo ao Portal Solar" },
            { type: "STANDARD" },
            { type: "STANDARD" },
          ],
        },
      },
    })

    const token = await signToken({
      userId:      user.id,
      username:    user.username,
      displayName: user.displayName,
    })

    const res = NextResponse.json({ ok: true, username: user.username })
    res.cookies.set("ps_session", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 30,
      path:     "/",
    })
    return res
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
