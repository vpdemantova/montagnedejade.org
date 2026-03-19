"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function parseMetadata(raw?: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

export function CursosView({ items, onItemClick }: Props) {
  const cursos = items.filter((i) => i.type === "COURSE" || i.type === "AULA")

  if (cursos.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border border-dashed border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest">
          Nenhum curso ou aula catalogada
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-px border border-solar-border/20 bg-solar-border/10">
      {cursos.map((item) => {
        const meta     = parseMetadata(item.metadata)
        const progress = typeof meta.progress === "number" ? meta.progress : 0
        const total    = typeof meta.total    === "number" ? meta.total    : 0
        const pct      = total > 0 ? Math.round((progress / total) * 100) : 0
        const isActive = item.status === "ACTIVE"
        const isDone   = item.status === "COMPLETED"

        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group bg-solar-void hover:bg-solar-surface/30 transition-solar text-left p-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[8px] font-mono uppercase tracking-widest text-solar-muted/50 mb-1">
                  {AREA_LABELS[item.area] ?? item.area} · {item.type === "AULA" ? "Aula" : "Curso"}
                </p>
                <h3 className="font-display text-solar-text text-sm leading-snug group-hover:text-solar-amber-lt transition-solar">
                  {item.title}
                </h3>
              </div>
              <span
                className={`text-[8px] font-mono uppercase tracking-widest flex-shrink-0 ${
                  isDone  ? "text-solar-green"  :
                  isActive ? "text-solar-amber/70" :
                  "text-solar-muted/40"
                }`}
              >
                {isDone ? "✓ Concluído" : isActive ? "Em curso" : "Pendente"}
              </span>
            </div>

            {/* Barra de progresso */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-mono text-solar-muted/45">
                  {total > 0 ? `${progress} / ${total} aulas` : "Progresso"}
                </span>
                <span className="text-[9px] font-mono text-solar-amber/70">{pct}%</span>
              </div>
              <div className="h-px bg-solar-border/40 relative">
                <div
                  className="absolute left-0 top-0 h-full bg-solar-amber/50 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="text-[8px] font-mono px-1 border border-solar-border/40 text-solar-muted/50">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
