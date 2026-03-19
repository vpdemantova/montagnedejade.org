"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { AtlasItemWithTags } from "@/atlas/types"
import { TYPE_LABELS } from "@/atlas/types"

// ── Types ─────────────────────────────────────────────────────────────────────

export type DimensionFilters = {
  types:    string[]          // O QUÊ — ItemType checkboxes
  authorId: string | null     // QUEM  — PERSON item id
  location: string            // ONDE  — metadata.location text
  yearMin:  number | null     // QUANDO — period.start
  yearMax:  number | null     // QUANDO — period.end
}

export const EMPTY_FILTERS: DimensionFilters = {
  types:    [],
  authorId: null,
  location: "",
  yearMin:  null,
  yearMax:  null,
}

export function hasActiveFilters(f: DimensionFilters): boolean {
  return (
    f.types.length > 0 ||
    f.authorId !== null ||
    f.location.trim() !== "" ||
    f.yearMin !== null ||
    f.yearMax !== null
  )
}

/** Apply DimensionFilters to an item list. Pure function, usable in useMemo. */
export function applyDimensionFilters(
  items: AtlasItemWithTags[],
  filters: DimensionFilters
): AtlasItemWithTags[] {
  let result = items

  if (filters.types.length > 0) {
    result = result.filter((i) => filters.types.includes(i.type))
  }

  if (filters.authorId) {
    // Items tagged with this author's name, or created-by relation (simplified: filter by tag)
    const author = items.find((i) => i.id === filters.authorId)
    if (author) {
      result = result.filter(
        (i) => i.tags.some((t) => t.name.toLowerCase() === author.title.toLowerCase())
      )
    }
  }

  if (filters.location.trim()) {
    const loc = filters.location.toLowerCase()
    result = result.filter((i) => {
      try {
        const m = JSON.parse(i.metadata ?? "{}") as { location?: string }
        return m.location?.toLowerCase().includes(loc) ?? false
      } catch { return false }
    })
  }

  if (filters.yearMin !== null || filters.yearMax !== null) {
    result = result.filter((i) => {
      try {
        const m = JSON.parse(i.metadata ?? "{}") as { period?: { start?: number; end?: number } }
        const start = m.period?.start ?? null
        const end   = m.period?.end   ?? start
        if (start === null) return false
        if (filters.yearMin !== null && (end ?? start) < filters.yearMin) return false
        if (filters.yearMax !== null && start > filters.yearMax) return false
        return true
      } catch { return false }
    })
  }

  return result
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-solar-border/20 py-4 px-5">
      <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-3">{label}</p>
      {children}
    </div>
  )
}

// ── Panel component ───────────────────────────────────────────────────────────

