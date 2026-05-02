import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// ── GET /api/social/members — todos os perfis públicos ────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const limit  = Math.min(parseInt(searchParams.get("limit")  ?? "50"), 100)
  const cursor = searchParams.get("cursor") ?? undefined
  const search = searchParams.get("search") ?? undefined

  const users = await prisma.user.findMany({
    take:    limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    ...(search ? {
      where: {
        OR: [
          { username:    { contains: search } },
          { displayName: { contains: search } },
        ],
      },
    } : {}),
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
        select: { followers: true, posts: true, interests: true },
      },
    },
  })

  const hasMore   = users.length > limit
  const items     = hasMore ? users.slice(0, limit) : users
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({ users: items, nextCursor })
}
