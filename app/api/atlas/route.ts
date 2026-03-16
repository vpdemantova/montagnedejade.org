import { NextResponse } from "next/server"
import { findAll, create } from "@/atlas/lib/db"
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
  return NextResponse.json(item, { status: 201 })
}
