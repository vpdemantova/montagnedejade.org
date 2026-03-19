import { NextResponse } from "next/server"
import { findBySlug, update, remove } from "@/atlas/lib/db"
import { writeMirror, deleteMirror } from "@/atlas/lib/mirror"

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params
  const item = await findBySlug(slug)
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params
  const item = await findBySlug(slug)
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  const body = (await request.json()) as Parameters<typeof update>[1] & {
    markdownMirror?: string
    contentPath?:   string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { markdownMirror, contentPath: _contentPath, ...updateFields } = body
  const updated = await update(item.id, updateFields)

  await writeMirror(updated, markdownMirror ?? "").catch(console.error)

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { slug } = await params
  const item = await findBySlug(slug)
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  await deleteMirror(item).catch(console.error)
  await remove(item.id)
  return NextResponse.json({ ok: true })
}
