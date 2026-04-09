import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/atlas/lib/db"
import { signToken } from "@/atlas/lib/jwt"
import { rateLimit, getIp } from "@/atlas/lib/rate-limit"

export async function POST(req: Request) {
  try {
    // 10 tentativas por IP a cada 15 minutos
    const ip = getIp(req)
    const rl = rateLimit(`login:${ip}`, 10, 15 * 60_000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      )
    }

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
