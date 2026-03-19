import { NextResponse } from "next/server"
import { findAll, create } from "@/atlas/lib/db"
import { writeMirror, resolveMirrorRelPath } from "@/atlas/lib/mirror"
import type { AtlasFilterOptions } from "@/atlas/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const options: AtlasFilterOptions = {
    area:   (searchParams.get("area")   ?? undefined) as AtlasFilterOptions["area"],
    type:   (searchParams.get("type")   ?? undefined) as AtlasFilterOptions["type"],
    status: (searchParams.get("status") ?? undefined) as AtlasFilterOptions["status"],
    search: searchParams.get("q")      ?? undefined,
    limit:  Number(searchParams.get("limit") ?? 100),
    offset: Number(searchParams.get("offset") ?? 0),
  }

  const items = await findAll(options)
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = (await request.json()) as Parameters<typeof create>[0]
  const item = await create(body)

  // Escreve o espelho .md imediatamente
  await writeMirror(item, "").catch(console.error)

  // Atualiza contentPath no banco (sem re-fetch, só update path)
  const contentPath = resolveMirrorRelPath(item)
  if (!item.contentPath) {
    // Fire-and-forget — não bloqueia a resposta
    void import("@/atlas/lib/db")
      .then(({ update }) => update(item.id, { contentPath }))
      .catch(console.error)
  }

  return NextResponse.json(item, { status: 201 })
}