export function DimensionFilterPanel({
  items,
  filters,
  onChange,
  onClose,
}: {
  items:    AtlasItemWithTags[]
  filters:  DimensionFilters
  onChange: (f: DimensionFilters) => void
  onClose:  () => void
}) {
  const [authorQuery, setAuthorQuery] = useState("")

  // Unique types present in the dataset
  const availableTypes = useMemo(
    () => Array.from(new Set(items.map((i) => i.type))).sort(),
    [items]
  )

  // Authors (PERSON type) for autocomplete
  const authors = useMemo(
    () => items.filter((i) => i.type === "PERSON"),
    [items]
  )
  const filteredAuthors = authorQuery.trim()
    ? authors.filter((a) => a.title.toLowerCase().includes(authorQuery.toLowerCase()))
    : authors.slice(0, 8)

  const toggleType = (type: string) => {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    onChange({ ...filters, types })
  }

  const active = hasActiveFilters(filters)

  return (
    <motion.div
      className="absolute right-0 top-full mt-1 w-72 bg-solar-deep border border-solar-border/40 shadow-[0_16px_60px_rgba(0,0,0,0.5)] z-30"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-solar-border/20">
        <span className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60">
          Filtros avançados
        </span>
        <div className="flex items-center gap-3">
          {active && (
            <button
              onClick={() => onChange(EMPTY_FILTERS)}
              className="text-[8px] font-mono text-solar-red/60 hover:text-solar-red transition-solar uppercase tracking-widest"
            >
              Limpar
            </button>
          )}
          <button onClick={onClose} className="text-solar-muted/40 hover:text-solar-muted transition-solar text-sm">
            ×
          </button>
        </div>
      </div>

      {/* O QUÊ — ItemType checkboxes */}
      <Section label="O Quê — tipo">
        <div className="grid grid-cols-2 gap-1">
          {availableTypes.map((type) => {
            const checked = filters.types.includes(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-2 px-2 py-1.5 text-left transition-solar rounded-sm
                  ${checked
                    ? "bg-solar-amber/10 border border-solar-amber/30"
                    : "border border-transparent hover:bg-solar-surface/30"}`}
              >
                <span className={`w-2 h-2 flex-shrink-0 border transition-solar
                  ${checked ? "bg-solar-amber border-solar-amber" : "border-solar-border/50"}`}
                />
                <span className={`text-[9px] font-mono uppercase tracking-wide
                  ${checked ? "text-solar-amber" : "text-solar-muted/60"}`}>
                  {TYPE_LABELS[type] ?? type}
                </span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* QUEM — Autor autocomplete */}
      <Section label="Quem — autor/pessoa">
        <input
          value={authorQuery}
          onChange={(e) => setAuthorQuery(e.target.value)}
          placeholder="Buscar pessoa…"
          className="w-full bg-transparent border border-solar-border/30 px-2 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-amber/40 transition-solar mb-2"
        />
        {filters.authorId && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono text-solar-amber">
              ✓ {authors.find((a) => a.id === filters.authorId)?.title ?? "Selecionado"}
            </span>
            <button
              onClick={() => onChange({ ...filters, authorId: null })}
              className="text-[8px] font-mono text-solar-red/50 hover:text-solar-red transition-solar"
            >
              ×
            </button>
          </div>
        )}
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
          {filteredAuthors.map((author) => (
            <button
              key={author.id}
              onClick={() => { onChange({ ...filters, authorId: author.id }); setAuthorQuery("") }}
              className={`w-full text-left px-2 py-1 text-[9px] font-mono transition-solar
                ${filters.authorId === author.id
                  ? "text-solar-amber bg-solar-amber/10"
                  : "text-solar-muted/60 hover:text-solar-text hover:bg-solar-surface/30"}`}
            >
              {author.title}
            </button>
          ))}
          {filteredAuthors.length === 0 && (
            <p className="text-[9px] font-mono text-solar-muted/30 px-2 py-1">Nenhuma pessoa encontrada.</p>
          )}
        </div>
      </Section>

      {/* ONDE — Location text */}
      <Section label="Onde — localização">
        <input
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          placeholder="Ex: Paris, Roma, Brasil…"
          className="w-full bg-transparent border border-solar-border/30 px-2 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-amber/40 transition-solar"
        />
      </Section>

      {/* QUANDO — Year range */}
      <Section label="Quando — período">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.yearMin ?? ""}
            onChange={(e) => onChange({ ...filters, yearMin: e.target.value ? Number(e.target.value) : null })}
            placeholder="De"
            className="w-full bg-transparent border border-solar-border/30 px-2 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-amber/40 transition-solar"
          />
          <span className="text-[9px] font-mono text-solar-muted/30">—</span>
          <input
            type="number"
            value={filters.yearMax ?? ""}
            onChange={(e) => onChange({ ...filters, yearMax: e.target.value ? Number(e.target.value) : null })}
            placeholder="Até"
            className="w-full bg-transparent border border-solar-border/30 px-2 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-amber/40 transition-solar"
          />
        </div>
        <p className="text-[8px] font-mono text-solar-muted/30 mt-1.5">
          Baseado em metadata.period.start/end
        </p>
      </Section>

      {/* Footer — result count */}
      <div className="px-5 py-3">
        <p className="text-[8px] font-mono text-solar-muted/35">
          {active ? "Filtro ativo" : "Nenhum filtro aplicado"}
        </p>
      </div>
    </motion.div>
  )
}
