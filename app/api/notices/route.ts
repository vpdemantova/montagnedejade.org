import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// GET /api/notices?limit=50
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100)

  const notices = await prisma.worldNotice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take:    limit,
  })

  return NextResponse.json(notices)
}

// POST /api/notices — cria nova WorldNotice
export async function POST(req: Request) {
  const body = await req.json() as {
    title:      string
    body:       string
    type?:      string
    area?:      string
    author?:    string
    sourceUrl?: string
    isPinned?:  boolean
  }

  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 })
  }

  const notice = await prisma.worldNotice.create({
    data: {
      title:     body.title.trim(),
      body:      body.body.trim(),
      type:      body.type      ?? "AVISO",
      area:      body.area      ?? "ATLAS",
      author:    body.author    ?? null,
      sourceUrl: body.sourceUrl ?? null,
      isPinned:  body.isPinned  ?? false,
    },
  })

  return NextResponse.json(notice, { status: 201 })
}

// PATCH /api/notices — atualiza por id
export async function PATCH(req: Request) {
  const { id, ...data } = await req.json() as { id: string } & Record<string, unknown>
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  const notice = await prisma.worldNotice.update({ where: { id }, data })
  return NextResponse.json(notice)
}

// DELETE /api/notices?id=xxx
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await prisma.worldNotice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
