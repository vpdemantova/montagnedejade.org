import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// POST /api/social/follow — seguir ou deixar de seguir
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { targetUserId, action } = await req.json() as {
      targetUserId: string
      action:       "follow" | "unfollow"
    }

    if (targetUserId === me.userId) {
      return NextResponse.json({ error: "Não pode seguir a si mesmo" }, { status: 400 })
    }

    if (action === "follow") {
      await prisma.follow.upsert({
        where:  { followerId_followingId: { followerId: me.userId, followingId: targetUserId } },
        create: { followerId: me.userId, followingId: targetUserId },
        update: {},
      })
      return NextResponse.json({ following: true })
    } else {
      await prisma.follow.deleteMany({
        where: { followerId: me.userId, followingId: targetUserId },
      })
      return NextResponse.json({ following: false })
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
