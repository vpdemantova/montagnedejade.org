import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — detalhe da conversa + mensagens paginadas
export async function GET(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  // Verifica participação
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: me.userId } },
  })
  if (!membership) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get("cursor") ?? undefined
  const limit  = 50

  const [conversation, messages] = await Promise.all([
    prisma.conversation.findUnique({
      where:   { id },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
        },
      },
    }),
    prisma.message.findMany({
      where:   { conversationId: id, ...(cursor ? { id: { lt: cursor } } : {}) },
      include: { sender: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
      orderBy: { createdAt: "desc" },
      take:    limit + 1,
    }),
  ])

  if (!conversation) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  const hasMore = messages.length > limit
  const items   = hasMore ? messages.slice(0, limit) : messages

  // Marcar como lido
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: id, userId: me.userId } },
    data:  { lastReadAt: new Date() },
  })

  return NextResponse.json({
    id:           conversation.id,
    name:         conversation.name,
    isGroup:      !!conversation.name,
    participants: conversation.participants.map((p) => p.user),
    messages:     items.reverse(),
    nextCursor:   hasMore ? items[0]?.id : null,
  })
}
