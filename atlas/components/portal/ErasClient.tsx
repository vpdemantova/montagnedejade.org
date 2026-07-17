"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { AtlasItemWithTags } from "@/atlas/types"
import { TYPE_LABELS } from "@/atlas/types"
import {
  GRAND_ERAS,
  grandEraForItem,
  itemSortYear,
  itemYearsLabel,
  type GrandEraId,
} from "@/atlas/lib/eras"
import { ItemCard } from "@/atlas/components/ui/ItemCard"
import { ItemDrawer } from "@/atlas/components/layout/ItemDrawer"

type ErasClientProps = {
  eras:  AtlasItemWithTags[]   // itens type ERA — as sub-eras curadas
  items: AtlasItemWithTags[]   // pessoas, obras, eventos, movimentos
}

const TYPE_FILTERS = ["PERSON", "WORK", "EVENT", "MOVEMENT"] as const

type EraBucket = { subEras: AtlasItemWithTags[]; items: AtlasItemWithTags[] }

export function ErasClient({ eras, items }: ErasClientProps) {
  const [activeEra,  setActiveEra]  = useState<GrandEraId | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState("")
  const [query,      setQuery]      = useState("")
  const [activeItem, setActiveItem] = useState<AtlasItemWithTags | null>(null)

  // Classifica todo o acervo nas grandes eras — uma vez só
  const { byEra, undated } = useMemo(() => {
    const byEra = new Map<GrandEraId, EraBucket>(
      GRAND_ERAS.map((e) => [e.id, { subEras: [], items: [] }])
    )
    const undated: AtlasItemWithTags[] = []
    const sortByYear = (a: AtlasItemWithTags, b: AtlasItemWithTags) =>
      (itemSortYear(a.metadata) ?? 0) - (itemSortYear(b.metadata) ?? 0)

    for (const era of eras) {
      const g = grandEraForItem(era)
      if (g) byEra.get(g)!.subEras.push(era)
      else undated.push(era)
    }
    for (const item of items) {
      const g = grandEraForItem(item)
      if (g) byEra.get(g)!.items.push(item)
      else undated.push(item)
    }
    byEra.forEach((bucket) => {
      bucket.subEras.sort(sortByYear)
      bucket.items.sort(sortByYear)
    })
    return { byEra, undated }
  }, [eras, items])

  const matches = (i: AtlasItemWithTags) => {
    if (typeFilter && i.type !== typeFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return i.title.toLowerCase().includes(q) || i.tags.some((t) => t.name.toLowerCase().includes(q))
    }
    return true
  }

  const visibleEras = activeEra === "ALL" ? GRAND_ERAS : GRAND_ERAS.filter((e) => e.id === activeEra)
  const undatedVisible = activeEra === "ALL" ? undated.filter(matches) : []

  return (
    <div className="page-standard py-6">

      {/* ── Seletor de grandes eras ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveEra("ALL")}
          className="font-mono text-[8px] uppercase tracking-[0.2em] px-3 py-2 border transition-all"
          style={{
            borderColor: activeEra === "ALL" ? "rgb(var(--c-text) / 0.5)" : "rgb(var(--c-border) / 0.25)",
            color:       activeEra === "ALL" ? "rgb(var(--c-text) / 0.9)" : "rgb(var(--c-muted) / 0.55)",
          }}
        >
          ∞ Todas as eras
        </button>
        {GRAND_ERAS.map((era) => {
          const bucket = byEra.get(era.id)!
          const count  = bucket.subEras.length + bucket.items.length
          const active = activeEra === era.id
          return (
            <button
              key={era.id}
              onClick={() => setActiveEra(active ? "ALL" : era.id)}
              className="font-mono text-[8px] uppercase tracking-[0.2em] px-3 py-2 border transition-all"
              style={{
                borderColor: active ? era.color : "rgb(var(--c-border) / 0.25)",
                background:  active ? `${era.color}14` : "transparent",
                color:       active ? era.color : "rgb(var(--c-muted) / 0.55)",
              }}
            >
              {era.symbol} {era.label}
              <span className="ml-1.5" style={{ opacity: 0.55 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="tab-bar flex-1 min-w-0">
          <button onClick={() => setTypeFilter("")} className={`tab ${typeFilter === "" ? "active" : ""}`}>
            Todos
          </button>
          {TYPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? "" : t)} className={`tab ${typeFilter === t ? "active" : ""}`}>
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no tempo..."
          className="bg-solar-surface/50 border border-solar-border/30 rounded-[4px] px-3 py-1.5 text-sm text-solar-text placeholder:text-solar-muted/40 focus:outline-none focus:border-solar-border/60 w-40 sm:w-56"
        />
      </div>

      {/* ── Seções das eras ── */}
      <div className="space-y-14">
        {visibleEras.map((era) => {
          const bucket   = byEra.get(era.id)!
          const subEras  = typeFilter ? [] : bucket.subEras.filter(matches)
          const eraItems = bucket.items.filter(matches)
          if (subEras.length === 0 && eraItems.length === 0) return null

          return (
            <section key={era.id}>
              {/* Cabeçalho da era */}
              <div className="mb-5 pb-4" style={{ borderBottom: `1px solid ${era.color}30` }}>
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-3">
                    <span style={{ color: era.color, fontSize: 18 }}>{era.symbol}</span>
                    <h2 className="font-display text-2xl font-bold" style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text) / 0.9)" }}>
                      {era.label}
                    </h2>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: era.color }}>
                      {era.years}
                    </span>
                  </div>
                  <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
                    {subEras.length > 0 && `${subEras.length} eras · `}{eraItems.length} itens
                  </span>
                </div>
                <p className="font-mono text-[9px] mt-1.5" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
                  {era.desc}
                </p>
              </div>

              {/* Sub-eras curadas (itens ERA) */}
              {subEras.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {subEras.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/atlas/${sub.slug ?? sub.id}`}
                      className="group px-3 py-2 border transition-colors hover:bg-solar-surface/40"
                      style={{ borderColor: "rgb(var(--c-border) / 0.25)", borderLeft: `2px solid ${era.color}90` }}
                    >
                      <p className="text-[11px] leading-tight" style={{ color: "rgb(var(--c-text) / 0.85)" }}>
                        {sub.title}
                      </p>
                      {itemYearsLabel(sub.metadata) && (
                        <p className="font-mono text-[7px] mt-0.5" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
                          {itemYearsLabel(sub.metadata)}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Itens da era, em ordem cronológica */}
              {eraItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {eraItems.map((item) => (
                    <ItemCard key={item.id} item={item} variant="grid" onClick={setActiveItem} />
                  ))}
                </div>
              )}
            </section>
          )
        })}

        {/* Itens sem datação — visíveis para nada ficar invisível no acervo */}
        {undatedVisible.length > 0 && (
          <section>
            <div className="mb-5 pb-4" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.2)" }}>
              <h2 className="font-display text-xl font-bold" style={{ color: "rgb(var(--c-text) / 0.6)" }}>
                Sem datação
              </h2>
              <p className="font-mono text-[9px] mt-1" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
                Itens ainda sem ano no metadata — adicione <code>year</code>, <code>born</code> ou <code>period</code> para entrarem na linha do tempo.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {undatedVisible.map((item) => (
                <ItemCard key={item.id} item={item} variant="grid" onClick={setActiveItem} />
              ))}
            </div>
          </section>
        )}

        {/* Vazio total */}
        {visibleEras.every((e) => {
          const b = byEra.get(e.id)!
          return b.items.filter(matches).length === 0 && (typeFilter ? true : b.subEras.filter(matches).length === 0)
        }) && undatedVisible.length === 0 && (
          <div className="flex items-center justify-center h-48 border border-dashed border-solar-border/25 rounded-[6px]">
            <p className="editorial-label text-solar-muted/40">Nenhum item encontrado neste recorte do tempo</p>
          </div>
        )}
      </div>

      <ItemDrawer item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  )
}
