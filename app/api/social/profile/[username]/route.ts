import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

type Params = { params: Promise<{ username: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { username } = await params
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true, username: true, displayName: true,
        bio: true, avatarUrl: true, accentColor: true, createdAt: true,
        _count: {
          select: { followers: true, following: true, interests: true, posts: true },
        },
        interests: {
          include: {
            atlasItem: {
              select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true },
            },
          },
          orderBy: { rating: "desc" },
          take: 12,
        },
        tokens: {
          where: { isEquipped: true },
          orderBy: { createdAt: "desc" },
          take: 6,
        },
        posts: {
          include: {
            atlasItem: { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
            _count:    { select: { likes: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    // Verificar se o usuário autenticado segue esse perfil
    let isFollowing = false
    if (me && me.userId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: me.userId, followingId: user.id } },
      })
      isFollowing = !!follow
    }

    return NextResponse.json({ ...user, isFollowing })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// PATCH — atualizar perfil próprio
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { username } = await params
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    if (me.username !== username) return NextResponse.json({ error: "Proibido" }, { status: 403 })

    const { displayName, bio, avatarUrl, accentColor } = await req.json() as {
      displayName?: string
      bio?:         string
      avatarUrl?:   string
      accentColor?: string
    }

    const updated = await prisma.user.update({
      where: { username: username.toLowerCase() },
      data:  { displayName, bio, avatarUrl, accentColor },
      select: { id: true, username: true, displayName: true, bio: true, avatarUrl: true, accentColor: true },
    })

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
