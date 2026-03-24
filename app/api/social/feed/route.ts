import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// GET /api/social/feed — feed do usuário (posts de quem segue + próprios)
export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit  = Number(searchParams.get("limit") ?? 20)
    const cursor = searchParams.get("cursor") ?? undefined

    // IDs de quem o usuário segue
    const following = await prisma.follow.findMany({
      where: { followerId: payload.userId },
      select: { followingId: true },
    })
    const followingIds = [payload.userId, ...following.map((f) => f.followingId)]

    const posts = await prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      include: {
        author:    { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
        atlasItem: { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
        _count:    { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take:    limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    })

    const hasMore = posts.length > limit
    if (hasMore) posts.pop()

    return NextResponse.json({
      posts,
      nextCursor: hasMore ? posts[posts.length - 1]?.id : null,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST /api/social/feed — criar post
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { content, type, atlasItemId } = await req.json() as {
      content:     string
      type?:       string
      atlasItemId?: string
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: "Conteúdo vazio" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        authorId:    payload.userId,
        content:     content.trim(),
        type:        type ?? "TEXT",
        atlasItemId: atlasItemId ?? null,
      },
      include: {
        author:    { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
        atlasItem: { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
        _count:    { select: { likes: true } },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
