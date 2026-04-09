"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function parseMetadata(raw?: string | null) {
  if (!raw) return {} as Record<string, unknown>
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

function itemCode(id: string) {
  const n = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
  return `SOL-${n.toString().padStart(3, "0")}`
}

export function AtlasGalleryView({ items, onItemClick }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 border-t border-solar-border/20">
        <p className="editorial-label text-solar-muted/30">Nenhum item encontrado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {items.map((item, i) => {
        const meta      = parseMetadata(item.metadata)
        const imageUrl  = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? meta.coverImage ?? "") as string
        const period    = meta.period as { start?: number; end?: number } | undefined
        const location  = (meta.location ?? meta.country ?? "") as string
        const areaLabel = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
        const isFav     = item.isFavorite || item.status === "FAVORITE"
        const initial   = item.title.charAt(0).toUpperCase()
        const code      = itemCode(item.id)

        return (
          <article
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group cursor-pointer flex flex-col border-r border-b border-solar-border/20 hover:bg-solar-surface/20 transition-colors duration-150 overflow-hidden"
            style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
          >
            {/* Imagem / placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0 bg-solar-surface/30">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-5xl select-none text-solar-text/08">
                    {initial}
                  </span>
                </div>
              )}

              {/* Area badge — top left, hard edge */}
              <span className="absolute top-2 left-2 font-mono text-[7px] uppercase tracking-widest px-1.5 py-0.5 bg-solar-void/80 text-solar-muted/60 border border-solar-border/25">
                {areaLabel}
              </span>

              {/* Code — bottom right */}
              <span className="absolute bottom-1.5 right-2 font-mono text-[7px] text-solar-muted/20">
                {code}
              </span>

              {isFav && (
                <span className="absolute top-2 right-2 text-[10px] text-solar-accent/60">★</span>
              )}
            </div>

            {/* Body */}
            <div className="px-3 py-3 flex flex-col gap-1.5 flex-1 border-t border-solar-border/15">
              <h3 className="font-display text-[13px] leading-snug text-solar-text/90 group-hover:text-solar-text transition-colors line-clamp-2">
                {item.title}
              </h3>

              <div className="flex flex-col gap-0.5 mt-auto">
                {period?.start !== undefined && (
                  <p className="font-mono text-[8px] text-solar-muted/40">
                    {period.start < 0 ? `${Math.abs(period.start)} a.C.` : period.start}
                    {period.end && period.end !== period.start
                      ? ` — ${period.end > 0 ? period.end : `${Math.abs(period.end)} a.C.`}`
                      : ""}
                  </p>
                )}
                {location && (
                  <p className="font-mono text-[8px] text-solar-muted/35 truncate">{location}</p>
                )}
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t border-solar-border/15">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="font-mono text-[7px] text-solar-muted/45 px-1.5 py-0.5 border border-solar-border/20"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
