"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import type { AtlasItemWithTags } from "@/atlas/types"
import { ItemDrawer } from "@/atlas/components/layout/ItemDrawer"

// ── Lazy map (react-simple-maps — browser only) ───────────────────────────────

const WorldMapView = dynamic(
  () => import("./WorldMapView").then((m) => m.WorldMapView),
  { ssr: false, loading: () => <MapSkeleton /> }
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMetadata(raw?: string | null): Record<string, unknown> {
  try { return JSON.parse(raw ?? "{}") } catch { return {} }
}

function getLocation(item: AtlasItemWithTags): string {
  const m = parseMetadata(item.metadata)
  return (m.location as string) ?? ""
}

function getCoverImage(item: AtlasItemWithTags): string | null {
  const m = parseMetadata(item.metadata)
  return (m.imageUrl as string) ?? (m.coverImage as string) ?? null
}

// ── View switcher ─────────────────────────────────────────────────────────────

type ViewId = "galeria" | "mapa" | "mosaico"

const VIEWS: { id: ViewId; label: string; symbol: string }[] = [
  { id: "galeria",  label: "Galeria",  symbol: "⊞" },
  { id: "mapa",     label: "Mapa",     symbol: "◎" },
  { id: "mosaico",  label: "Mosaico",  symbol: "▦" },
]

function ViewSwitcher({ current, onChange }: { current: ViewId; onChange: (v: ViewId) => void }) {
  return (
    <div className="flex items-center gap-px border border-solar-border/30">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          onClick={() => onChange(v.id)}
          title={v.label}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest
            transition-all duration-150
            ${current === v.id
              ? "bg-solar-surface text-solar-amber border-r border-solar-border/30 last:border-r-0"
              : "text-solar-muted/50 hover:text-solar-muted border-r border-solar-border/20 last:border-r-0"
            }
          `}
        >
          <span>{v.symbol}</span>
          <span className="hidden sm:inline">{v.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Gallery card ──────────────────────────────────────────────────────────────

function GalleryCard({ item, onClick }: { item: AtlasItemWithTags; onClick: () => void }) {
  const location = getLocation(item)
  const cover    = getCoverImage(item)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="
        group border border-solar-border/25 cursor-pointer
        hover:border-solar-amber/30 transition-all duration-200
        bg-solar-deep/30
      "
    >
      {/* Image / placeholder */}
      <div className="aspect-[4/3] overflow-hidden bg-solar-surface/20 relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-solar-muted/15 font-mono text-3xl">◼</span>
          </div>
        )}
        {/* Type badge */}
        <span className="absolute top-2 left-2 text-[7px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-solar-deep/80 text-solar-amber/70 border border-solar-amber/20">
          {item.type}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-display text-sm text-solar-text/90 leading-snug line-clamp-2 mb-1.5">
          {item.title}
        </h3>
        {location && (
          <p className="text-[9px] font-mono text-solar-muted/50 flex items-center gap-1">
            <span>◎</span> {location}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t.id} className="text-[7px] font-mono text-solar-muted/35 border border-solar-border/20 px-1 py-0.5 uppercase">
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Gallery view ──────────────────────────────────────────────────────────────

function GalleryView({ items, onItemClick }: { items: AtlasItemWithTags[]; onItemClick: (i: AtlasItemWithTags) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} onClick={() => onItemClick(item)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Mosaic view ───────────────────────────────────────────────────────────────

function MosaicView({ items, onItemClick }: { items: AtlasItemWithTags[]; onItemClick: (i: AtlasItemWithTags) => void }) {
  // Assign size classes in a repeating bento pattern
  const sizePattern = ["large", "small", "small", "medium", "small", "small", "large", "medium"]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-[auto] gap-3 auto-rows-[180px]">
      {items.map((item, i) => {
        const size     = sizePattern[i % sizePattern.length]!
        const cover    = getCoverImage(item)
        const location = getLocation(item)

        const colSpan = size === "large" ? "col-span-2 row-span-2" :
                        size === "medium" ? "col-span-2 row-span-1" :
                        "col-span-1 row-span-1"

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onItemClick(item)}
            className={`
              ${colSpan}
              relative overflow-hidden border border-solar-border/25 cursor-pointer
              hover:border-solar-amber/40 transition-all duration-200
              bg-solar-deep/40 group
            `}
          >
            {cover && (
              <img
                src={cover}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-300"
              />
            )}
            <div className="relative z-10 p-3 h-full flex flex-col justify-end">
              <p className="text-[7px] font-mono text-solar-amber/60 uppercase tracking-widest mb-1">{item.type}</p>
              <h3 className="font-display text-solar-text/90 leading-snug line-clamp-2"
                style={{ fontSize: size === "small" ? "11px" : "14px" }}>
                {item.title}
              </h3>
              {location && size !== "small" && (
                <p className="text-[8px] font-mono text-solar-muted/40 mt-1">◎ {location}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Map skeleton ──────────────────────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="h-[500px] border border-solar-border/15 bg-solar-deep/20 flex items-center justify-center">
      <p className="text-[9px] font-mono text-solar-muted/30 uppercase tracking-widest animate-pulse">
        Carregando mapa...
      </p>
    </div>
  )
}

// ── Main client ───────────────────────────────────────────────────────────────

export function WorldClient({ items }: { items: AtlasItemWithTags[] }) {
  const [view,       setView]       = useState<ViewId>("galeria")
  const [query,      setQuery]      = useState("")
  const [activeItem, setActiveItem] = useState<AtlasItemWithTags | null>(null)

  const filtered = useMemo(() =>
    query.trim()
      ? items.filter((i) =>
          i.title.toLowerCase().includes(query.toLowerCase()) ||
          getLocation(i).toLowerCase().includes(query.toLowerCase()) ||
          i.tags.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
        )
      : items,
    [items, query]
  )

  const withLocation = useMemo(() =>
    filtered.filter((i) => getLocation(i)),
    [filtered]
  )

  return (
    <div className="relative min-h-screen">

      {/* Header */}
      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/70 mb-3">
            Portal Solar · Mundo
          </p>
          <div className="flex items-end justify-between gap-4 sm:gap-8 pb-5 flex-wrap sm:flex-nowrap">
            <div>
              <h1 className="font-display text-[28px] sm:text-[36px] md:text-[44px] leading-none text-solar-text font-semibold tracking-tight">
                Mundo
              </h1>
              <p className="text-solar-muted/70 text-xs font-mono mt-2">
                {filtered.length} {filtered.length === 1 ? "obra" : "obras"} ·{" "}
                {withLocation.length} geolocalizadas
              </p>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <input
                type="text"
                placeholder="Filtrar..."
                onChange={(e) => setQuery(e.target.value)}
                className="
                  bg-transparent border-b border-solar-border/50
                  px-0 py-1 text-xs font-mono text-solar-text
                  placeholder:text-solar-muted/55
                  focus:outline-none focus:border-solar-amber/40
                  transition-all duration-200 w-36
                "
              />
              <ViewSwitcher current={view} onChange={setView} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-64 border border-dashed border-solar-border/20">
                <p className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/25">
                  {query ? `Sem resultados para "${query}"` : "Acervo vazio"}
                </p>
              </div>
            ) : view === "galeria" ? (
              <GalleryView items={filtered} onItemClick={setActiveItem} />
            ) : view === "mapa" ? (
              <WorldMapView items={filtered} onItemClick={setActiveItem} />
            ) : (
              <MosaicView items={filtered} onItemClick={setActiveItem} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ItemDrawer item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  )
}
