import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { ALL_SEED_ITEMS } from "@/atlas/scripts/seed-data"

// ── GET — preview do que será inserido ───────────────────────────────────────
export async function GET() {
  const byArea: Record<string, number> = {}
  for (const item of ALL_SEED_ITEMS) {
    byArea[item.area] = (byArea[item.area] ?? 0) + 1
  }
  return NextResponse.json({ total: ALL_SEED_ITEMS.length, byArea })
}

// ── POST — executa o seed ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret")
  if (secret !== (process.env.SEED_SECRET ?? "portalsolar-seed")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = { inserted: 0, updated: 0, errors: 0, total: ALL_SEED_ITEMS.length }
  const BATCH   = 20

  for (let i = 0; i < ALL_SEED_ITEMS.length; i += BATCH) {
    const batch = ALL_SEED_ITEMS.slice(i, i + BATCH)

    await Promise.allSettled(
      batch.map(async (item) => {
        try {
          const exists = await prisma.atlasItem.findFirst({
            where:  { title: item.title, area: item.area },
            select: { id: true },
          })

          if (exists) {
            await prisma.atlasItem.update({
              where: { id: exists.id },
              data: {
                type:       item.type,
                isFavorite: item.isFavorite ?? false,
                metadata:   item.metadata ? JSON.stringify(item.metadata) : undefined,
              },
            })
            results.updated++
          } else {
            // Gera slug único
            const base = item.title
              .toLowerCase()
              .normalize("NFD").replace(/[̀-ͯ]/g, "")
              .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

            let slug = base
            let n    = 1
            while (await prisma.atlasItem.findUnique({ where: { slug } })) {
              slug = `${base}-${n++}`
            }

            await prisma.atlasItem.create({
              data: {
                title:      item.title,
                area:       item.area,
                type:       item.type,
                status:     "ACTIVE",
                hemisphere: "PORTAL",
                isFavorite: item.isFavorite ?? false,
                metadata:   item.metadata ? JSON.stringify(item.metadata) : null,
                slug,
              },
            })
            results.inserted++
          }
        } catch {
          results.errors++
        }
      })
    )
  }

  return NextResponse.json(results)
}
