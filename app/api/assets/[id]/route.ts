import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
import { findAssetById, removeAsset } from "@/atlas/lib/db"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const asset = await findAssetById(id)
  if (!asset) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(asset)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const asset = await findAssetById(id)
  if (!asset) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  await unlink(path.join(process.cwd(), "public", asset.path)).catch(() => {})
  await removeAsset(id)

  return NextResponse.json({ ok: true })
}
