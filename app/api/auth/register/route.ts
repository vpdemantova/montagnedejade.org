import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/atlas/lib/db"
import { signToken } from "@/atlas/lib/jwt"
import { rateLimit, getIp } from "@/atlas/lib/rate-limit"

export async function POST(req: Request) {
  try {
    // 5 registros por IP a cada hora
    const ip = getIp(req)
    const rl = rateLimit(`register:${ip}`, 5, 60 * 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Limite de registros atingido. Tente novamente em uma hora." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      )
    }

    const { username, displayName, password, invitedByUsername } = await req.json() as {
      username:           string
      displayName:        string
      password:           string
      invitedByUsername?: string
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

    // Resolve o ID de quem convidou (se fornecido)
    let invitedById: string | undefined
    if (invitedByUsername) {
      const inviter = await prisma.user.findUnique({
        where:  { username: invitedByUsername.toLowerCase() },
        select: { id: true },
      })
      if (inviter) invitedById = inviter.id
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username:    username.toLowerCase(),
        displayName: displayName.trim(),
        passwordHash,
        invitedById,
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
