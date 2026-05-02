"use client"

import { useState, useMemo } from "react"
import Link                   from "next/link"
import { WikiImage }          from "@/atlas/components/ui/WikiImage"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RawElement = {
  id:       string
  title:    string
  slug:     string | null
  metadata: string | null
}

type Element = {
  id:      string
  title:   string
  slug:    string | null
  symbol:  string
  n:       number
  period:  number
  group:   number
  mass:    number
  cat:     string
  pt:      string
}

// ── Cores por categoria ───────────────────────────────────────────────────────

const CAT: Record<string, { bg: string; border: string; text: string; label: string }> = {
  "alkali metal":    { bg: "#FF6B6B18", border: "#FF6B6B60", text: "#FF6B6B", label: "Metal Alcalino"       },
  "alkaline earth":  { bg: "#FFB34718", border: "#FFB34760", text: "#FFB347", label: "Alcalino-Terroso"      },
  "lanthanide":      { bg: "#87CEEB18", border: "#87CEEB60", text: "#87CEEB", label: "Lantanídeo"            },
  "actinide":        { bg: "#DDA0DD18", border: "#DDA0DD60", text: "#DDA0DD", label: "Actinídeo"             },
  "transition":      { bg: "#C8A45A18", border: "#C8A45A60", text: "#C8A45A", label: "Metal de Transição"    },
  "post-transition": { bg: "#90EE9018", border: "#90EE9060", text: "#90EE90", label: "Pós-Transição"         },
  "metalloid":       { bg: "#F0E68C18", border: "#F0E68C60", text: "#F0E68C", label: "Metaloide"             },
  "nonmetal":        { bg: "#98FB9818", border: "#98FB9860", text: "#98FB98", label: "Não-Metal"             },
  "halogen":         { bg: "#FFB6C118", border: "#FFB6C160", text: "#FFB6C1", label: "Halogênio"             },
  "noble gas":       { bg: "#B0C4DE18", border: "#B0C4DE60", text: "#B0C4DE", label: "Gás Nobre"             },
}

const FALLBACK_CAT = { bg: "#88888818", border: "#88888840", text: "#888", label: "" }

// Estados físicos à temperatura ambiente (25°C, 1 atm)
const GASES   = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86, 118])
const LIQUIDS = new Set([35, 80])

function getState(n: number): "gas" | "liquid" | "solid" {
  if (GASES.has(n))   return "gas"
  if (LIQUIDS.has(n)) return "liquid"
  return "solid"
}

