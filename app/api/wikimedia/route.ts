import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get("title")
  if (!title) return NextResponse.json(null, { status: 400 })

  for (const lang of ["en", "pt"]) {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      const res = await fetch(url, {
        headers: { "User-Agent": "PortalSolar/1.0 (educational; vitordemantova@gmail.com)" },
        signal: AbortSignal.timeout(4000),
      })
      if (!res.ok) continue

      const data = await res.json() as {
        title?:         string
        description?:   string
        extract?:       string
        thumbnail?:     { source?: string }
        originalimage?: { source?: string }
        content_urls?:  { desktop?: { page?: string } }
      }

      const imageUrl = data.originalimage?.source ?? data.thumbnail?.source ?? null

      return NextResponse.json(
        {
          title:       data.title ?? title,
          description: data.description ?? "",
          extract:     data.extract ?? "",
          imageUrl,
          pageUrl:     data.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" } }
      )
    } catch { continue }
  }

  return NextResponse.json(null)
}
