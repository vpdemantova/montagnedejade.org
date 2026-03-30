import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "fallback-dev-secret"
)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("ps_session")?.value

  // Sem token → acesso livre sem headers de usuário
  if (!token) {
    return NextResponse.next()
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    // Passa userId via header para os API routes
    const res = NextResponse.next()
    res.headers.set("x-user-id",   String(payload.userId ?? ""))
    res.headers.set("x-username",  String(payload.username ?? ""))
    res.headers.set("x-guest",     payload.guest ? "1" : "0")
    return res
  } catch {
    // Token inválido ou expirado — limpa cookie e continua sem auth
    const res = NextResponse.next()
    res.cookies.set("ps_session", "", { maxAge: 0, path: "/" })
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
