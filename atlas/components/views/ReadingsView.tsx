"use client"

import type { AtlasItemWithTags } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function parseMetadata(raw?: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

const READING_STATUS = {
  BACKLOG:   "Quero ler",
  ACTIVE:    "Lendo",
  COMPLETED: "Lido",
  FAVORITE:  "Relendo",
  ARCHIVED:  "Arquivado",
} as const

function StarRating({ value }: { value: number }) {
  return (
    <span className="font-mono text-[11px] tracking-tight">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? "text-solar-amber" : "text-solar-border"}>
          ★
        </span>
      ))}
    </span>
  )
}

export function ReadingsView({ items, onItemClick }: Props) {
  const readings = items.filter((i) => i.type === "READING")

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border border-dashed border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest">
          Nenhuma leitura catalogada
        </p>
      </div>
    )
  }

  const groups = [
    { key: "ACTIVE",    label: "Lendo"      },
    { key: "FAVORITE",  label: "Relendo"    },
    { key: "BACKLOG",   label: "Quero ler"  },
    { key: "COMPLETED", label: "Lido"       },
  ] as const

  return (
    <div className="flex flex-col gap-px">
      {groups.map(({ key, label }) => {
        const groupItems = readings.filter((i) => i.status === key)
        if (!groupItems.length) return null

        return (
          <div key={key} className="border border-solar-border/20">
            <div className="px-5 py-2 border-b border-solar-border/20 bg-solar-surface/10 flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/65">
                {label}
              </span>
              <span className="text-[9px] font-mono text-solar-muted/35">{groupItems.length}</span>
            </div>

            <div className="flex flex-col">
              {groupItems.map((item) => {
                const meta   = parseMetadata(item.metadata)
                const rating = typeof meta.rating === "number" ? meta.rating : 0
                const author = typeof meta.author === "string" ? meta.author : null
                const year   = meta.period && typeof (meta.period as Record<string,unknown>).start === "number"
                  ? String((meta.period as Record<string,unknown>).start)
                  : null

                // Extrai primeira nota do conteúdo BlockNote
                let note: string | null = null
                if (item.content) {
                  try {
                    const blocks = JSON.parse(item.content) as Array<{ content?: Array<{ text?: string }> }>
                    note = blocks
                      .flatMap((b) => b.content?.map((c) => c.text ?? "") ?? [])
                      .join(" ")
                      .slice(0, 120) || null
                  } catch { /* ignore */ }
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="flex items-start gap-5 px-5 py-4 border-b border-solar-border/10 last:border-b-0 hover:bg-solar-surface/20 transition-solar text-left group"
                  >
                    {/* Ícone livro */}
                    <span className="font-mono text-solar-muted/35 group-hover:text-solar-amber/50 text-base flex-shrink-0 mt-0.5 transition-solar">
                      ▤
                    </span>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-display text-solar-text/85 group-hover:text-solar-text text-sm truncate transition-solar">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-3 flex-wrap">
                        {author && (
                          <span className="text-[9px] font-mono text-solar-muted/55">{author}</span>
                        )}
                        {year && (
                          <span className="text-[9px] font-mono text-solar-muted/40">{year}</span>
                        )}
                        {rating > 0 && <StarRating value={rating} />}
                      </div>

                      {note && (
                        <p className="text-[11px] font-body text-solar-muted/55 leading-relaxed line-clamp-2">
                          {note}
                        </p>
                      )}
                    </div>

                    {item.tags.length > 0 && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag.id} className="text-[8px] font-mono px-1 border border-solar-border/30 text-solar-muted/40">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
