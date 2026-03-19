import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  const expected = process.env.AUTH_PASSWORD
  const secret   = process.env.AUTH_SECRET

  if (!expected || !secret) {
    // Auth não configurado — rejeitar por segurança
    return NextResponse.json({ error: "Auth não configurado" }, { status: 500 })
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set("ps_session", secret, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 30, // 30 dias
    path:     "/",
  })
  return res
}
