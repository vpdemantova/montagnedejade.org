"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import { CoverImage } from "@/atlas/components/ui/CoverImage"

type ItemCardProps = {
  item:     AtlasItemWithTags
  onClick?: (item: AtlasItemWithTags) => void
  variant?: "grid" | "list"
  index?:   number
}

function itemCode(id: string): string {
  const n = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
  return `SOL-${n.toString().padStart(3, "0")}`
}

function parseMetadata(raw?: string | null) {
  if (!raw) return {} as Record<string, unknown>
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

function shortDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

// ── Grid variant ──────────────────────────────────────────────────────────────

function GridCard({ item, onClick }: { item: AtlasItemWithTags; onClick?: (item: AtlasItemWithTags) => void }) {
  const areaLabel = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
  const typeLabel = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
  const code      = itemCode(item.id)
  const meta      = parseMetadata(item.metadata)
  const imageUrl  = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? meta.coverImage ?? "") as string

  return (
    <article
      onClick={() => onClick?.(item)}
      className="group border border-solar-border/25 rounded-[6px] bg-solar-deep/50 px-4 py-4 cursor-pointer
        hover:bg-solar-deep/70 hover:border-solar-border/50
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]
        transition-all duration-200"
    >
      {/* Cover image / placeholder generativo */}
      <div className="aspect-[3/1] overflow-hidden mb-3 rounded-[4px]">
        <CoverImage
          src={imageUrl}
          alt={item.title}
          name={item.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-95 transition-opacity duration-300"
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between mb-2">
        <span className="editorial-label text-solar-muted/50">
          {areaLabel}
          <span className="mx-1.5 opacity-40">·</span>
          {typeLabel}
        </span>
        <span className="font-mono text-[9px] text-solar-muted/25">{code}</span>
      </div>

      {/* Title */}
      <h3 className="font-display text-[17px] leading-tight text-solar-text group-hover:opacity-90 transition-opacity mb-3 line-clamp-3">
        {item.title}
      </h3>

      {/* Tags + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag.id}
              className="font-mono text-[7.5px] text-solar-muted/55 border border-solar-border/25 px-1.5 py-0.5 rounded-sm">
              #{tag.name}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="font-mono text-[7.5px] text-solar-muted/30 border border-solar-border/20 px-1.5 py-0.5 rounded-sm">
              +{item.tags.length - 2}
            </span>
          )}
        </div>
        <span className="font-mono text-[8px] text-solar-muted/35 flex-shrink-0">
          {shortDate(item.updatedAt)}
        </span>
      </div>
    </article>
  )
}

// ── List variant ──────────────────────────────────────────────────────────────

function ListRow({ item, onClick, index }: { item: AtlasItemWithTags; onClick?: (item: AtlasItemWithTags) => void; index?: number }) {
  const areaLabel = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
  const typeLabel = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
  const code      = itemCode(item.id)

  return (
    <article
      onClick={() => onClick?.(item)}
      className="group flex items-baseline gap-4 border-b border-solar-border/20 py-3 cursor-pointer hover:bg-solar-surface/20 transition-colors duration-150"
    >
      {/* Sequence number */}
      <span className="font-mono text-[10px] text-solar-muted/25 flex-shrink-0 w-8 text-right">
        {index !== undefined ? String(index + 1).padStart(2, "0") : code}
      </span>

      {/* Title */}
      <span className="font-display text-[13px] leading-snug text-solar-text group-hover:opacity-80 transition-opacity flex-1 min-w-0 truncate">
        {item.title}
      </span>

      {/* Area */}
      <span className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/40 hidden sm:block flex-shrink-0 w-20 text-right">
        {areaLabel}
      </span>

      {/* Type */}
      <span className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/30 hidden md:block flex-shrink-0 w-16 text-right">
        {typeLabel}
      </span>

      {/* Date */}
      <span className="font-mono text-[8px] text-solar-muted/30 flex-shrink-0 w-14 text-right hidden lg:block">
        {shortDate(item.updatedAt)}
      </span>
    </article>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function ItemCard({ item, onClick, variant = "grid", index }: ItemCardProps) {
  if (variant === "list") {
    return <ListRow item={item} onClick={onClick} index={index} />
  }
  return <GridCard item={item} onClick={onClick} />
}
