import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — mensagens do chat do evento (público para logados)
export async function GET(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get("cursor") ?? undefined
  const limit  = 40

  const messages = await prisma.eventMessage.findMany({
    where:   { eventId: id, ...(cursor ? { id: { lt: cursor } } : {}) },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
    orderBy: { createdAt: "desc" },
    take:    limit + 1,
  })

  const hasMore = messages.length > limit
  const items   = hasMore ? messages.slice(0, limit) : messages

  return NextResponse.json({
    messages:   items.reverse(),
    nextCursor: hasMore ? items[0]?.id : null,
  })
}

// POST — enviar mensagem no chat do evento
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const exists = await prisma.event.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

  const { content } = await req.json() as { content: string }
  if (!content?.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })

  const message = await prisma.eventMessage.create({
    data:    { eventId: id, userId: me.userId, content: content.trim() },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
  })

  return NextResponse.json(message, { status: 201 })
}
