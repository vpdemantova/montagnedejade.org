import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// ── GET /api/perfil/[username] — dados públicos do cartão de membro ───────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where:  { username },
    select: {
      id:          true,
      username:    true,
      displayName: true,
      bio:         true,
      avatarUrl:   true,
      accentColor: true,
      createdAt:   true,
    },
  })

  if (!user) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  // Número de membro determinístico baseado no ID
  const memberNum = (
    Math.abs(parseInt(user.id.replace(/[^0-9a-f]/gi, "").slice(-8), 16)) % 999999
  ).toString().padStart(6, "0")

  const res = NextResponse.json({
    username:    user.username,
    displayName: user.displayName,
    bio:         user.bio,
    avatarUrl:   user.avatarUrl,
    accentColor: user.accentColor,
    memberNum,
    since:       user.createdAt.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
  })
  // Cache público: CDN serve por 60s, revalida em background
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
  return res
}
