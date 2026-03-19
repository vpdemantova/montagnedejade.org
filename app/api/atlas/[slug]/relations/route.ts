import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// Aceita tanto slug quanto id (UUID) para retrocompatibilidade
async function findItem(slugOrId: string) {
  return prisma.atlasItem.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
  })
}

const INCLUDE_ITEMS = {
  fromItem: { select: { id: true, title: true, type: true, area: true } },
  toItem:   { select: { id: true, title: true, type: true, area: true } },
} as const

// GET /api/atlas/[slug]/relations
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const item = await findItem(params.slug)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const relations = await prisma.atlasRelation.findMany({
    where:   { OR: [{ fromItemId: item.id }, { toItemId: item.id }] },
    include: INCLUDE_ITEMS,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(relations)
}

// POST /api/atlas/[slug]/relations — cria relação
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const item = await findItem(params.slug)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { toItemId, relationType } = await req.json() as {
    toItemId:     string
    relationType: string
  }

  if (!toItemId || !relationType) {
    return NextResponse.json({ error: "toItemId and relationType required" }, { status: 400 })
  }

  // Evita duplicata exata
  const existing = await prisma.atlasRelation.findFirst({
    where:   { fromItemId: item.id, toItemId, relationType },
    include: INCLUDE_ITEMS,
  })
  if (existing) return NextResponse.json(existing)

  const relation = await prisma.atlasRelation.create({
    data:    { fromItemId: item.id, toItemId, relationType },
    include: INCLUDE_ITEMS,
  })

  return NextResponse.json(relation, { status: 201 })
}

// DELETE /api/atlas/[slug]/relations?relationId=xxx
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const relationId = searchParams.get("relationId")
  if (!relationId) {
    return NextResponse.json({ error: "relationId required" }, { status: 400 })
  }

  await prisma.atlasRelation.delete({ where: { id: relationId } })
  return NextResponse.json({ ok: true })
}
