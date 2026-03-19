"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import type { AtlasItemWithTags } from "@/atlas/types"
import { useSolarStore, useViewStore } from "@/atlas/lib/store"
import { ViewType, AREA_LABELS } from "@/atlas/types"
import { ItemDrawer } from "@/atlas/components/layout/ItemDrawer"
import Link from "next/link"
import { ItemCard } from "@/atlas/components/ui/ItemCard"
import {
  applyDimensionFilters,
  hasActiveFilters,
  EMPTY_FILTERS,
  type DimensionFilters,
  DimensionFilterPanel,
} from "@/atlas/components/ui/DimensionFilterPanel"
import { AtlasListView }    from "./AtlasListView"
import { AtlasGalleryView } from "./AtlasGalleryView"
import { ShelvesView }      from "./ShelvesView"
import { IndexView }        from "./IndexView"
import { AutoresView }      from "./AutoresView"
import { PartiturasView }   from "./PartiturasView"
import { CursosView }       from "./CursosView"
import { RepertorioView }   from "./RepertorioView"
import { ReadingsView }       from "./ReadingsView"
import { AtlasMapView }       from "./AtlasMapView"
import { AtlasHorizontalView } from "./AtlasHorizontalView"
import { FAB } from "@/atlas/components/ui/FAB"

type AtlasClientProps = {
  items:        AtlasItemWithTags[]
  initialArea?: string
  defaultView?: string
  backHref?:    string
  backLabel?:   string
}

// ── Area filter chips ──────────────────────────────────────────────────────────

const AREA_CHIPS = [
  { value: "",         label: "Todos" },
  { value: "ATLAS",    label: "Atlas" },
  { value: "ACADEMIA", label: "Academia" },
  { value: "ARTES",    label: "Artes" },
  { value: "OBRAS",    label: "Obras" },
  { value: "PESSOAS",  label: "Pessoas" },
  { value: "CULTURA",  label: "Cultura" },
  { value: "STUDIO",   label: "Studio" },
  { value: "COMPASS",  label: "Compass" },
]

const TYPE_CHIPS = [
  { value: "",          label: "Todos"     },
  { value: "PERSON",    label: "Pessoa"    },
  { value: "WORK",      label: "Obra"      },
  { value: "CONCEPT",   label: "Conceito"  },
  { value: "OBJECT",    label: "Objeto"    },
  { value: "READING",   label: "Leitura"   },
  { value: "PARTITURA", label: "Partitura" },
]

const VIEW_CHIPS = [
  { value: ViewType.HORIZONTAL, label: "Grupos"  },
  { value: ViewType.GALLERY,    label: "Gallery" },
  { value: ViewType.TABLE,      label: "Table"   },
  { value: ViewType.LIST,       label: "List"    },
  { value: ViewType.ATLAS_MAP,  label: "Grafo"   },
]

