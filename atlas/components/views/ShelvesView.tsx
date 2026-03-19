"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_COLORS, AREA_LABELS } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function spineWidth(item: AtlasItemWithTags): number {
  const len = (item.content?.length ?? 0) + item.title.length * 8
  return Math.max(28, Math.min(72, 28 + Math.floor(len / 120)))
}

export function ShelvesView({ items, onItemClick }: Props) {
  return (
    <div className="border border-solar-border/20">
      {/* Prateleira */}
      <div className="p-6 bg-solar-void">
        <div className="flex items-end gap-1 flex-wrap min-h-[160px]">
          {items.map((item, i) => {
            const color  = AREA_COLORS[item.area] ?? "#C8A45A"
            const width  = spineWidth(item)
            const height = 80 + (i % 5) * 16   // alturas variadas como livros reais

            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                title={item.title}
                className="group relative flex-shrink-0 cursor-pointer"
                style={{
                  width:  `${width}px`,
                  height: `${height}px`,
                  transition: "transform 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)" }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"   }}
              >
                {/* Lombada */}
                <div
                  className="w-full h-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: `${color}18`,
                    borderLeft:      `3px solid ${color}`,
                    borderTop:       `1px solid ${color}40`,
                    borderRight:     `1px solid ${color}20`,
                  }}
                >
                  {/* Título vertical */}
                  <span
                    className="font-mono text-[8px] uppercase tracking-widest select-none"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform:   "rotate(180deg)",
                      color:       `${color}CC`,
                      maxHeight:   `${height - 12}px`,
                      overflow:    "hidden",
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Tooltip hover */}
                <div className="
                  absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150
                  pointer-events-none z-10
                  bg-solar-deep border border-solar-border/50 px-2 py-1.5
                  whitespace-nowrap
                ">
                  <p className="text-[9px] font-mono text-solar-text/90">{item.title}</p>
                  <p className="text-[8px] font-mono text-solar-muted/55">
                    {AREA_LABELS[item.area] ?? item.area}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Base da prateleira */}
        <div className="mt-2 h-px bg-solar-border/40 w-full" />
        <div className="mt-px h-2 bg-solar-surface/30 w-full" />
      </div>

      {/* Legenda de áreas */}
      <div className="px-6 py-3 border-t border-solar-border/20 flex flex-wrap gap-4">
        {Array.from(new Set(items.map((i) => i.area))).map((area) => (
          <span key={area} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: AREA_COLORS[area] ?? "#C8A45A" }}
            />
            <span className="text-[9px] font-mono text-solar-muted/60 uppercase tracking-widest">
              {AREA_LABELS[area] ?? area}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
