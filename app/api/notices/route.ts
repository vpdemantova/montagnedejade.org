import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// GET /api/notices?limit=50 — público
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100)

  const notices = await prisma.worldNotice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take:    limit,
  })

  return NextResponse.json(notices)
}

// POST /api/notices — requer autenticação (não-convidado)
export async function POST(req: Request) {
  try {
    const token   = cookies().get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.guest) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }

    const body = await req.json() as {
      title:      string
      body:       string
      type?:      string
      area?:      string
      author?:    string
      sourceUrl?: string
      isPinned?:  boolean
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Título obrigatório" }, { status: 400 })
    }

    const notice = await prisma.worldNotice.create({
      data: {
        title:     body.title.trim(),
        body:      body.body?.trim() ?? "",
        type:      body.type      ?? "AVISO",
        area:      body.area      ?? "ATLAS",
        author:    body.author    ?? null,
        sourceUrl: body.sourceUrl ?? null,
        isPinned:  body.isPinned  ?? false,
      },
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// PATCH /api/notices — requer autenticação
export async function PATCH(req: Request) {
  try {
    const token   = cookies().get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.guest) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }

    const { id, ...data } = await req.json() as { id: string } & Record<string, unknown>
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const notice = await prisma.worldNotice.update({ where: { id }, data })
    return NextResponse.json(notice)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// DELETE /api/notices?id=xxx — requer autenticação
export async function DELETE(req: Request) {
  try {
    const token   = cookies().get("ps_session")?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || payload.guest) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    await prisma.worldNotice.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
