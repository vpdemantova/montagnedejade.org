"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import { Tag } from "@/atlas/components/ui/Tag"

type AtlasGalleryViewProps = {
  items: AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function itemCode(id: string): string {
  const n = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
  return `SOL-${n.toString().padStart(3, "0")}`
}

export function AtlasGalleryView({ items, onItemClick }: AtlasGalleryViewProps) {
  return (
    <div className="grid grid-cols-3 xl:grid-cols-4 gap-px border border-solar-border/20 bg-solar-border/10">
      {items.map((item, i) => {
        const areaLabel = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
        const typeLabel = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
        const code      = itemCode(item.id)
        const isFav     = item.status === "FAVORITE"

        return (
          <article
            key={item.id}
            onClick={() => onItemClick(item)}
            className="
              group bg-solar-void hover:bg-solar-surface/40
              cursor-pointer transition-solar p-4
              stagger-item flex flex-col gap-3
            "
            style={{ "--stagger-delay": `${i * 35}ms` } as React.CSSProperties}
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/40">
                {areaLabel}
              </span>
              <span className="text-[9px] font-mono text-solar-muted/25 flex-shrink-0">
                {code}
              </span>
            </div>

            {/* Título */}
            <h3 className="
              font-display text-solar-text/80 text-sm leading-snug flex-1
              group-hover:text-solar-text transition-solar line-clamp-3
            ">
              {item.title}
            </h3>

            {/* Rodapé */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-solar-muted/30">{typeLabel}</span>
              {isFav && <span className="text-solar-amber/60 text-[9px]">★</span>}
            </div>
          </article>
        )
      })}
    </div>
  )
}
