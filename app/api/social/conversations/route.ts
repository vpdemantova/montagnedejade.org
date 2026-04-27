import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — lista conversas do usuário logado
export async function GET() {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const memberships = await prisma.conversationParticipant.findMany({
    where:   { userId: me.userId },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { displayName: true } } },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  })

  const conversations = memberships.map((m) => {
    const conv      = m.conversation
    const lastMsg   = conv.messages[0] ?? null
    const others    = conv.participants.filter((p) => p.userId !== me.userId).map((p) => p.user)
    const unread    = !m.lastReadAt || (lastMsg && new Date(lastMsg.createdAt) > new Date(m.lastReadAt))

    return {
      id:        conv.id,
      name:      conv.name ?? (others[0]?.displayName ?? "Conversa"),
      isGroup:   !!conv.name,
      updatedAt: conv.updatedAt,
      lastMessage: lastMsg ? {
        content:  lastMsg.content,
        sender:   lastMsg.sender.displayName,
        sentAt:   lastMsg.createdAt,
      } : null,
      participants: conv.participants.map((p) => p.user),
      unread: !!unread,
    }
  })

  return NextResponse.json(conversations)
}

// POST — criar DM ou grupo
export async function POST(req: Request) {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { participantIds, name } = await req.json() as {
    participantIds: string[]
    name?:          string
  }

  if (!participantIds?.length) {
    return NextResponse.json({ error: "Informe ao menos um participante" }, { status: 400 })
  }

  // Para DMs, verifica se já existe conversa entre os dois
  const allIds = [...new Set([me.userId, ...participantIds])]
  if (!name && allIds.length === 2) {
    const existing = await prisma.conversation.findFirst({
      where: {
        name: null,
        participants: { every: { userId: { in: allIds } } },
      },
      include: { participants: true },
    })
    if (existing && existing.participants.length === 2) {
      return NextResponse.json({ id: existing.id, existing: true })
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      name:         name?.trim() ?? null,
      participants: {
        create: allIds.map((uid) => ({ userId: uid })),
      },
    },
    include: { participants: { include: { user: { select: { id: true, username: true, displayName: true } } } } },
  })

  return NextResponse.json(conversation, { status: 201 })
}
