"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, STATUS_LABELS } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function parseMetadata(raw?: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Iniciante",
  2: "Intermediário",
  3: "Avançado",
  4: "Virtuosístico",
  5: "Extremo",
}

export function PartiturasView({ items, onItemClick }: Props) {
  const partituras = items.filter((i) => i.type === "PARTITURA" || i.type === "WORK")

  if (partituras.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 border border-dashed border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest">
          Nenhuma partitura catalogada
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col border border-solar-border/20">
      {/* Cabeçalho */}
      <div className="grid grid-cols-[2rem_1fr_1fr_8rem_8rem_6rem] gap-4 px-5 py-2 border-b border-solar-border/30 bg-solar-surface/20">
        {["", "Obra", "Área", "Status", "Dificuldade", "Data"].map((h) => (
          <span key={h} className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/50">
            {h}
          </span>
        ))}
      </div>

      {partituras.map((item) => {
        const meta       = parseMetadata(item.metadata)
        const rating     = meta.rating as number | undefined
        const status     = STATUS_LABELS[item.status] ?? item.status

        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="grid grid-cols-[2rem_1fr_1fr_8rem_8rem_6rem] gap-4 px-5 py-3 border-b border-solar-border/10 last:border-b-0 hover:bg-solar-surface/20 transition-solar text-left group items-center"
          >
            {/* Ícone */}
            <span className="font-mono text-solar-muted/40 group-hover:text-solar-amber/60 transition-solar text-base leading-none">
              ♩
            </span>

            {/* Título */}
            <span className="font-display text-solar-text/80 group-hover:text-solar-text text-sm truncate transition-solar">
              {item.title}
            </span>

            {/* Área */}
            <span className="text-[9px] font-mono text-solar-muted/55 uppercase tracking-widest">
              {AREA_LABELS[item.area] ?? item.area}
            </span>

            {/* Status */}
            <span className="text-[9px] font-mono text-solar-muted/55">{status}</span>

            {/* Dificuldade (rating 1–5) */}
            <span className="text-[10px] font-mono text-solar-muted/50">
              {rating ? (DIFFICULTY_LABELS[rating] ?? `★${rating}`) : "—"}
            </span>

            {/* Data */}
            <span className="text-[9px] font-mono text-solar-muted/35">
              {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
            </span>
          </button>
        )
      })}
    </div>
  )
}
