"use client"

import { useState } from "react"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

type CardStyle = "compact" | "standard" | "tall"

// ── Configuração dos estilos de card ──────────────────────────────────────────

const CARD_STYLES: { id: CardStyle; label: string; icon: string }[] = [
  { id: "compact",  label: "Compacto", icon: "▬▬▬" },
  { id: "standard", label: "Padrão",   icon: "▬▬"  },
  { id: "tall",     label: "Grande",   icon: "▬"   },
]

// Dimensões base; em mobile usamos clamp via CSS para não quebrar o scroll
const CARD_DIMS: Record<CardStyle, { w: number; h: number; imgW: number }> = {
  compact:  { w: 200, h: 76,  imgW: 58  },
  standard: { w: 270, h: 110, imgW: 90  },
  tall:     { w: 340, h: 160, imgW: 140 },
}

// ── Ordem e cores das áreas ───────────────────────────────────────────────────

const AREA_ORDER = ["ATLAS","ACADEMIA","ARTES","OBRAS","PESSOAS","CULTURA","STUDIO","COMPASS"]

const AREA_ACCENT: Record<string, [string, string]> = {
  //                    rgb triplet          gradient
  ATLAS:    ["110 86 207",  "from-violet-600/20 to-violet-900/5"],
  ACADEMIA: ["56 189 248",  "from-sky-400/20 to-sky-900/5"],
  ARTES:    ["251 146 60",  "from-orange-400/20 to-orange-900/5"],
  OBRAS:    ["196 164 100", "from-yellow-600/20 to-yellow-900/5"],
  PESSOAS:  ["52 211 153",  "from-emerald-400/20 to-emerald-900/5"],
  CULTURA:  ["232 121 249", "from-fuchsia-400/20 to-fuchsia-900/5"],
  STUDIO:   ["248 113 113", "from-red-400/20 to-red-900/5"],
  COMPASS:  ["0 200 180",   "from-teal-400/20 to-teal-900/5"],
}

