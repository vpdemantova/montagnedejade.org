"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

const REPERTOIRE_STATUS = {
  ACTIVE:    { label: "Em andamento", color: "text-solar-amber" },
  BACKLOG:   { label: "Iniciando",    color: "text-solar-muted/60" },
  COMPLETED: { label: "Dominado",     color: "text-solar-green" },
  FAVORITE:  { label: "Performável",  color: "text-compass-neon-dim" },
  ARCHIVED:  { label: "Arquivado",    color: "text-solar-muted/35" },
} as const

export function RepertorioView({ items, onItemClick }: Props) {
  const repertorio = items.filter((i) => i.type === "REPERTOIRE" || i.type === "PARTITURA")

  if (repertorio.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border border-dashed border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest">
          Nenhum repertório catalogado
        </p>
      </div>
    )
  }

  // Agrupa por status
  const groups = [
    { key: "ACTIVE",    label: "Em andamento" },
    { key: "FAVORITE",  label: "Performável"  },
    { key: "BACKLOG",   label: "Iniciando"    },
    { key: "COMPLETED", label: "Dominado"     },
  ] as const

  return (
    <div className="flex flex-col gap-px">
      {groups.map(({ key, label }) => {
        const groupItems = repertorio.filter((i) => i.status === key)
        if (!groupItems.length) return null
        const statusStyle = REPERTOIRE_STATUS[key]

        return (
          <div key={key} className="border border-solar-border/20">
            <div className="px-5 py-2 border-b border-solar-border/20 bg-solar-surface/10 flex items-center justify-between">
              <span className={`text-[9px] font-mono uppercase tracking-[0.15em] ${statusStyle.color}`}>
                {label}
              </span>
              <span className="text-[9px] font-mono text-solar-muted/35">{groupItems.length}</span>
            </div>

            <div className="flex flex-col">
              {groupItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="flex items-center gap-4 px-5 py-3 border-b border-solar-border/10 last:border-b-0 hover:bg-solar-surface/20 transition-solar text-left group"
                >
                  <span className="font-mono text-solar-muted/35 group-hover:text-solar-amber/50 text-base leading-none flex-shrink-0">
                    ♪
                  </span>
                  <span className="font-display text-solar-text/80 group-hover:text-solar-text text-sm flex-1 truncate transition-solar">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-mono text-solar-muted/45 flex-shrink-0">
                    {AREA_LABELS[item.area] ?? item.area}
                  </span>
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag.id} className="text-[8px] font-mono px-1 border border-solar-border/30 text-solar-muted/40 flex-shrink-0">
                      {tag.name}
                    </span>
                  ))}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
