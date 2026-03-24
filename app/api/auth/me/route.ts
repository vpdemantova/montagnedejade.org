import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const token = (await cookies()).get("ps_session")?.value
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, username: true, displayName: true,
        bio: true, avatarUrl: true, accentColor: true, createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            interests: true,
            tickets:   true,
            tokens:    true,
            posts:     true,
          },
        },
      },
    })

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    return NextResponse.json(user)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
