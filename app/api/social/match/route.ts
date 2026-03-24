import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// GET /api/social/match — usuários com interesses em comum
export async function GET() {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    // Itens que eu tenho interesse
    const myInterests = await prisma.userInterest.findMany({
      where:  { userId: me.userId },
      select: { atlasItemId: true },
    })
    const myItemIds = myInterests.map((i) => i.atlasItemId)

    if (myItemIds.length === 0) {
      return NextResponse.json([])
    }

    // Usuários que têm interesse nos mesmos itens
    const matches = await prisma.userInterest.groupBy({
      by:     ["userId"],
      where:  {
        atlasItemId: { in: myItemIds },
        userId:      { not: me.userId },
      },
      _count: { atlasItemId: true },
      orderBy: { _count: { atlasItemId: "desc" } },
      take:   20,
    })

    if (matches.length === 0) return NextResponse.json([])

    const matchedUserIds = matches.map((m) => m.userId)

    const users = await prisma.user.findMany({
      where: { id: { in: matchedUserIds } },
      select: {
        id: true, username: true, displayName: true,
        avatarUrl: true, accentColor: true, bio: true,
        _count: { select: { followers: true, interests: true } },
      },
    })

    // Montar resultado com contagem de interesses em comum
    const result = users.map((u) => ({
      ...u,
      commonInterests: matches.find((m) => m.userId === u.id)?._count.atlasItemId ?? 0,
    })).sort((a, b) => b.commonInterests - a.commonInterests)

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