const COMPACT_COUNT = 10

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function Placeholder({ initial, accent, size }: { initial: string; accent: string; size: number }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center select-none"
      style={{
        background: `radial-gradient(circle at 30% 50%, rgb(${accent} / 0.22) 0%, rgb(${accent} / 0.06) 60%, transparent 100%)`,
      }}
    >
      <span
        className="font-display font-bold"
        style={{ fontSize: size, color: `rgb(${accent} / 0.35)` }}
      >
        {initial}
      </span>
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function Card({
  item, accent, style, onClick, delay,
}: {
  item:    AtlasItemWithTags
  accent:  string
  style:   CardStyle
  onClick: () => void
  delay:   number
}) {
  const meta      = parseMetadata(item.metadata)
  const imageUrl  = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? "") as string
  const period    = meta.period as { start?: number; end?: number } | undefined
  const location  = (meta.location ?? "") as string
  const typeLabel = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
  const initial   = item.title.charAt(0).toUpperCase()
  const dims      = CARD_DIMS[style]

  return (
    <article
      onClick={onClick}
      className="flex-shrink-0 flex overflow-hidden rounded-lg cursor-pointer animate-fade-up"
      style={{
        width:          `${dims.w}px`,
        height:         `${dims.h}px`,
        animationDelay: `${delay}ms`,
        background:     "rgb(var(--c-deep) / 0.65)",
        border:         `1px solid rgb(var(--c-border) / 0.28)`,
        backdropFilter: "blur(10px)",
        transition:     "border-color 0.12s, box-shadow 0.12s, transform 0.12s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = `rgb(${accent} / 0.45)`
        el.style.boxShadow   = `0 4px 24px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(${accent} / 0.15)`
        el.style.transform   = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "rgb(var(--c-border) / 0.28)"
        el.style.boxShadow   = "none"
        el.style.transform   = "translateY(0)"
      }}
    >
      {/* Imagem / placeholder lateral */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: dims.imgW }}>
        {imageUrl ? (
          <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Placeholder initial={initial} accent={accent} size={style === "compact" ? 22 : style === "standard" ? 32 : 44} />
        )}
        {/* fade para o card */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, transparent 40%, rgb(var(--c-deep) / 0.5) 100%)` }}
        />
      </div>

      {/* Conteúdo textual */}
      <div className={`flex flex-col justify-between min-w-0 flex-1 ${style === "compact" ? "px-2.5 py-1.5" : style === "standard" ? "px-3 py-2.5" : "px-4 py-3"}`}>
        {/* Tipo — só em standard e tall */}
        {style !== "compact" && (
          <span
            className="text-[8px] font-mono uppercase tracking-widest"
            style={{ color: `rgb(${accent} / 0.65)` }}
          >
            {typeLabel}
          </span>
        )}

        {/* Título */}
        <h3
          className={`font-display font-semibold leading-snug ${style === "compact" ? "text-xs line-clamp-1" : style === "standard" ? "text-sm line-clamp-2" : "text-base line-clamp-2"}`}
          style={{ color: "rgb(var(--c-text) / 0.95)" }}
        >
          {item.title}
        </h3>

        {/* Metadados */}
        <div className="flex flex-col gap-0.5">
          {period && (
            <span className="text-[8px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
              {periodStr(period)}
            </span>
          )}
          {location && !period && (
            <span className="text-[8px] font-mono truncate" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
              {location}
            </span>
          )}

          {/* Tags — só em tall */}
          {style === "tall" && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.slice(0, 3).map((t) => (
                <span
                  key={t.id}
                  className="text-[7px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ background: `rgb(${accent} / 0.1)`, color: `rgb(${accent} / 0.7)` }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Grupo colapsável ──────────────────────────────────────────────────────────

function Group({
  area, items, accent, gradient, cardStyle, onItemClick, forceCollapsed,
}: {
  area:           string
  items:          AtlasItemWithTags[]
  accent:         string
  gradient:       string
  cardStyle:      CardStyle
  onItemClick:    (item: AtlasItemWithTags) => void
  forceCollapsed: boolean
}) {
  const [localOpen, setLocalOpen]   = useState(true)
  const [expanded,  setExpanded]    = useState(false)

  const open    = !forceCollapsed && localOpen
  const label   = AREA_LABELS[area as keyof typeof AREA_LABELS] ?? area
  const visible = expanded ? items : items.slice(0, COMPACT_COUNT)
  const hasMore = items.length > COMPACT_COUNT

  return (
    <section>
      {/* ── Header ── */}
      <div
        className={`flex items-center gap-3 cursor-pointer select-none px-0 ${open ? "py-2" : "py-1.5"}`}
        style={{
          background:   `linear-gradient(to right, rgb(${accent} / 0.06) 0%, transparent 60%)`,
          borderTop:    `1px solid rgb(${accent} / 0.12)`,
          borderBottom: open ? `1px solid rgb(${accent} / 0.08)` : "none",
          paddingLeft:  "12px",
          paddingRight: "12px",
        }}
        onClick={() => setLocalOpen((v) => !v)}
      >
        {/* Dot */}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: `rgb(${accent})`, boxShadow: `0 0 8px rgb(${accent} / 0.6)` }}
        />

        {/* Label */}
        <span
          className="text-xs font-display font-bold uppercase tracking-widest flex-shrink-0"
          style={{ color: `rgb(${accent} / 0.95)` }}
        >
          {label}
        </span>

        {/* Contagem */}
        <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>

        {/* Linha fill */}
        <div className="flex-1 h-px" style={{ background: `rgb(${accent} / 0.1)` }} />

        {/* Expand/compact */}
        {open && hasMore && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x) }}
            className="text-[8px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded flex-shrink-0 transition-all"
            style={{
              background: `rgb(${accent} / 0.1)`,
              color:      `rgb(${accent} / 0.7)`,
              border:     `1px solid rgb(${accent} / 0.2)`,
            }}
          >
            {expanded ? "▲ Compactar" : `▼ +${items.length - COMPACT_COUNT} mais`}
          </button>
        )}

        {/* Chevron */}
        <span
          className="text-[9px] flex-shrink-0 transition-transform duration-200"
          style={{ color: "rgb(var(--c-muted) / 0.35)", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          ▾
        </span>
      </div>

      {/* ── Faixa horizontal — zero gap lateral ── */}
      {open && (
        <div
          className="flex gap-2 overflow-x-auto"
          style={{
            padding:       "10px 12px",
            scrollbarWidth: "thin",
            scrollbarColor: `rgb(${accent} / 0.2) transparent`,
          }}
        >
          {visible.map((item, i) => (
            <Card
              key={item.id}
              item={item}
              accent={accent}
              style={cardStyle}
              onClick={() => onItemClick(item)}
              delay={Math.min(i * 20, 280)}
            />
          ))}

          {/* Botão ver mais inline */}
          {!expanded && hasMore && (
            <button
              onClick={() => setExpanded(true)}
              className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg"
              style={{
                width:      `${CARD_DIMS[cardStyle].w * 0.28}px`,
                height:     `${CARD_DIMS[cardStyle].h}px`,
                minWidth:   "56px",
                background: `rgb(${accent} / 0.05)`,
                border:     `1px dashed rgb(${accent} / 0.25)`,
                color:      `rgb(${accent} / 0.55)`,
                cursor:     "pointer",
              }}
            >
              <span className="font-display text-lg mb-0.5">+{items.length - COMPACT_COUNT}</span>
              <span className="text-[7px] font-mono uppercase tracking-widest">mais</span>
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

  // Agrupar por área
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
        <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.3)" }}>
          Nenhum item
        </p>
      </div>
    )
  }

  const currentStyleLabel = CARD_STYLES[styleIdx]?.label ?? "Padrão"
  const currentStyleIcon  = CARD_STYLES[styleIdx]?.icon  ?? "▬▬"

  return (
    <div className="flex flex-col w-full">
      {/* ── Barra de controle — zero padding lateral ── */}
      <div
        className="flex items-center gap-2 w-full sticky top-0 z-10 flex-wrap"
        style={{
          padding:         "6px 12px",
          background:      "rgb(var(--c-void) / 0.88)",
          backdropFilter:  "blur(12px)",
          borderBottom:    "1px solid rgb(var(--c-border) / 0.15)",
        }}
      >
        <span className="text-[9px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          <span className="hidden sm:inline">{orderedAreas.length} grupos · </span>{items.length} itens
        </span>

        <div className="flex-1" />

        {/* Toggle estilo de card */}
        <button
          onClick={cycleStyle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all"
          style={{
            background: "rgb(var(--c-surface) / 0.6)",
            border:     "1px solid rgb(var(--c-border) / 0.3)",
            color:      "rgb(var(--c-text) / 0.7)",
          }}
        >
          <span className="font-mono text-[10px] tracking-[2px]">{currentStyleIcon}</span>
          <span className="hidden sm:inline">{currentStyleLabel}</span>
        </button>

        {/* Colapsar / expandir tudo */}
        <button
          onClick={() => setAllCollapsed((c) => !c)}
          className="px-2.5 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all"
          style={{
            background: "rgb(var(--c-surface) / 0.6)",
            border:     "1px solid rgb(var(--c-border) / 0.3)",
            color:      "rgb(var(--c-muted) / 0.55)",
          }}
        >
          {allCollapsed ? "▼" : "▲"}<span className="hidden sm:inline">{allCollapsed ? " Expandir" : " Colapsar"}</span>
        </button>
      </div>

      {/* ── Grupos — full width, sem px ── */}
      <div className="flex flex-col w-full">
        {orderedAreas.map((area) => {
          const [accent = "110 86 207", gradient = ""] = AREA_ACCENT[area] ?? []
          return (
            <Group
              key={area}
              area={area}
              items={grouped[area] ?? []}
              accent={accent}
              gradient={gradient}
              cardStyle={cardStyle}
              onItemClick={onItemClick}
              forceCollapsed={allCollapsed}
            />
          )
        })}
      </div>
    </div>
  )
}