function parseMeta(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

// ── Célula do elemento ────────────────────────────────────────────────────────

function ElementCell({
  el,
  dimmed,
  onClick,
}: {
  el:     Element
  dimmed: boolean
  onClick:(el: Element) => void
}) {
  const c     = CAT[el.cat] ?? FALLBACK_CAT
  const state = getState(el.n)
  const stateIcon = state === "gas" ? "○" : state === "liquid" ? "◉" : "▪"

  return (
    <button
      onClick={() => onClick(el)}
      title={`${el.pt} — ${c.label}`}
      style={{
        background:  c.bg,
        border:      `1px solid ${dimmed ? "rgba(100,100,100,0.15)" : c.border}`,
        opacity:     dimmed ? 0.18 : 1,
        aspectRatio: "1",
        display:     "flex",
        flexDirection: "column",
        alignItems:  "center",
        justifyContent: "center",
        padding:     "2px 1px",
        cursor:      "pointer",
        transition:  "all 0.12s ease",
        position:    "relative",
        minWidth:    0,
      }}
      onMouseEnter={(e) => {
        if (!dimmed) {
          e.currentTarget.style.transform = "scale(1.18)"
          e.currentTarget.style.zIndex    = "20"
          e.currentTarget.style.boxShadow = `0 4px 14px ${c.text}50`
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)"
        e.currentTarget.style.zIndex    = "1"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <span style={{ fontSize: "clamp(4px,0.7vw,7px)", color: c.text + "99", lineHeight: 1 }}>
        {el.n}
      </span>
      <span style={{ fontSize: "clamp(7px,1.4vw,15px)", fontWeight: 800, color: c.text, lineHeight: 1.05, fontFamily: "var(--font-sans)" }}>
        {el.symbol}
      </span>
      <span style={{ fontSize: "clamp(4px,0.55vw,6px)", color: c.text + "bb", lineHeight: 1.1, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "90%" }}>
        {el.pt}
      </span>
      <span style={{ fontSize: "clamp(3px,0.45vw,5px)", color: c.text + "70", lineHeight: 1 }}>
        {stateIcon}
      </span>
    </button>
  )
}

// ── Placeholder (posição La-Lu / Ac-Lr na grade principal) ────────────────────

function SeriesPlaceholder({ series }: { series: "lanthanide" | "actinide" }) {
  const c     = CAT[series]!
  const label = series === "lanthanide" ? "57–71" : "89–103"
  return (
    <div
      style={{
        background:  c.bg,
        border:      `1px solid ${c.border}`,
        aspectRatio: "1",
        display:     "flex",
        alignItems:  "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "clamp(4px,0.55vw,6px)", color: c.text + "99", fontFamily: "monospace", textAlign: "center", lineHeight: 1.4 }}>
        {label}
      </span>
    </div>
  )
}

// ── Drawer do elemento ────────────────────────────────────────────────────────

function ElementDrawer({ el, onClose }: { el: Element; onClose: () => void }) {
  const c     = CAT[el.cat] ?? FALLBACK_CAT
  const state = getState(el.n)
  const stateLabel = state === "gas" ? "Gás" : state === "liquid" ? "Líquido" : "Sólido"

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgb(var(--c-void) / 0.88)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{ border: `1px solid ${c.border}`, background: "rgb(var(--c-deep))", boxShadow: `0 40px 100px rgb(0 0 0 / 0.5), 0 0 0 1px ${c.text}15` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex flex-col items-center justify-center px-7 py-5"
            style={{ background: c.bg, minWidth: 90, borderRight: `1px solid ${c.border}` }}>
            <span style={{ fontSize: 8, color: c.text + "80", fontFamily: "monospace" }}>{el.n}</span>
            <span style={{ fontSize: 44, fontWeight: 900, color: c.text, lineHeight: 1, fontFamily: "var(--font-sans)" }}>
              {el.symbol}
            </span>
            <span style={{ fontSize: 8, color: c.text + "99", fontFamily: "monospace" }}>{el.mass}</span>
          </div>

          <div className="flex-1 px-5 py-4">
            <p className="font-display leading-none mb-0.5" style={{ fontSize: "1.6rem", color: "rgb(var(--c-text) / 0.9)" }}>
              {el.pt}
            </p>
            <p className="font-mono text-[8px] mb-3" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
              {el.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="font-mono text-[7px] px-2 py-0.5 border" style={{ background: c.bg, color: c.text, borderColor: c.border }}>
                {c.label}
              </span>
              <span className="font-mono text-[7px] px-2 py-0.5 border border-solar-border/20 text-solar-muted/50">
                Período {el.period} · Grupo {el.group > 0 ? el.group : "—"}
              </span>
              <span className="font-mono text-[7px] px-2 py-0.5 border border-solar-border/20 text-solar-muted/50">
                {stateLabel} (25°C)
              </span>
            </div>
          </div>

          <button onClick={onClose} className="px-4 self-start py-3 font-mono text-[18px] hover:opacity-60 transition-opacity"
            style={{ color: "rgb(var(--c-muted) / 0.35)" }}>×</button>
        </div>

        {/* Conteúdo */}
        <div className="flex gap-4 p-5">
          <div className="overflow-hidden flex-shrink-0" style={{ width: 72, height: 72, border: `1px solid ${c.border}` }}>
            <WikiImage name={el.title} alt={el.pt} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2.5">
            {[
              ["Nº Atômico",  String(el.n)],
              ["Massa (u)",   String(el.mass)],
              ["Período",     String(el.period)],
              ["Grupo",       el.group > 0 ? String(el.group) : "Série f"],
              ["Estado",      stateLabel],
              ["Categoria",   c.label],
            ].map(([lbl, val]) => (
              <div key={lbl}>
                <p className="font-mono text-[6.5px] uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>{lbl}</p>
                <p className="font-mono text-[10px]" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid rgb(var(--c-border) / 0.12)" }}>
          {el.slug ? (
            <Link href={`/atlas/${el.slug}`} onClick={onClose} className="font-mono text-[8px] uppercase tracking-widest hover:opacity-70"
              style={{ color: c.text }}>
              Página completa →
            </Link>
          ) : <span />}
          <button onClick={onClose} className="font-mono text-[8px] uppercase tracking-widest"
            style={{ color: "rgb(var(--c-muted) / 0.35)" }}>fechar</button>
        </div>
      </div>
    </div>
  )
}

// ── Componente raiz ───────────────────────────────────────────────────────────

export function PeriodicTableClient({ elements: raw }: { elements: RawElement[] }) {
  const [activeCats,   setActiveCats]   = useState<Set<string>>(new Set())
  const [stateFilter,  setStateFilter]  = useState<"" | "solid" | "liquid" | "gas">("")
  const [search,       setSearch]       = useState("")
  const [selected,     setSelected]     = useState<Element | null>(null)

  const elements = useMemo<Element[]>(() =>
    raw
      .map((r) => {
        const m = parseMeta(r.metadata)
        return {
          id:     r.id,
          title:  r.title,
          slug:   r.slug,
          symbol: String(m.symbol ?? "?"),
          n:      Number(m.n      ?? 0),
          period: Number(m.period ?? 0),
          group:  Number(m.group  ?? 0),
          mass:   Number(m.mass   ?? 0),
          cat:    String(m.cat    ?? ""),
          pt:     String(m.pt     ?? r.title),
        }
      })
      .sort((a, b) => a.n - b.n),
  [raw])

  const categories = useMemo(() => Array.from(new Set(elements.map((e) => e.cat))).sort(), [elements])

  const isDimmed = (el: Element): boolean => {
    if (search) {
      const q = search.toLowerCase()
      if (!el.pt.toLowerCase().includes(q) && !el.symbol.toLowerCase().includes(q)) return true
    }
    if (stateFilter && getState(el.n) !== stateFilter) return true
    if (activeCats.size > 0 && !activeCats.has(el.cat)) return true
    return false
  }

  const toggleCat = (cat: string) => {
    setActiveCats((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })
  }

  const lanthanides = elements.filter((e) => e.n >= 57  && e.n <= 71)
  const actinides   = elements.filter((e) => e.n >= 89  && e.n <= 103)
  const mainElements = elements.filter((e) => !(e.n >= 57 && e.n <= 71) && !(e.n >= 89 && e.n <= 103))

  const COLS  = "repeat(18, minmax(34px, 1fr))"
  const GAP   = "2px"

  return (
    <div className="space-y-4">

      {/* Filtros */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome ou símbolo…"
            className="bg-solar-deep/50 border border-solar-border/25 px-3 py-1 font-mono text-[10px] outline-none w-36 focus:border-solar-accent/40"
            style={{ color: "rgb(var(--c-text) / 0.8)" }}
          />
          {(["", "solid", "liquid", "gas"] as const).map((s) => {
            const active = stateFilter === s
            return (
              <button key={s} onClick={() => setStateFilter(s)}
                className="font-mono text-[7px] uppercase tracking-widest px-2.5 py-1 border transition-all"
                style={{
                  borderColor: active ? "rgb(var(--c-accent)/0.6)" : "rgb(var(--c-border)/0.3)",
                  background:  active ? "rgb(var(--c-accent)/0.1)" : "transparent",
                  color:       active ? "rgb(var(--c-accent))"      : "rgb(var(--c-muted)/0.5)",
                }}>
                {s === "" ? "Todos" : s === "solid" ? "▪ Sólido" : s === "liquid" ? "◉ Líquido" : "○ Gás"}
              </button>
            )
          })}
          {(activeCats.size > 0 || stateFilter || search) && (
            <button onClick={() => { setActiveCats(new Set()); setStateFilter(""); setSearch("") }}
              className="font-mono text-[7px] uppercase tracking-widest px-2 py-1"
              style={{ color: "rgb(var(--c-muted)/0.4)" }}>↺ Limpar</button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const c      = CAT[cat] ?? FALLBACK_CAT
            const active = activeCats.has(cat)
            const faded  = activeCats.size > 0 && !active
            return (
              <button key={cat} onClick={() => toggleCat(cat)}
                className="font-mono text-[6.5px] uppercase tracking-widest px-2 py-0.5 border transition-all"
                style={{
                  background:  active ? c.bg : "transparent",
                  borderColor: faded ? "rgb(var(--c-border)/0.15)" : c.border,
                  color:       faded ? "rgb(var(--c-muted)/0.25)" : c.text,
                }}>
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grade */}
      <div style={{ overflowX: "auto", overflowY: "visible" }}>
        <div style={{ minWidth: 680 }}>

          {/* ── Grade principal (períodos 1–7) ── */}
          <div style={{ display: "grid", gridTemplateColumns: COLS, gap: GAP }}>
            {/* Elementos do grid principal */}
            {mainElements.map((el) => (
              <div key={el.id} style={{ gridColumn: el.group || 1, gridRow: el.period || 1 }}>
                <ElementCell el={el} dimmed={isDimmed(el)} onClick={setSelected} />
              </div>
            ))}

            {/* Placeholder lantanídeos período 6, coluna 3 */}
            <div style={{ gridColumn: 3, gridRow: 6 }}>
              <SeriesPlaceholder series="lanthanide" />
            </div>
            {/* Placeholder actinídeos período 7, coluna 3 */}
            <div style={{ gridColumn: 3, gridRow: 7 }}>
              <SeriesPlaceholder series="actinide" />
            </div>
          </div>

          {/* Separador */}
          <div style={{ height: 10 }} />

          {/* ── Lantanídeos ── */}
          <div style={{ display: "grid", gridTemplateColumns: COLS, gap: GAP }}>
            <div style={{ gridColumn: "1 / 3" }} className="flex items-center justify-end pr-2">
              <span style={{ fontSize: 7, fontFamily: "monospace", color: CAT["lanthanide"]?.text + "80", textAlign: "right", lineHeight: 1.4 }}>
                Lantanídeos<br/>57 → 71
              </span>
            </div>
            {lanthanides.map((el, i) => (
              <div key={el.id} style={{ gridColumn: i + 3 }}>
                <ElementCell el={el} dimmed={isDimmed(el)} onClick={setSelected} />
              </div>
            ))}
          </div>

          <div style={{ height: 4 }} />

          {/* ── Actinídeos ── */}
          <div style={{ display: "grid", gridTemplateColumns: COLS, gap: GAP }}>
            <div style={{ gridColumn: "1 / 3" }} className="flex items-center justify-end pr-2">
              <span style={{ fontSize: 7, fontFamily: "monospace", color: CAT["actinide"]?.text + "80", textAlign: "right", lineHeight: 1.4 }}>
                Actinídeos<br/>89 → 103
              </span>
            </div>
            {actinides.map((el, i) => (
              <div key={el.id} style={{ gridColumn: i + 3 }}>
                <ElementCell el={el} dimmed={isDimmed(el)} onClick={setSelected} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3" style={{ borderTop: "1px solid rgb(var(--c-border)/0.15)" }}>
        {Object.entries(CAT).map(([cat, c]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div style={{ width: 10, height: 10, background: c.bg, border: `1px solid ${c.border}`, flexShrink: 0 }} />
            <span style={{ fontSize: 7, fontFamily: "monospace", color: "rgb(var(--c-muted)/0.5)" }}>{c.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          {[["▪ Sólido",""],["◉ Líquido",""],["○ Gás",""]].map(([icon]) => (
            <span key={icon} style={{ fontSize: 7, fontFamily: "monospace", color: "rgb(var(--c-muted)/0.4)" }}>{icon}</span>
          ))}
        </div>
      </div>

      {selected && <ElementDrawer el={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
