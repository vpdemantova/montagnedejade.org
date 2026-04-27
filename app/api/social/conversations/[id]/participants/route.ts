import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// POST — adicionar participante a um grupo
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: me.userId } },
  })
  if (!membership) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const conv = await prisma.conversation.findUnique({ where: { id }, select: { name: true } })
  if (!conv?.name) return NextResponse.json({ error: "Só é possível adicionar participantes em grupos" }, { status: 400 })

  const { userId } = await req.json() as { userId: string }
  if (!userId) return NextResponse.json({ error: "userId obrigatório" }, { status: 400 })

  const participant = await prisma.conversationParticipant.upsert({
    where:  { conversationId_userId: { conversationId: id, userId } },
    create: { conversationId: id, userId },
    update: {},
    include: { user: { select: { id: true, username: true, displayName: true } } },
  })

  return NextResponse.json(participant, { status: 201 })
}
