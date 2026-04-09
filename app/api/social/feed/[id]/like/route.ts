import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// POST /api/social/feed/[id]/like — toggle like (like se não curtiu, unlike se já curtiu)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token   = (await cookies()).get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.guest) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id: postId } = await params

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: payload.userId } },
    })

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } })
    } else {
      await prisma.postLike.create({ data: { postId, userId: payload.userId } })
    }

    const count = await prisma.postLike.count({ where: { postId } })

    return NextResponse.json({ liked: !existing, count })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// GET /api/social/feed/[id]/like — verificar se o usuário atual curtiu
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token   = (await cookies()).get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null

    const { id: postId } = await params

    const [count, liked] = await Promise.all([
      prisma.postLike.count({ where: { postId } }),
      payload
        ? prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId: payload.userId } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ])

    return NextResponse.json({ liked: !!liked, count })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
