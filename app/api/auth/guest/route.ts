import { NextResponse } from "next/server"
import { signToken } from "@/atlas/lib/jwt"

export async function POST() {
  const token = await signToken({
    userId:      "guest",
    username:    "visitante",
    displayName: "Visitante",
    guest:       true,
  })

  const res = NextResponse.json({ ok: true })
  res.cookies.set("ps_session", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 4, // 4 horas
    path:     "/",
  })
  return res
}
