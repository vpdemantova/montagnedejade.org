"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { LayoutGrid, List } from "lucide-react"
import type { AtlasItemWithTags } from "@/atlas/types"
import { TYPE_LABELS } from "@/atlas/types"
import { ItemCard } from "@/atlas/components/ui/ItemCard"
import { ItemDrawer } from "@/atlas/components/layout/ItemDrawer"

type AreaHubClientProps = {
  area:  string
  items: AtlasItemWithTags[]
}

export function AreaHubClient({ area, items }: AreaHubClientProps) {
  const [query, setQuery]           = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [variant, setVariant]       = useState<"grid" | "list">("grid")
  const [activeItem, setActiveItem] = useState<AtlasItemWithTags | null>(null)

  const types = useMemo(() => {
    const distinct = new Set(items.map((i) => i.type))
    return Array.from(distinct)
  }, [items])

  const filtered = useMemo(() => {
    let result = items
    if (typeFilter) result = result.filter((i) => i.type === typeFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (i) => i.title.toLowerCase().includes(q) || i.tags.some((t) => t.name.toLowerCase().includes(q))
      )
    }
    return result
  }, [items, typeFilter, query])

  return (
    <div className="page-standard py-6">
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="tab-bar flex-1 min-w-0">
          <button
            onClick={() => setTypeFilter("")}
            className={`tab ${typeFilter === "" ? "active" : ""}`}
          >
            Todos
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`tab ${typeFilter === t ? "active" : ""}`}
            >
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="bg-solar-surface/50 border border-solar-border/30 rounded-[4px] px-3 py-1.5 text-sm text-solar-text placeholder:text-solar-muted/40 focus:outline-none focus:border-solar-border/60 w-40 sm:w-56"
        />

        <div className="flex items-center border border-solar-border/30 rounded-[4px] overflow-hidden flex-shrink-0">
          <button
            onClick={() => setVariant("grid")}
            aria-label="Grade"
            className={`p-1.5 ${variant === "grid" ? "bg-solar-surface text-solar-text" : "text-solar-muted/50"}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setVariant("list")}
            aria-label="Lista"
            className={`p-1.5 ${variant === "list" ? "bg-solar-surface text-solar-text" : "text-solar-muted/50"}`}
          >
            <List size={14} />
          </button>
        </div>

        <Link href={`/atlas/novo?area=${area}`} className="btn btn-primary btn-sm flex-shrink-0">
          + Novo
        </Link>
      </div>

      {/* Conteúdo */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-dashed border-solar-border/25 rounded-[6px]">
          <p className="editorial-label text-solar-muted/40">Nenhum item encontrado</p>
        </div>
      ) : variant === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} variant="grid" onClick={setActiveItem} />
          ))}
        </div>
      ) : (
        <div>
          {filtered.map((item, i) => (
            <ItemCard key={item.id} item={item} variant="list" index={i} onClick={setActiveItem} />
          ))}
        </div>
      )}

      <ItemDrawer item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  )
}
