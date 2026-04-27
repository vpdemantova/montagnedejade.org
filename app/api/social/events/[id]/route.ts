import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — detalhe do evento; address só para participantes ACCEPTED
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()

  const event = await prisma.event.findUnique({
    where:   { id },
    include: {
      host:     { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
      requests: {
        include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })

  const isHost     = me?.userId === event.hostId
  const myRequest  = event.requests.find((r) => r.userId === me?.userId)
  const isAccepted = isHost || myRequest?.status === "ACCEPTED"

  const accepted = event.requests.filter((r) => r.status === "ACCEPTED").length
  const evTags: string[] = JSON.parse(event.tags || "[]") as string[]

  return NextResponse.json({
    id:           event.id,
    title:        event.title,
    description:  event.description,
    date:         event.date,
    city:         event.city,
    neighborhood: event.neighborhood,
    // endereço privado
    address:      isAccepted ? event.address : null,
    maxGuests:    event.maxGuests,
    spotsLeft:    Math.max(0, event.maxGuests - accepted),
    status:       event.status,
    tags:         evTags,
    host:         event.host,
    isHost,
    myRequestStatus: myRequest?.status ?? null,
    // host vê todos os pedidos; participante vê só os aceitos
    requests: isHost
      ? event.requests
      : event.requests.filter((r) => r.status === "ACCEPTED"),
  })
}

// PATCH — host edita/cancela
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id }, select: { hostId: true } })
  if (!event) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  if (event.hostId !== me.userId) return NextResponse.json({ error: "Proibido" }, { status: 403 })

  const body = await req.json() as Partial<{
    title: string; description: string; date: string; city: string
    neighborhood: string; address: string; maxGuests: number; tags: string[]; status: string
  }>

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(body.title        ? { title: body.title.trim() }               : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() ?? null } : {}),
      ...(body.date         ? { date: new Date(body.date) }              : {}),
      ...(body.city !== undefined         ? { city: body.city?.trim() ?? null }          : {}),
      ...(body.neighborhood !== undefined ? { neighborhood: body.neighborhood?.trim() ?? null } : {}),
      ...(body.address !== undefined      ? { address: body.address?.trim() ?? null }    : {}),
      ...(body.maxGuests    ? { maxGuests: Math.min(body.maxGuests, 20) } : {}),
      ...(body.tags         ? { tags: JSON.stringify(body.tags.map((t) => t.toLowerCase())) } : {}),
      ...(body.status       ? { status: body.status }                    : {}),
    },
  })

  return NextResponse.json(updated)
}
