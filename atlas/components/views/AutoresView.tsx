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

const DISCIPLINES = ["Composers", "Painters", "Sculptors", "Writers", "Architects", "Scientists", "Philosophers", "Mathematicians", "Physicists", "Botanists", "Archaeologists", "Explorers", "Leaders"]

export function AutoresView({ items, onItemClick }: Props) {
  const people = items.filter((i) => i.type === "PERSON")

  if (people.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-60 border border-dashed border-solar-border/20">
          <div className="text-center">
            <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest mb-2">
              Nenhuma pessoa catalogada
            </p>
            <p className="text-[9px] font-mono text-solar-muted/20">
              Crie um item do tipo Pessoa para começar
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Group by discipline tag if exists, else "Pessoas"
  const grouped = new Map<string, AtlasItemWithTags[]>()
  for (const person of people) {
    const disc = person.tags.find((t) =>
      DISCIPLINES.some((d) => d.toLowerCase() === t.name.toLowerCase())
    )?.name ?? "Pessoas"
    if (!grouped.has(disc)) grouped.set(disc, [])
    grouped.get(disc)!.push(person)
  }

  return (
    <div className="space-y-10">
      {Array.from(grouped.entries()).map(([discipline, members]) => (
        <section key={discipline}>
          {/* Section header */}
          <div className="flex items-center gap-4 mb-4 pb-2 border-b border-solar-border/20">
            <h2 className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50">
              {discipline}
            </h2>
            <span className="text-[8px] font-mono text-solar-muted/25">{members.length}</span>
          </div>

          {/* Portrait grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-6 gap-px bg-solar-border/10 border border-solar-border/20">
            {members.map((person, i) => {
              const meta      = parseMetadata(person.metadata)
              const imageUrl  = ((person as Record<string, unknown>).coverImage ?? meta.imageUrl ?? meta.portrait ?? "") as string
              const period    = meta.period as { start?: number; end?: number } | undefined
              const location  = (meta.location ?? meta.country ?? meta.nationality ?? "") as string
              const isFav     = person.isFavorite || person.status === "FAVORITE"
              const initial   = person.title.charAt(0).toUpperCase()

              return (
                <button
                  key={person.id}
                  onClick={() => onItemClick(person)}
                  className="group bg-solar-void hover:bg-solar-surface/30 transition-all duration-200 text-left flex flex-col stagger-item"
                  style={{ "--stagger-delay": `${i * 40}ms` } as React.CSSProperties}
                >
                  {/* Portrait */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-solar-surface/40">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={person.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-6xl text-solar-amber/15 group-hover:text-solar-amber/25 transition-colors select-none">
                          {initial}
                        </span>
                      </div>
                    )}
                    {isFav && (
                      <span className="absolute top-2 left-2 text-solar-amber text-[10px]">★</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-solar-void via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col gap-1">
                    <h3 className="font-display text-solar-text text-xs leading-snug group-hover:text-solar-amber-lt transition-colors line-clamp-2">
                      {person.title}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {period?.start && (
                        <p className="text-[8px] font-mono text-solar-muted/50">
                          {period.start}{period.end && period.end !== period.start ? ` — ${period.end}` : ""}
                        </p>
                      )}
                      {location && (
                        <p className="text-[8px] font-mono text-solar-muted/35">{location}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
