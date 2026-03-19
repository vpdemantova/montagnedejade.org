import { NextResponse }              from "next/server"
import { prisma }                    from "@/atlas/lib/db"
import { refreshAllFeeds, getCachedItems, seedDefaultFeeds, getFeeds } from "@/atlas/lib/rss"

// GET /api/rss — returns feeds + recent cached items
export async function GET(req: Request) {
  await seedDefaultFeeds()

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("mode") ?? "items"

  if (mode === "feeds") {
    const feeds = await getFeeds()
    return NextResponse.json(feeds)
  }

  const limit = parseInt(searchParams.get("limit") ?? "50", 10)
  const items = await getCachedItems(limit)
  return NextResponse.json(items)
}

// POST /api/rss — add feed or trigger refresh
export async function POST(req: Request) {
  const body = await req.json() as { action?: string; url?: string; label?: string; area?: string }

  if (body.action === "refresh") {
    const results = await refreshAllFeeds()
    return NextResponse.json({ refreshed: results })
  }

  if (body.url) {
    const feed = await prisma.rSSFeed.upsert({
      where:  { url: body.url },
      update: { label: body.label ?? "", area: body.area ?? "ATLAS" },
      create: { url: body.url, label: body.label ?? "", area: body.area ?? "ATLAS" },
    })
    return NextResponse.json(feed)
  }

  return NextResponse.json({ error: "Missing url or action" }, { status: 400 })
}

// DELETE /api/rss?id=xxx — remove feed
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await prisma.rSSFeed.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
