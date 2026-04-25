"use client"

import { useState } from "react"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import { CoverImage } from "@/atlas/components/ui/CoverImage"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

type CardStyle = "compact" | "standard" | "tall"

const CARD_STYLES: { id: CardStyle; label: string; symbol: string }[] = [
  { id: "compact",  label: "Compacto", symbol: "≡≡≡" },
  { id: "standard", label: "Padrão",   symbol: "≡≡"  },
  { id: "tall",     label: "Grande",   symbol: "≡"   },
]

const CARD_DIMS: Record<CardStyle, { w: number; h: number; imgW: number }> = {
  compact:  { w: 200, h: 72,  imgW: 54  },
  standard: { w: 264, h: 106, imgW: 82  },
  tall:     { w: 320, h: 156, imgW: 130 },
}

const AREA_ORDER = ["ATLAS","ACADEMIA","ARTES","OBRAS","PESSOAS","CULTURA","STUDIO","COMPASS"]

const COMPACT_COUNT = 10

function parseMetadata(raw?: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

function periodStr(period?: { start?: number; end?: number }): string {
  if (!period?.start) return ""
  const fmt = (n: number) => n < 0 ? `${Math.abs(n)} a.C.` : `${n}`
  if (!period.end || period.end === period.start) return fmt(period.start)
  return `${fmt(period.start)} – ${fmt(period.end)}`
}


// ── Card — estilo editorial ────────────────────────────────────────────────────

function Card({
  item, style, onClick, index,
}: {
  item:    AtlasItemWithTags
  style:   CardStyle
  onClick: () => void
  index:   number
}) {
  const meta      = parseMetadata(item.metadata)
  const imageUrl  = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? "") as string
  const period    = meta.period as { start?: number; end?: number } | undefined
  const location  = (meta.location ?? "") as string
  const typeLabel = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
  const dims      = CARD_DIMS[style]
  const seqNum    = String(index + 1).padStart(2, "0")

  return (
    <article
      onClick={onClick}
      className="group flex-shrink-0 flex overflow-hidden cursor-pointer border border-solar-border/25 hover:border-solar-accent/40 hover:bg-solar-surface/30 transition-colors duration-150"
      style={{ width: `${dims.w}px`, height: `${dims.h}px` }}
    >
      {/* Imagem */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: dims.imgW }}>
        <CoverImage
          src={imageUrl}
          alt={item.title}
          name={item.title}
          className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-200"
        />
        {/* Sequence overlay */}
        <span className="absolute bottom-1 left-1 font-mono text-[8px] text-solar-muted/20 leading-none">
          {seqNum}
        </span>
      </div>

      {/* Texto */}
      <div className={`flex flex-col justify-between min-w-0 flex-1 ${
        style === "compact" ? "px-2.5 py-1.5" :
        style === "standard" ? "px-3 py-2.5" : "px-3.5 py-3"
      }`}>
        {/* Tipo */}
        {style !== "compact" && (
          <span className="editorial-label text-solar-muted/45">{typeLabel}</span>
        )}

        {/* Título */}
        <h3
          className={`font-display leading-snug text-solar-text/90 group-hover:text-solar-text transition-colors ${
            style === "compact" ? "text-[11px] line-clamp-1" :
            style === "standard" ? "text-[13px] line-clamp-2" : "text-[15px] line-clamp-3"
          }`}
        >
          {item.title}
        </h3>

        {/* Metadados */}
        <div className="flex flex-col gap-0.5">
          {period && (
            <span className="font-mono text-[8px] text-solar-muted/40">{periodStr(period)}</span>
          )}
          {location && !period && (
            <span className="font-mono text-[8px] text-solar-muted/35 truncate">{location}</span>
          )}
          {style === "tall" && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="font-mono text-[7px] text-solar-muted/40 border border-solar-border/25 px-1.5 py-0.5"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Grupo colapsável — editorial ──────────────────────────────────────────────

function Group({
  area, items, cardStyle, onItemClick, forceCollapsed,
}: {
  area:           string
  items:          AtlasItemWithTags[]
  cardStyle:      CardStyle
  onItemClick:    (item: AtlasItemWithTags) => void
  forceCollapsed: boolean
}) {
  const [localOpen, setLocalOpen] = useState(true)
  const [expanded,  setExpanded]  = useState(false)

  const open    = !forceCollapsed && localOpen
  const label   = AREA_LABELS[area as keyof typeof AREA_LABELS] ?? area
  const visible = expanded ? items : items.slice(0, COMPACT_COUNT)
  const hasMore = items.length > COMPACT_COUNT

  return (
    <section className="border-b border-solar-border/20">

      {/* ── Header ── */}
      <div
        className="flex items-baseline gap-4 px-3 py-3 cursor-pointer select-none hover:bg-solar-surface/20 transition-colors border-b border-solar-border/15"
        onClick={() => setLocalOpen((v) => !v)}
      >
        {/* Indicador colaps */}
        <span className="font-mono text-[10px] text-solar-muted/30 transition-transform duration-150 flex-shrink-0"
          style={{ transform: open ? "none" : "rotate(-90deg)", display: "inline-block" }}>
          ▾
        </span>

        {/* Label área */}
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-solar-text/70 flex-shrink-0">
          {label}
        </span>

        {/* Contagem */}
        <span className="font-mono text-[9px] text-solar-muted/30 flex-shrink-0">
          {items.length}
        </span>

        {/* Linha fill */}
        <div className="flex-1 border-t border-solar-border/15 self-center" />

        {/* Expandir */}
        {open && hasMore && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x) }}
            className="font-mono text-[8px] uppercase tracking-[0.2em] text-solar-muted/35 hover:text-solar-text transition-colors flex-shrink-0"
          >
            {expanded ? "▲ compactar" : `+${items.length - COMPACT_COUNT} mais`}
          </button>
        )}
      </div>

      {/* ── Faixa horizontal ── */}
      {open && (
        <div
          className="flex gap-2 overflow-x-auto px-3 py-3 scrollbar-thin"
        >
          {visible.map((item, i) => (
            <Card
              key={item.id}
              item={item}
              style={cardStyle}
              onClick={() => onItemClick(item)}
              index={i}
            />
          ))}

          {/* Ver mais inline */}
          {!expanded && hasMore && (
            <button
              onClick={() => setExpanded(true)}
              className="flex-shrink-0 flex flex-col items-center justify-center border border-dashed border-solar-border/25 hover:border-solar-accent/40 hover:bg-solar-surface/20 transition-colors"
              style={{
                width:    `${Math.round(CARD_DIMS[cardStyle].w * 0.3)}px`,
                height:   `${CARD_DIMS[cardStyle].h}px`,
                minWidth: "52px",
              }}
            >
              <span className="font-display text-xl text-solar-muted/30 mb-0.5">
                +{items.length - COMPACT_COUNT}
              </span>
              <span className="font-mono text-[7px] uppercase tracking-widest text-solar-muted/25">mais</span>
            </button>
          )}
        </div>
      )}
    </section>
  )
}

