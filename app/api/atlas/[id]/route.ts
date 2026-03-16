import { NextResponse } from "next/server"
import { findById, update, remove } from "@/atlas/lib/db"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const item = await findById(params.id)
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(request: Request, { params }: Params) {
  const body = (await request.json()) as Parameters<typeof update>[1]
  const item = await update(params.id, body)
  return NextResponse.json(item)
}

export async function DELETE(_req: Request, { params }: Params) {
  await remove(params.id)
  return NextResponse.json({ ok: true })
}
