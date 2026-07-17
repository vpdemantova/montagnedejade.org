import { NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { findAllAssets, createAsset } from "@/atlas/lib/db"
import { AssetKind } from "@/atlas/types"

function detectAssetKind(mimeType: string): string {
  if (mimeType.startsWith("image/")) return AssetKind.IMAGE
  if (mimeType.startsWith("audio/")) return AssetKind.AUDIO
  if (mimeType.startsWith("video/")) return AssetKind.VIDEO
  if (mimeType === "application/pdf") return AssetKind.PDF
  if (mimeType.startsWith("text/") || mimeType.includes("document") || mimeType.includes("msword")) return AssetKind.DOCUMENT
  return AssetKind.OTHER
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const assets = await findAllAssets({
      kind:   searchParams.get("kind")   ?? undefined,
      search: searchParams.get("q")      ?? undefined,
      limit:  Number(searchParams.get("limit") ?? 200),
      offset: Number(searchParams.get("offset") ?? 0),
    })
    return NextResponse.json(assets)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 })

    const kind      = detectAssetKind(file.type)
    const ext       = path.extname(file.name)
    const filename  = `${crypto.randomUUID()}${ext}`
    const kindDir   = kind.toLowerCase()
    const targetDir = path.join(process.cwd(), "public", "uploads", kindDir)

    await mkdir(targetDir, { recursive: true })
    await writeFile(path.join(targetDir, filename), Buffer.from(await file.arrayBuffer()))

    const asset = await createAsset({
      filename,
      originalName: file.name,
      kind,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      path: `/uploads/${kindDir}/${filename}`,
      title: (formData.get("title") as string) || undefined,
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
