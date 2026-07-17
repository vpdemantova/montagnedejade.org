import { NextResponse } from "next/server"
import { linkAsset, unlinkAsset } from "@/atlas/lib/db"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { id } = await params
  const { itemId, role } = (await request.json()) as { itemId?: string; role?: string }

  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 })
  }

  const link = await linkAsset(id, itemId, role)
  return NextResponse.json(link, { status: 201 })
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get("itemId")
  const role   = searchParams.get("role") ?? undefined

  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 })
  }

  await unlinkAsset(id, itemId, role)
  return NextResponse.json({ ok: true })
}
