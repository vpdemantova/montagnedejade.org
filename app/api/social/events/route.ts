import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — lista eventos públicos, com matching por tags do usuário
export async function GET(req: Request) {
  const me = await getMe()
  const { searchParams } = new URL(req.url)
  const city   = searchParams.get("city")   ?? undefined
  const tagFilter = searchParams.get("tag") ?? undefined

  const events = await prisma.event.findMany({
    where: {
      status: { in: ["OPEN", "CLOSED"] },
      ...(city ? { city: { contains: city } } : {}),
    },
    include: {
      host:     { select: { id: true, username: true, displayName: true, avatarUrl: true, accentColor: true } },
      requests: { select: { status: true } },
    },
    orderBy: { date: "asc" },
    take: 50,
  })

  // Tags do usuário logado para calcular score de matching
  let myTags: string[] = []
  if (me) {
    const rows = await prisma.userTag.findMany({ where: { userId: me.userId }, select: { tag: true } })
    myTags = rows.map((r) => r.tag)
  }

  const result = events
    .map((ev) => {
      const evTags: string[] = JSON.parse(ev.tags || "[]") as string[]
      const common = myTags.filter((t) => evTags.includes(t))
      const accepted = ev.requests.filter((r) => r.status === "ACCEPTED").length
      return {
        id:           ev.id,
        title:        ev.title,
        description:  ev.description,
        date:         ev.date,
        city:         ev.city,
        neighborhood: ev.neighborhood,
        maxGuests:    ev.maxGuests,
        status:       ev.status,
        tags:         evTags,
        host:         ev.host,
        spotsLeft:    Math.max(0, ev.maxGuests - accepted),
        recommended:  common.length > 0,
        commonTags:   common,
      }
    })
    .filter((ev) => !tagFilter || ev.tags.includes(tagFilter.toLowerCase()))
    .sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))

  return NextResponse.json(result)
}

// POST — criar evento
export async function POST(req: Request) {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { title, description, date, city, neighborhood, address, maxGuests, tags } =
    await req.json() as {
      title:        string
      description?: string
      date:         string
      city?:        string
      neighborhood?: string
      address?:     string
      maxGuests?:   number
      tags?:        string[]
    }

  if (!title?.trim() || !date) {
    return NextResponse.json({ error: "Título e data são obrigatórios" }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      hostId:       me.userId,
      title:        title.trim(),
      description:  description?.trim() ?? null,
      date:         new Date(date),
      city:         city?.trim() ?? null,
      neighborhood: neighborhood?.trim() ?? null,
      address:      address?.trim() ?? null,
      maxGuests:    Math.min(maxGuests ?? 6, 20),
      tags:         JSON.stringify((tags ?? []).map((t) => t.toLowerCase())),
    },
    include: { host: { select: { username: true, displayName: true } } },
  })

  return NextResponse.json(event, { status: 201 })
}
