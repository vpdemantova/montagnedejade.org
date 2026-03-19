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
      <div className="flex items-center justify-center h-60 border border-dashed border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest">
          Nenhum item encontrado
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 p-2">
      {items.map((item, i) => {
        const meta       = parseMetadata(item.metadata)
        const imageUrl   = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? meta.coverImage ?? "") as string
        const period     = meta.period as { start?: number; end?: number } | undefined
        const location   = (meta.location ?? meta.country ?? "") as string
        const areaLabel  = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
        const typeLabel  = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
        const isFav      = item.isFavorite || item.status === "FAVORITE"
        const initial    = item.title.charAt(0).toUpperCase()

        return (
          <article
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group cursor-pointer flex flex-col rounded-xl overflow-hidden transition-all duration-250 stagger-item animate-fade-up"
            style={{
              animationDelay: `${Math.min(i * 25, 400)}ms`,
              background: "rgb(var(--c-deep) / 0.6)",
              border: "1px solid rgb(var(--c-border) / 0.35)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 8px rgb(0 0 0 / 0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgb(0 0 0 / 0.5), 0 0 0 1px rgb(var(--c-accent) / 0.2)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgb(var(--c-accent) / 0.25)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgb(0 0 0 / 0.3)"
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgb(var(--c-border) / 0.35)"
            }}
          >
            {/* Imagem / placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0" style={{ background: "rgb(var(--c-surface) / 0.5)" }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="font-display text-5xl select-none transition-colors duration-300"
                    style={{ color: "rgb(var(--c-accent) / 0.2)" }}
                  >
                    {initial}
                  </span>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Area badge */}
              <span
                className="absolute top-2 left-2 text-[7px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                style={{
                  background: "rgb(var(--c-void) / 0.75)",
                  color: "rgb(var(--c-accent) / 0.8)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgb(var(--c-accent) / 0.15)",
                }}
              >
                {areaLabel}
              </span>

              {isFav && (
                <span
                  className="absolute top-2 right-2 text-[11px]"
                  style={{ color: "rgb(var(--c-accent))" }}
                >
                  ★
                </span>
              )}
            </div>

            {/* Body */}
            <div className="px-3 py-3 flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between gap-1">
                <h3
                  className="font-display text-sm leading-snug line-clamp-2 flex-1 transition-colors duration-200"
                  style={{ color: "rgb(var(--c-text))" }}
                >
                  {item.title}
                </h3>
              </div>

              <div className="flex flex-col gap-0.5 mt-auto">
                {period?.start !== undefined && (
                  <p className="text-[9px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
                    {period.start < 0 ? `${Math.abs(period.start)} a.C.` : period.start}
                    {period.end && period.end !== period.start ? ` — ${period.end > 0 ? period.end : `${Math.abs(period.end)} a.C.`}` : ""}
                  </p>
                )}
                {location && (
                  <p className="text-[9px] font-mono truncate" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
                    {location}
                  </p>
                )}
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 border-t" style={{ borderColor: "rgb(var(--c-border) / 0.2)" }}>
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[7px] font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                      style={{
                        background: "rgb(var(--c-border) / 0.3)",
                        color: "rgb(var(--c-muted) / 0.7)",
                      }}
                    >
                      {tag.name}
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
