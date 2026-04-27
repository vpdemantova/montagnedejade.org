import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — lista pedidos (só o host vê todos; participante vê o próprio)
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id }, select: { hostId: true } })
  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

  const where = event.hostId === me.userId
    ? { eventId: id }
    : { eventId: id, userId: me.userId }

  const requests = await prisma.eventRequest.findMany({
    where,
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(requests)
}

// POST — pedir para participar
export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const event = await prisma.event.findUnique({
    where:  { id },
    select: { hostId: true, maxGuests: true, status: true },
  })
  if (!event)          return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
  if (event.status !== "OPEN") return NextResponse.json({ error: "Evento fechado" }, { status: 400 })
  if (event.hostId === me.userId) return NextResponse.json({ error: "Você é o host" }, { status: 400 })

  // Verifica vagas
  const accepted = await prisma.eventRequest.count({ where: { eventId: id, status: "ACCEPTED" } })
  if (accepted >= event.maxGuests) return NextResponse.json({ error: "Evento lotado" }, { status: 400 })

  const { note } = await req.json() as { note?: string }

  const request = await prisma.eventRequest.upsert({
    where:  { eventId_userId: { eventId: id, userId: me.userId } },
    create: { eventId: id, userId: me.userId, note: note?.trim() ?? null, status: "PENDING" },
    update: { note: note?.trim() ?? null, status: "PENDING" },
  })

  return NextResponse.json(request, { status: 201 })
}