export function AtlasClient({ items, initialArea, defaultView, backHref, backLabel }: AtlasClientProps) {
  const router = useRouter()
  const { getViewForRoute, setViewForRoute } = useViewStore()
  const persistedView = getViewForRoute("/atlas", defaultView ?? ViewType.HORIZONTAL)
  const [view, setView]         = useState<string>(persistedView)
  const [activeItem, setActiveItem] = useState<AtlasItemWithTags | null>(null)
  const [query, setQuery]       = useState("")
  const [visible, setVisible]   = useState(true)
  const [viewKey, setViewKey]   = useState(0)
  const [areaFilter, setAreaFilter] = useState(initialArea ?? "")
  const [typeFilter, setTypeFilter] = useState("")
  const [dimFilters, setDimFilters] = useState<DimensionFilters>(EMPTY_FILTERS)
  const [panelOpen, setPanelOpen]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter pipeline
  const dimFiltered = applyDimensionFilters(items, dimFilters)
  const areaFiltered = areaFilter
    ? dimFiltered.filter((i) => i.area === areaFilter)
    : dimFiltered
  const typeFiltered = typeFilter
    ? areaFiltered.filter((i) => i.type === typeFilter)
    : areaFiltered
  const finalItems = query.trim()
    ? typeFiltered.filter((i) =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.tags.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      )
    : typeFiltered

  const activeFilters = hasActiveFilters(dimFilters)

  const handleQuery = (value: string) => {
    setVisible(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setQuery(value)
      setVisible(true)
    }, 180)
  }

  const handleView = (next: string) => {
    setVisible(false)
    setTimeout(() => {
      setView(next)
      setViewForRoute("/atlas", next)
      setViewKey((k) => k + 1)
      setVisible(true)
    }, 120)
  }

  const openItem  = useCallback((item: AtlasItemWithTags) => setActiveItem(item), [])
  const closeItem = useCallback(() => setActiveItem(null), [])

  return (
    <div className="relative min-h-screen flex flex-col">

      {/* ── Toolbar unificada ── */}
      <div
        className="sticky top-0 z-20 flex flex-col"
        style={{
          background: "rgb(var(--c-void) / 0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgb(var(--c-border) / 0.25)",
        }}
      >
        {/* Linha 1 — título + busca + views */}
        <div className="flex items-center gap-3 px-3 py-2 border-b" style={{ borderColor: "rgb(var(--c-border) / 0.15)" }}>
          {backHref && (
            <Link href={backHref} className="text-[9px] font-mono uppercase tracking-widest flex-shrink-0"
              style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
              ← {backLabel ?? "Voltar"}
            </Link>
          )}

          <span
            className="font-display font-semibold text-base leading-none flex-shrink-0"
            style={{ color: "rgb(var(--c-text))" }}
          >
            Atlas
          </span>

          <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
            {finalItems.length} registros
          </span>

          {/* busca */}
          <div className="flex-1 flex items-center gap-1 max-w-xs">
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ color: "rgb(var(--c-muted) / 0.35)", flexShrink: 0 }}>
              <circle cx="8.5" cy="8.5" r="5.5"/><path d="M17 17l-3.5-3.5"/>
            </svg>
            <input
              type="text"
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent text-[11px] font-mono placeholder:text-solar-muted/30 focus:outline-none w-full"
              style={{ color: "rgb(var(--c-text))" }}
            />
          </div>

          {/* view switcher */}
          <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
            {VIEW_CHIPS.map((v) => (
              <button
                key={v.value}
                onClick={() => handleView(v.value)}
                className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest rounded transition-all duration-150"
                style={{
                  background: view === v.value ? "rgb(var(--c-accent) / 0.15)" : "transparent",
                  color: view === v.value ? "rgb(var(--c-accent))" : "rgb(var(--c-muted) / 0.45)",
                  border: `1px solid ${view === v.value ? "rgb(var(--c-accent) / 0.3)" : "rgb(var(--c-border) / 0.2)"}`,
                }}
              >
                {v.label}
              </button>
            ))}

            {/* advanced filters */}
            <div className="relative ml-1">
              <button
                onClick={() => setPanelOpen((o) => !o)}
                className="px-2 py-1 text-[9px] font-mono rounded transition-all duration-150"
                style={{
                  background: activeFilters || panelOpen ? "rgb(var(--c-accent) / 0.15)" : "transparent",
                  color: activeFilters || panelOpen ? "rgb(var(--c-accent))" : "rgb(var(--c-muted) / 0.45)",
                  border: `1px solid ${activeFilters || panelOpen ? "rgb(var(--c-accent) / 0.3)" : "rgb(var(--c-border) / 0.2)"}`,
                }}
              >
                ⊹ {activeFilters && <span className="inline-block w-1 h-1 rounded-full bg-current ml-0.5 -mb-0.5" />}
              </button>
              <AnimatePresence>
                {panelOpen && (
                  <DimensionFilterPanel
                    items={items}
                    filters={dimFilters}
                    onChange={setDimFilters}
                    onClose={() => setPanelOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Linha 2 — áreas */}
        <div className="flex items-center gap-0 px-3 overflow-x-auto scrollbar-hide" style={{ minHeight: "34px" }}>
          {AREA_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setAreaFilter(chip.value)}
              className="flex-shrink-0 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest transition-all duration-150 border-b-2 whitespace-nowrap"
              style={{
                borderBottomColor: areaFilter === chip.value ? "rgb(var(--c-accent))" : "transparent",
                color: areaFilter === chip.value ? "rgb(var(--c-accent))" : "rgb(var(--c-muted) / 0.5)",
              }}
            >
              {chip.label}
            </button>
          ))}

          {/* Divider */}
          <span className="w-px h-4 mx-2 flex-shrink-0" style={{ background: "rgb(var(--c-border) / 0.25)" }} />

          {/* Tipos inline */}
          {TYPE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setTypeFilter(chip.value)}
              className="flex-shrink-0 px-2.5 py-1.5 text-[9px] font-mono uppercase tracking-widest transition-all duration-150 whitespace-nowrap rounded"
              style={{
                background: typeFilter === chip.value ? "rgb(var(--c-teal) / 0.12)" : "transparent",
                color: typeFilter === chip.value ? "rgb(var(--c-teal))" : "rgb(var(--c-muted) / 0.4)",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Active dim-filter pills */}
        {activeFilters && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-t" style={{ borderColor: "rgb(var(--c-border) / 0.15)" }}>
            <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>Filtros:</span>
            {dimFilters.types.map((t) => (
              <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--c-accent) / 0.1)", color: "rgb(var(--c-accent) / 0.8)" }}>{t}</span>
            ))}
            {dimFilters.location && (
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--c-accent) / 0.1)", color: "rgb(var(--c-accent) / 0.8)" }}>◎ {dimFilters.location}</span>
            )}
            {(dimFilters.yearMin || dimFilters.yearMax) && (
              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgb(var(--c-accent) / 0.1)", color: "rgb(var(--c-accent) / 0.8)" }}>
                {dimFilters.yearMin ?? "?"} — {dimFilters.yearMax ?? "?"}
              </span>
            )}
            <button
              onClick={() => setDimFilters(EMPTY_FILTERS)}
              className="text-[8px] font-mono ml-1"
              style={{ color: "rgb(220 80 80 / 0.6)" }}
            >
              Limpar ×
            </button>
          </div>
        )}
      </div>

      {/* ── Conteúdo full-width ── */}
      <div
        className="flex-1 transition-opacity duration-150"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {finalItems.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <ViewRenderer key={viewKey} view={view} items={finalItems} onItemClick={openItem} />
        )}
      </div>

      <ItemDrawer item={activeItem} onClose={closeItem} />
      <FAB onClick={() => router.push("/atlas/novo")} label="Novo item" />
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
    case ViewType.HORIZONTAL: return <AtlasHorizontalView items={items} onItemClick={onItemClick} />
    case ViewType.GALLERY:    return <AtlasGalleryView   items={items} onItemClick={onItemClick} />
    case ViewType.TABLE:      return <AtlasTableView     items={items} onItemClick={onItemClick} />
    case ViewType.KANBAN:     return <AtlasKanbanView  items={items} onItemClick={onItemClick} />
    case ViewType.SHELVES:    return <ShelvesView      items={items} onItemClick={onItemClick} />
    case ViewType.INDEX:      return <IndexView        items={items} onItemClick={onItemClick} />
    case ViewType.AUTORES:    return <AutoresView      items={items} onItemClick={onItemClick} />
    case ViewType.PARTITURAS: return <PartiturasView   items={items} onItemClick={onItemClick} />
    case ViewType.CURSOS:     return <CursosView       items={items} onItemClick={onItemClick} />
    case ViewType.REPERTORIO: return <RepertorioView   items={items} onItemClick={onItemClick} />
    case ViewType.READINGS:   return <ReadingsView     items={items} onItemClick={onItemClick} />
    case ViewType.ATLAS_MAP:  return <AtlasMapView     items={items} onItemClick={onItemClick} />
    default:                  return <AtlasListView    items={items} onItemClick={onItemClick} />
  }
}

