import Link from "next/link"
import { findRecent, findAll, countByArea, findAllNotices } from "@/atlas/lib/db"
import type { AtlasItemWithTags, WorldNotice } from "@/atlas/types"
import { AREA_LABELS } from "@/atlas/types"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Hub — Portal Solar",
}

function getDailyDiscovery<T>(items: T[]): T | null {
  if (!items.length) return null
  const today = new Date().toISOString().split("T")[0]!
  const seed  = today.replace(/-/g, "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return items[seed % items.length]!
}

function shortDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return "BOM DIA"
  if (h >= 12 && h < 18) return "BOA TARDE"
  return "BOA NOITE"
}

function RecentRow({ item, index }: { item: AtlasItemWithTags; index: number }) {
  const areaLabel = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
  return (
    <Link
      href={`/atlas/${item.slug ?? item.id}`}
      className="group flex items-baseline gap-4 border-b border-solar-border/20 py-3 hover:bg-solar-surface/20 transition-colors"
    >
      <span className="font-mono text-[10px] text-solar-muted/25 flex-shrink-0 w-6 text-right">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-display text-[13px] text-solar-text group-hover:opacity-70 transition-opacity flex-1 min-w-0 truncate">
        {item.title}
      </span>
      <span className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/35 hidden sm:block flex-shrink-0">
        {areaLabel}
      </span>
      <span className="font-mono text-[8px] text-solar-muted/30 flex-shrink-0 hidden md:block">
        {shortDate(item.updatedAt)}
      </span>
    </Link>
  )
}

function NoticeChip({ notice }: { notice: WorldNotice }) {
  return (
    <div className="bento-block flex-shrink-0 w-72 flex flex-col gap-2">
      <span className="editorial-label text-solar-muted/40">{notice.area} · {notice.type}</span>
      <p className="font-display text-[13px] leading-snug text-solar-text line-clamp-3">{notice.title}</p>
      {notice.author && (
        <span className="font-mono text-[8px] text-solar-muted/35 mt-auto">— {notice.author}</span>
      )}
    </div>
  )
}

export default async function HubPage() {
  const [recentItems, allItems, areaCounts, notices] = await Promise.all([
    findRecent(8).catch(() => []),
    findAll({ limit: 200 }).catch(() => []),
    countByArea().catch(() => ({} as Record<string, number>)),
    findAllNotices(12).catch(() => []),
  ])

  const portalItems   = allItems.filter((i) => i.hemisphere === "PORTAL")
  const discovery     = getDailyDiscovery(portalItems)
  const totalItems    = Object.values(areaCounts).reduce((a, b) => a + b, 0)
  const greeting      = getGreeting()

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  const areaRows = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="min-h-screen">

      {/* ── Row 1: Headline + data ── */}
      <div className="border-b border-solar-border/30 py-10">
        <div className="page-wide">
          <p className="editorial-label text-solar-muted/40 mb-3">PORTAL SOLAR / {new Date().getFullYear()}</p>
          <h1 className="page-hero text-solar-text mb-4">{greeting}</h1>
          <p className="font-mono text-[10px] text-solar-muted/40 capitalize">{today}</p>
        </div>
      </div>

      {/* ── Row 2: Descoberta + Estatísticas ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-solar-border/30">

        {/* Descoberta do dia — 2/3 */}
        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-solar-border/30 p-6">
          <p className="editorial-label text-solar-muted/40 mb-4">DESCOBERTA DO DIA</p>
          {discovery ? (
            <Link href={`/atlas/${discovery.slug ?? discovery.id}`} className="group block">
              <h2 className="font-display text-[clamp(1.5rem,5vw,3rem)] leading-tight text-solar-text group-hover:opacity-70 transition-opacity mb-3">
                {discovery.title}
              </h2>
              <div className="flex items-center gap-4">
                <span className="editorial-label text-solar-muted/35">
                  {AREA_LABELS[discovery.area as keyof typeof AREA_LABELS] ?? discovery.area}
                </span>
                <span className="font-mono text-[8px] text-solar-muted/25">{shortDate(discovery.updatedAt)}</span>
              </div>
            </Link>
          ) : (
            <p className="font-mono text-[11px] text-solar-muted/30">Nenhum item encontrado.</p>
          )}
        </div>

        {/* Estatísticas — 1/3 */}
        <div className="p-6 flex flex-col gap-5">
          <p className="editorial-label text-solar-muted/40">ACERVO</p>

          {/* Total */}
          <div className="border-b border-solar-border/20 pb-4">
            <span className="font-display text-[clamp(2rem,6vw,4rem)] leading-none text-solar-text">
              {totalItems.toLocaleString("pt-BR")}
            </span>
            <p className="editorial-label text-solar-muted/35 mt-1">ITENS CATALOGADOS</p>
          </div>

          {/* Por área */}
          <div className="flex flex-col gap-2">
            {areaRows.map(([area, count]) => (
              <div key={area} className="flex items-baseline justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-solar-muted/45">
                  {AREA_LABELS[area as keyof typeof AREA_LABELS] ?? area}
                </span>
                <span className="font-mono text-[10px] text-solar-text/50">{count}</span>
              </div>
            ))}
          </div>

          <Link
            href="/atlas"
            className="mt-auto font-mono text-[9px] uppercase tracking-[0.2em] text-solar-muted/40 hover:text-solar-text transition-colors"
          >
            Ver Atlas →
          </Link>
        </div>
      </div>

      {/* ── Row 3: Recentes ── */}
      <div className="border-b border-solar-border/30">
        <div className="page-wide flex items-center justify-between py-4 border-b border-solar-border/15">
          <p className="editorial-label text-solar-muted/40">ADICIONADOS RECENTEMENTE</p>
          <Link href="/atlas" className="font-mono text-[8px] uppercase tracking-[0.2em] text-solar-muted/30 hover:text-solar-text transition-colors">
            Ver todos →
          </Link>
        </div>
        {recentItems.map((item, i) => (
          <RecentRow key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* ── Row 4: Notices ── */}
      {notices.length > 0 && (
        <div className="border-b border-solar-border/30">
          <div className="page-wide py-4 border-b border-solar-border/15">
            <p className="editorial-label text-solar-muted/40">AVISOS & NOTÍCIAS</p>
          </div>
          <div className="flex gap-0 overflow-x-auto scrollbar-hide divide-x divide-solar-border/20">
            {notices.map((notice) => (
              <NoticeChip key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="page-wide py-10 border-t border-solar-border/15">
        <p className="font-mono text-[9px] text-solar-muted/25 tracking-[0.2em] uppercase">
          ☀ Portal Solar · MMXX–MMXXVI · Vitor de Mantova
        </p>
      </footer>

    </div>
  )
}
