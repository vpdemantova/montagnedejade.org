import { prisma } from "@/atlas/lib/db"

// ── Types ─────────────────────────────────────────────────────────────────────

export type RSSFeedWithItems = {
  id:       string
  url:      string
  label:    string
  area:     string
  isActive: boolean
  items:    RSSCacheItem[]
}

export type RSSCacheItem = {
  id:          string
  feedId:      string
  guid:        string
  title:       string
  link:        string
  summary:     string | null
  author:      string | null
  publishedAt: Date
  cachedAt:    Date
}

// ── Simple RSS XML parser ────────────────────────────────────────────────────

type ParsedItem = {
  guid:        string
  title:       string
  link:        string
  summary:     string
  author:      string
  publishedAt: Date
}

function parseRSSXml(xml: string, feedUrl: string): ParsedItem[] {
  const items: ParsedItem[] = []

  // Extract <item> or <entry> blocks
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1] ?? ""

    const get = (tag: string) => {
      const m = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, "i").exec(block)
      return (m?.[1] ?? m?.[2] ?? "").trim()
    }

    const getAttr = (tag: string, attr: string) => {
      const m = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i").exec(block)
      return m?.[1]?.trim() ?? ""
    }

    const title       = get("title")
    const link        = get("link") || getAttr("link", "href")
    const guid        = get("guid") || get("id") || link || `${feedUrl}-${title}`
    const summary     = get("description") || get("summary") || get("content")
    const author      = get("author") || get("dc:creator")
    const pubDateStr  = get("pubDate") || get("published") || get("updated")
    const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date()

    if (title && link) {
      items.push({ guid, title, link, summary, author, publishedAt })
    }
  }

  return items
}

// ── Fetch + cache a single feed ────────────────────────────────────────────────

export async function refreshFeed(feedId: string): Promise<number> {
  const feed = await prisma.rSSFeed.findUnique({ where: { id: feedId } })
  if (!feed || !feed.isActive) return 0

  let xml: string
  try {
    const res = await fetch(feed.url, {
      headers:  { "User-Agent": "Portal-Solar-RSS/1.0" },
      signal:   AbortSignal.timeout(10_000),
    })
    xml = await res.text()
  } catch {
    return 0
  }

  const parsed = parseRSSXml(xml, feed.url)
  let upserted = 0

  for (const item of parsed) {
    await prisma.rSSItem.upsert({
      where:  { guid: item.guid },
      update: { title: item.title, link: item.link, summary: item.summary, author: item.author },
      create: {
        feedId:      feedId,
        guid:        item.guid,
        title:       item.title,
        link:        item.link,
        summary:     item.summary || null,
        author:      item.author || null,
        publishedAt: item.publishedAt,
      },
    })
    upserted++
  }

  return upserted
}

// ── Refresh all active feeds ───────────────────────────────────────────────────

export async function refreshAllFeeds(): Promise<Record<string, number>> {
  const feeds = await prisma.rSSFeed.findMany({ where: { isActive: true } })
  const results: Record<string, number> = {}
  for (const feed of feeds) {
    results[feed.url] = await refreshFeed(feed.id)
  }
  return results
}

// ── Get cached items, newest first ────────────────────────────────────────────

export async function getCachedItems(limit = 50): Promise<RSSCacheItem[]> {
  return prisma.rSSItem.findMany({
    orderBy: { publishedAt: "desc" },
    take:    limit,
  })
}

// ── Get all feeds ─────────────────────────────────────────────────────────────

export async function getFeeds(): Promise<RSSFeedWithItems[]> {
  const feeds = await prisma.rSSFeed.findMany({
    include:  { items: { orderBy: { publishedAt: "desc" }, take: 5 } },
    orderBy:  { createdAt: "asc" },
  })
  return feeds as unknown as RSSFeedWithItems[]
}

// ── Seed default feeds (idempotent) ───────────────────────────────────────────

const DEFAULT_FEEDS = [
  { url: "https://feeds.feedburner.com/DesignMilk",         label: "Design Milk",    area: "ARTES"      },
  { url: "https://www.archdaily.com.br/br/feed",            label: "ArchDaily BR",   area: "OBRAS"      },
  { url: "https://rss.arxiv.org/rss/cs.AI",                 label: "arXiv CS.AI",    area: "ACADEMIA"   },
]

export async function seedDefaultFeeds() {
  for (const feed of DEFAULT_FEEDS) {
    await prisma.rSSFeed.upsert({
      where:  { url: feed.url },
      update: {},
      create: feed,
    })
  }
}
