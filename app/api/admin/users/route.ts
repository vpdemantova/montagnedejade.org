import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// ── GET /api/admin/users — listagem admin de usuários ─────────────────────────
// Protegido: requer header x-admin-key = AUTH_PASSWORD

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-admin-key")
  if (!key || key !== process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:          true,
      username:    true,
      displayName: true,
      bio:         true,
      avatarUrl:   true,
      accentColor: true,
      createdAt:   true,
      _count: {
        select: {
          followers:  true,
          following:  true,
          posts:      true,
          interests:  true,
          tickets:    true,
          tokens:     true,
        },
      },
    },
  })

  const total = await prisma.user.count()
  const totalAtlas = await prisma.atlasItem.count()

  return NextResponse.json({ users, total, totalAtlas })
}

// ── DELETE /api/admin/users — remover usuário ─────────────────────────────────

export async function DELETE(req: NextRequest) {
  const key = req.headers.get("x-admin-key")
  if (!key || key !== process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { userId } = await req.json() as { userId: string }
  if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })

  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ ok: true })
}
