import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  const [items, relations, areaCounts] = await Promise.all([
    prisma.atlasItem.findMany({
      select: {
        id:           true,
        title:        true,
        type:         true,
        area:         true,
        relationsFrom: { select: { toItemId: true } },
        relationsTo:   { select: { fromItemId: true } },
      },
    }),
    prisma.atlasRelation.findMany({
      select: { fromItemId: true, toItemId: true },
    }),
    prisma.atlasItem.groupBy({
      by:     ["area"],
      _count: { _all: true },
    }),
  ])

  const totalByArea: Record<string, number> = Object.fromEntries(
    areaCounts.map((c: { area: string; _count: { _all: number } }) => [c.area, c._count._all])
  )

  const itemsOut = items.map((item: {
    id:            string
    title:         string
    type:          string
    area:          string
    relationsFrom: { toItemId: string }[]
    relationsTo:   { fromItemId: string }[]
  }) => ({
    id:             item.id,
    title:          item.title,
    type:           item.type,
    area:           item.area,
    relationsCount: item.relationsFrom.length + item.relationsTo.length,
  }))

  const relationsOut = relations.map((r: { fromItemId: string; toItemId: string }) => ({
    fromId: r.fromItemId,
    toId:   r.toItemId,
  }))

  return NextResponse.json({
    total:       items.length,
    totalByArea,
    items:       itemsOut,
    relations:   relationsOut,
  })
}
