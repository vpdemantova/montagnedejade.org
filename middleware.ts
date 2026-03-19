import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/favicon.ico", "/_next", "/fonts"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Liberar rotas públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = req.cookies.get("ps_session")?.value
  const secret  = process.env.AUTH_SECRET

  // Se AUTH_SECRET não está configurado, libera tudo (modo dev sem auth)
  if (!secret) return NextResponse.next()

  if (session !== secret) {
    const login = new URL("/login", req.url)
    login.searchParams.set("from", pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
