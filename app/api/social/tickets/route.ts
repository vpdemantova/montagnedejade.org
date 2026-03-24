import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// GET — meus tickets
export async function GET() {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const tickets = await prisma.solarTicket.findMany({
      where:   { ownerId: me.userId },
      include: { giver: { select: { username: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(tickets)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST — enviar ticket para outro usuário
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { toUsername, ticketId, note } = await req.json() as {
      toUsername: string
      ticketId:   string
      note?:      string
    }

    // Verificar que o ticket pertence ao remetente e não foi usado
    const ticket = await prisma.solarTicket.findUnique({ where: { id: ticketId } })
    if (!ticket || ticket.ownerId !== me.userId) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }
    if (ticket.isUsed) {
      return NextResponse.json({ error: "Ticket já foi usado" }, { status: 400 })
    }

    const recipient = await prisma.user.findUnique({ where: { username: toUsername.toLowerCase() } })
    if (!recipient) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Transferir ticket
    const updated = await prisma.solarTicket.update({
      where: { id: ticketId },
      data:  {
        ownerId:  recipient.id,
        giverId:  me.userId,
        isUsed:   true,
        usedAt:   new Date(),
        note:     note ?? null,
        // Criar novo ticket do mesmo tipo para o destinatário
      },
    })

    // Criar cópia do ticket para o destinatário (ele recebe um ticket não-usado)
    await prisma.solarTicket.create({
      data: {
        ownerId: recipient.id,
        giverId: me.userId,
        type:    ticket.type,
        note:    note ?? null,
      },
    })

    return NextResponse.json({ ok: true, ticket: updated })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
