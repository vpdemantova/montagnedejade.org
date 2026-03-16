"use client"

import { useState, useCallback } from "react"
import type { AtlasItemWithTags } from "@/atlas/types"
import { ViewType, AREA_LABELS } from "@/atlas/types"
import { ViewSwitcher } from "@/atlas/components/ui/ViewSwitcher"
import { ItemCard } from "@/atlas/components/ui/ItemCard"
import { ItemDrawer } from "@/atlas/components/layout/ItemDrawer"
import { FAB } from "@/atlas/components/ui/FAB"
import { AtlasListView }    from "./AtlasListView"
import { AtlasGalleryView } from "./AtlasGalleryView"

type AtlasClientProps = {
  items: AtlasItemWithTags[]
  initialArea?: string
}

export function AtlasClient({ items, initialArea }: AtlasClientProps) {
  const [view, setView]             = useState<string>(ViewType.LIST)
  const [activeItem, setActiveItem] = useState<AtlasItemWithTags | null>(null)
  const [query, setQuery]           = useState("")

  const filtered = query.trim()
    ? items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      )
    : items

  const openItem  = useCallback((item: AtlasItemWithTags) => setActiveItem(item), [])
  const closeItem = useCallback(() => setActiveItem(null), [])

  const areaLabel = initialArea
    ? AREA_LABELS[initialArea as keyof typeof AREA_LABELS] ?? initialArea
    : null

  return (
    <div className="relative min-h-screen">

      {/* ── Grade de fundo — linhas verticais ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(42,42,58,0.18) 1px, transparent 1px)",
          backgroundSize: "80px 100%",
        }}
      />

      {/* ── Header editorial ── */}
      <header className="relative z-10 border-b border-solar-border/40 px-12 pt-12 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Linha de contexto */}
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-3">
            Portal Solar{areaLabel ? ` · ${areaLabel}` : " · Acervo"}
          </p>

          <div className="flex items-end justify-between gap-8">
            <div>
              <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
                {areaLabel ?? "Atlas"}
              </h1>
              <p className="text-solar-muted/50 text-xs font-mono mt-2">
                {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
              </p>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3 pb-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar..."
                className="
                  bg-transparent border-b border-solar-border/50
                  px-0 py-1 text-xs font-mono text-solar-text
                  placeholder:text-solar-muted/30
                  focus:outline-none focus:border-solar-amber/40
                  transition-solar w-36
                "
              />
              <ViewSwitcher current={view} onChange={setView} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-12 py-8">
        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <ViewRenderer view={view} items={filtered} onItemClick={openItem} />
        )}
      </div>

      <ItemDrawer item={activeItem} onClose={closeItem} />
      <FAB onClick={() => { window.location.href = "/atlas/novo" }} />
    </div>
  )
}

// ── Renderizador ──────────────────────────────────────────────────────────────

type ViewRendererProps = {
  view: string
  items: AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

function ViewRenderer({ view, items, onItemClick }: ViewRendererProps) {
  switch (view) {
    case ViewType.GALLERY:
      return <AtlasGalleryView items={items} onItemClick={onItemClick} />
    case ViewType.TABLE:
      return <AtlasTableView items={items} onItemClick={onItemClick} />
    case ViewType.KANBAN:
      return <AtlasKanbanView items={items} onItemClick={onItemClick} />
    case ViewType.ATLAS_MAP:
      return (
        <div className="flex items-center justify-center h-64 border border-dashed border-solar-border/30 rounded-sm">
          <p className="text-solar-muted/40 font-mono text-xs tracking-widest uppercase">
            Mapa orbital — em construção
          </p>
        </div>
      )
    default:
      return <AtlasListView items={items} onItemClick={onItemClick} />
  }
}

// ── Table view ────────────────────────────────────────────────────────────────

function AtlasTableView({ items, onItemClick }: { items: AtlasItemWithTags[]; onItemClick: (item: AtlasItemWithTags) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-solar-border/40">
            {["#", "Título", "Área", "Tipo", "Status", "Data"].map((h) => (
              <th key={h} className="text-left px-3 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/40 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const code = `SOL-${(Math.abs(item.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000).toString().padStart(3, "0")}`
            return (
              <tr
                key={item.id}
                onClick={() => onItemClick(item)}
                className="border-b border-solar-border/20 hover:bg-solar-surface/30 cursor-pointer transition-solar stagger-item"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <td className="px-3 py-3 font-mono text-[9px] text-solar-muted/30">{code}</td>
                <td className="px-3 py-3 font-display text-solar-text/90 text-sm">{item.title}</td>
                <td className="px-3 py-3 font-mono text-[10px] text-solar-muted/60">{item.area}</td>
                <td className="px-3 py-3 font-mono text-[10px] text-solar-muted/60">{item.type}</td>
                <td className="px-3 py-3 font-mono text-[10px] text-solar-muted/50">{item.status}</td>
                <td className="px-3 py-3 font-mono text-[9px] text-solar-muted/30">
                  {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Kanban view ───────────────────────────────────────────────────────────────

function AtlasKanbanView({ items, onItemClick }: { items: AtlasItemWithTags[]; onItemClick: (item: AtlasItemWithTags) => void }) {
  const columns = [
    { key: "ACTIVE",    label: "Ativo"     },
    { key: "BACKLOG",   label: "Pendente"  },
    { key: "COMPLETED", label: "Concluído" },
    { key: "FAVORITE",  label: "Favorito"  },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const colItems = items.filter((i) => i.status === col.key)
        return (
          <div key={col.key}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-solar-border/30">
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/50">
                {col.label}
              </span>
              <span className="text-[9px] font-mono text-solar-muted/30">{colItems.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {colItems.map((item, i) => (
                <div key={item.id} style={{ "--stagger-delay": `${i * 40}ms` } as React.CSSProperties}>
                  <ItemCard item={item} onClick={onItemClick} />
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="h-16 border border-dashed border-solar-border/20 rounded-sm flex items-center justify-center">
                  <span className="text-[9px] font-mono text-solar-muted/20">—</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 border border-dashed border-solar-border/20 rounded-sm">
      <p className="text-solar-muted/40 font-mono text-xs tracking-widest uppercase">
        {query ? `Sem resultados para "${query}"` : "Acervo vazio"}
      </p>
    </div>
  )
}
