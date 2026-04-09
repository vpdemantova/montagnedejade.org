import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// GET /api/atlas/tags?q=query — retorna tags para autocomplete
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim() ?? ""

  const tags = await prisma.tag.findMany({
    where:   q ? { name: { contains: q } } : undefined,
    orderBy: { items: { _count: "desc" } },
    take:    30,
    select:  { id: true, name: true, _count: { select: { items: true } } },
  })

  return NextResponse.json(tags)
}