// ── View principal ─────────────────────────────────────────────────────────────

export function AtlasHorizontalView({ items, onItemClick }: Props) {
  const [cardStyle,    setCardStyle]    = useState<CardStyle>("standard")
  const [allCollapsed, setAllCollapsed] = useState(false)
  const [styleIdx,     setStyleIdx]     = useState(1)

  function cycleStyle() {
    const next = (styleIdx + 1) % CARD_STYLES.length
    setStyleIdx(next)
    setCardStyle(CARD_STYLES[next]!.id)
  }

  const grouped: Record<string, AtlasItemWithTags[]> = {}
  for (const item of items) {
    if (!grouped[item.area]) grouped[item.area] = []
    grouped[item.area]!.push(item)
  }

  const orderedAreas = [
    ...AREA_ORDER.filter((a) => grouped[a]),
    ...Object.keys(grouped).filter((a) => !AREA_ORDER.includes(a)),
  ]

  if (orderedAreas.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="editorial-label text-solar-muted/30">Nenhum item</p>
      </div>
    )
  }

  const currentStyle = CARD_STYLES[styleIdx]!

  return (
    <div className="flex flex-col w-full">

      {/* ── Barra de controle ── */}
      <div
        className="flex items-center gap-3 px-3 py-2 border-b border-solar-border/15 sticky top-0 z-10"
        style={{ background: "rgb(var(--c-void) / 0.95)" }}
      >
        <span className="font-mono text-[9px] text-solar-muted/35">
          {orderedAreas.length} grupos · {items.length} itens
        </span>

        <div className="flex-1" />

        {/* Ciclar estilo */}
        <button
          onClick={cycleStyle}
          className="flex items-center gap-1.5 px-2.5 py-1 border border-solar-border/25 hover:border-solar-accent/40 transition-colors font-mono text-[9px] uppercase tracking-wider text-solar-muted/50 hover:text-solar-text"
        >
          <span className="tracking-[3px] text-[10px]">{currentStyle.symbol}</span>
          <span className="hidden sm:inline">{currentStyle.label}</span>
        </button>

        {/* Colapsar tudo */}
        <button
          onClick={() => setAllCollapsed((c) => !c)}
          className="px-2.5 py-1 border border-solar-border/25 hover:border-solar-accent/40 transition-colors font-mono text-[9px] uppercase tracking-wider text-solar-muted/40 hover:text-solar-text"
        >
          {allCollapsed ? "↓ Expandir" : "↑ Colapsar"}
        </button>
      </div>

      {/* ── Grupos ── */}
      <div className="flex flex-col w-full">
        {orderedAreas.map((area) => (
          <Group
            key={area}
            area={area}
            items={grouped[area] ?? []}
            cardStyle={cardStyle}
            onItemClick={onItemClick}
            forceCollapsed={allCollapsed}
          />
        ))}
      </div>

    </div>
  )
}
