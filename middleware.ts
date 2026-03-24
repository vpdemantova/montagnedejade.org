import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/guest",
  "/favicon.ico",
  "/_next",
  "/fonts",
]

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? process.env.AUTH_SECRET ?? "fallback-dev-secret"
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = req.cookies.get("ps_session")?.value

  // Sem token → login
  if (!token) {
    const login = new URL("/login", req.url)
    login.searchParams.set("from", pathname)
    return NextResponse.redirect(login)
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
    // Token inválido ou expirado
    const login = new URL("/login", req.url)
    login.searchParams.set("from", pathname)
    const res = NextResponse.redirect(login)
    res.cookies.set("ps_session", "", { maxAge: 0, path: "/" })
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
