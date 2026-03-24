import { NextResponse } from "next/server"
import { findAll, create } from "@/atlas/lib/db"
import { writeMirror, resolveMirrorRelPath } from "@/atlas/lib/mirror"
import type { AtlasFilterOptions } from "@/atlas/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const tagParam = searchParams.get("tag")
    const options: AtlasFilterOptions = {
      area:   (searchParams.get("area")   ?? undefined) as AtlasFilterOptions["area"],
      type:   (searchParams.get("type")   ?? undefined) as AtlasFilterOptions["type"],
      status: (searchParams.get("status") ?? undefined) as AtlasFilterOptions["status"],
      search: searchParams.get("q")      ?? undefined,
      tags:   tagParam ? [tagParam] : undefined,
      limit:  Number(searchParams.get("limit") ?? 100),
      offset: Number(searchParams.get("offset") ?? 0),
    }

    const items = await findAll(options)
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Parameters<typeof create>[0]
    const item = await create(body)

    // Escreve o espelho .md apenas em desenvolvimento (Vercel filesystem é read-only)
    if (process.env.NODE_ENV !== "production") {
      await writeMirror(item, "").catch(console.error)

      const contentPath = resolveMirrorRelPath(item)
      if (!item.contentPath) {
        void import("@/atlas/lib/db")
          .then(({ update }) => update(item.id, { contentPath }))
          .catch(console.error)
      }
    }

    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
