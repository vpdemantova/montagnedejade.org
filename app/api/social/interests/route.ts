import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// GET — meus interesses (ou um específico via ?atlasItemId=)
export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json(null, { status: 200 }) // retorna null se não autenticado

    const { searchParams } = new URL(req.url)
    const atlasItemId = searchParams.get("atlasItemId")

    if (atlasItemId) {
      const interest = await prisma.userInterest.findUnique({
        where: { userId_atlasItemId: { userId: me.userId, atlasItemId } },
        select: { rating: true, note: true },
      })
      return NextResponse.json(interest ?? null)
    }

    const interests = await prisma.userInterest.findMany({
      where:   { userId: me.userId },
      include: { atlasItem: { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } } },
      orderBy: { rating: "desc" },
    })

    return NextResponse.json(interests)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST — adicionar/atualizar interesse
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { atlasItemId, rating, note } = await req.json() as {
      atlasItemId: string
      rating?:     number
      note?:       string
    }

    const interest = await prisma.userInterest.upsert({
      where:  { userId_atlasItemId: { userId: me.userId, atlasItemId } },
      create: { userId: me.userId, atlasItemId, rating: rating ?? 5, note },
      update: { rating: rating ?? 5, note },
      include: { atlasItem: { select: { id: true, slug: true, title: true, type: true, area: true } } },
    })

    return NextResponse.json(interest)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// DELETE — remover interesse
export async function DELETE(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const atlasItemId = searchParams.get("atlasItemId")
    if (!atlasItemId) return NextResponse.json({ error: "atlasItemId obrigatório" }, { status: 400 })

    await prisma.userInterest.deleteMany({
      where: { userId: me.userId, atlasItemId },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
