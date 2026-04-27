import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// POST — enviar mensagem numa conversa
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: me.userId } },
  })
  if (!membership) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { content } = await req.json() as { content: string }
  if (!content?.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data:    { conversationId: id, senderId: me.userId, content: content.trim() },
      include: { sender: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
    }),
    prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
  ])

  return NextResponse.json(message, { status: 201 })
}