// ── Table view ────────────────────────────────────────────────────────────────

function AtlasTableView({ items, onItemClick }: { items: AtlasItemWithTags[]; onItemClick: (item: AtlasItemWithTags) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.3)" }}>
            {["Título", "Área", "Tipo", "Tags", "Data"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-[9px] font-mono uppercase tracking-widest font-normal"
                style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              onClick={() => onItemClick(item)}
              className="cursor-pointer stagger-item"
              style={{
                borderBottom: "1px solid rgb(var(--c-border) / 0.15)",
                animationDelay: `${Math.min(i * 20, 400)}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgb(var(--c-surface) / 0.3)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <td className="px-4 py-3 text-sm font-display" style={{ color: "rgb(var(--c-text) / 0.9)" }}>{item.title}</td>
              <td className="px-4 py-3 text-[10px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.6)" }}>{AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area}</td>
              <td className="px-4 py-3 text-[10px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>{item.type}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((t) => (
                    <span key={t.id} className="text-[8px] font-mono px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgb(var(--c-border) / 0.3)", color: "rgb(var(--c-muted) / 0.6)" }}>
                      {t.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-[9px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.3)" }}>
                {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
              </td>
            </tr>
          ))}
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
    <div className="grid grid-cols-4 gap-3 p-3">
      {columns.map((col) => {
        const colItems = items.filter((i) => i.status === col.key)
        return (
          <div key={col.key}>
            <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.25)" }}>
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
                {col.label}
              </span>
              <span className="text-[9px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.3)" }}>{colItems.length}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {colItems.map((item, i) => (
                <div key={item.id} style={{ "--stagger-delay": `${i * 40}ms` } as React.CSSProperties}>
                  <ItemCard item={item} onClick={onItemClick} />
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="h-16 rounded-lg flex items-center justify-center"
                  style={{ border: "1px dashed rgb(var(--c-border) / 0.2)" }}>
                  <span className="text-[9px] font-mono" style={{ color: "rgb(var(--c-muted) / 0.2)" }}>—</span>
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
    <div className="flex flex-col items-center justify-center py-32">
      <p className="text-[11px] font-mono uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>
        {query ? `Sem resultados para "${query}"` : "Acervo vazio"}
      </p>
    </div>
  )
}
