import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/atlas/lib/db"
import { signToken } from "@/atlas/lib/jwt"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json() as {
      username: string
      password: string
    }

    if (!username || !password) {
      return NextResponse.json({ error: "Preencha usuário e senha" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

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
