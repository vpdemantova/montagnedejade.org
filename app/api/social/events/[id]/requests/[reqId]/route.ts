import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

type Params = { params: Promise<{ id: string; reqId: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// PATCH — host aceita ou rejeita pedido
export async function PATCH(req: Request, { params }: Params) {
  const { id, reqId } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const event = await prisma.event.findUnique({ where: { id }, select: { hostId: true, maxGuests: true } })
  if (!event) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
  if (event.hostId !== me.userId) return NextResponse.json({ error: "Proibido" }, { status: 403 })

  const { status } = await req.json() as { status: "ACCEPTED" | "REJECTED" }
  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 })
  }

  // Se aceitar, verificar vagas
  if (status === "ACCEPTED") {
    const accepted = await prisma.eventRequest.count({ where: { eventId: id, status: "ACCEPTED" } })
    if (accepted >= event.maxGuests) return NextResponse.json({ error: "Evento lotado" }, { status: 400 })
  }

  const updated = await prisma.eventRequest.update({
    where: { id: reqId },
    data:  { status },
  })

  return NextResponse.json(updated)
}
