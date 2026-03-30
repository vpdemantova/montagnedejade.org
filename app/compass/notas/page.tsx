"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import type { AtlasItemWithTags } from "@/atlas/types"

// ── Helpers ────────────────────────────────────────────────────────────────────

function getExcerpt(content: string | null, maxChars = 160): string {
  if (!content) return ""
  try {
    const blocks = JSON.parse(content) as Array<{ content?: Array<{ text?: string }> }>
    return blocks
      .flatMap((b) => (b.content ?? []).map((c) => c.text ?? ""))
      .join(" ")
      .trim()
      .slice(0, maxChars)
  } catch { return "" }
}

function getMeta(item: AtlasItemWithTags): { noteType?: string; url?: string } {
  if (!item.metadata) return {}
  try { return JSON.parse(item.metadata) as { noteType?: string; url?: string } }
  catch { return {} }
}

// ── Note card ──────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  nota:  "Nota",
  ideia: "Ideia",
  link:  "Link",
}

function NoteCard({
  item,
  onTagClick,
}: {
  item: AtlasItemWithTags
  onTagClick: (tag: string) => void
}) {
  const excerpt = getExcerpt(item.content)
  const date = new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
  const { noteType, url } = getMeta(item)
  const badge = noteType ? TYPE_BADGE[noteType] : undefined

  return (
    <Link
      href={`/compass/notas/${item.id}`}
      className="group block border border-solar-border/20 bg-solar-void/30 p-4 hover:bg-compass-neon/4 hover:border-compass-neon/20 transition-solar"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[11px] font-mono text-solar-text/85 group-hover:text-solar-text transition-solar line-clamp-2 flex-1">
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {badge && (
            <span className="text-[7px] font-mono px-1 py-0.5 border border-compass-neon/20 text-compass-neon/50 uppercase tracking-widest">
              {badge}
            </span>
          )}
          <span className="text-[8px] font-mono text-solar-muted/35">{date}</span>
        </div>
      </div>

      {excerpt && (
        <p className="text-[10px] font-mono text-solar-muted/45 line-clamp-3 mb-3">
          {excerpt}
        </p>
      )}

      {url && noteType === "link" && (
        <p className="text-[9px] font-mono text-compass-neon/40 truncate mb-2">
          {url}
        </p>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1" onClick={(e) => e.preventDefault()}>
          {item.tags.slice(0, 3).map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(tag.name)}
              className="text-[8px] font-mono px-1.5 py-0.5 border border-solar-border/30 text-solar-muted/50 uppercase tracking-widest hover:border-compass-neon/30 hover:text-compass-neon/60 transition-solar"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

type TypeFilter = "todas" | "nota" | "ideia" | "link"
type SortBy = "recentes" | "antigos" | "az"

const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "nota",  label: "Nota" },
  { id: "ideia", label: "Ideia" },
  { id: "link",  label: "Link" },
]

const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: "recentes", label: "Recentes" },
  { id: "antigos",  label: "Antigos" },
  { id: "az",       label: "A–Z" },
]

export default function NotasPage() {
  const [notes,      setNotes]      = useState<AtlasItemWithTags[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todas")
  const [sortBy,     setSortBy]     = useState<SortBy>("recentes")
  const [activeTag,  setActiveTag]  = useState<string | null>(null)
  const [showSort,   setShowSort]   = useState(false)

  useEffect(() => {
    fetch("/api/atlas?area=NOTAS&limit=200")
      .then((r) => r.json())
      .then((data: AtlasItemWithTags[]) => { setNotes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = notes

    if (typeFilter !== "todas")
      result = result.filter((n) => getMeta(n).noteType === typeFilter)

    if (activeTag)
      result = result.filter((n) => n.tags.some((t) => t.name === activeTag))

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          getExcerpt(n.content).toLowerCase().includes(q) ||
          n.tags.some((t) => t.name.toLowerCase().includes(q))
      )
    }

    if (sortBy === "antigos")
      result = [...result].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    else if (sortBy === "az")
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))

    return result
  }, [notes, typeFilter, activeTag, search, sortBy])

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag))
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Notas
          </p>
          <div className="flex items-end justify-between gap-6">
            <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
              Notas
            </h1>
            <Link
              href="/compass/notas/novo"
              className="flex-shrink-0 px-4 py-2 border border-compass-neon/40 bg-compass-neon/8 text-[10px] font-mono uppercase tracking-widest text-compass-neon hover:bg-compass-neon/15 transition-solar"
            >
              + Nova nota
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 py-6 space-y-3">

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Type tabs */}
          <div className="flex gap-1">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest transition-solar
                  ${typeFilter === tab.id
                    ? "border border-compass-neon/40 bg-compass-neon/8 text-compass-neon"
                    : "border border-solar-border/20 text-solar-muted/50 hover:text-solar-text hover:border-solar-border/40"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-solar-border/20 text-[9px] font-mono uppercase tracking-widest text-solar-muted/50 hover:text-solar-text hover:border-solar-border/40 transition-solar"
            >
              {SORT_OPTIONS.find((o) => o.id === sortBy)?.label}
              <span className="text-[8px] opacity-60">▾</span>
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-solar-void border border-solar-border/30 min-w-[100px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => { setSortBy(opt.id); setShowSort(false) }}
                    className={`w-full text-left px-3 py-2 text-[9px] font-mono uppercase tracking-widest transition-solar
                      ${sortBy === opt.id ? "text-compass-neon" : "text-solar-muted/60 hover:text-solar-text"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active tag chip */}
        {activeTag && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 border border-compass-neon/30 bg-compass-neon/6 text-[9px] font-mono text-compass-neon/70 hover:bg-compass-neon/12 transition-solar"
            >
              <span className="opacity-60">#</span>
              {activeTag}
              <span className="ml-0.5 opacity-60">×</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notas…"
            className="w-full bg-transparent border border-solar-border/30 px-4 py-2.5 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-compass-neon/40 transition-solar"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-solar-muted/40 hover:text-solar-muted transition-solar text-sm"
            >
              ×
            </button>
          )}
        </div>

        {/* Grid masonry-style */}
        {loading ? (
          <p className="text-[10px] font-mono text-solar-muted/40">Carregando…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[10px] font-mono text-solar-muted/40">
              {search || activeTag || typeFilter !== "todas" ? "Nenhuma nota encontrada." : "Nenhuma nota ainda."}
            </p>
            {!search && !activeTag && typeFilter === "todas" && (
              <Link
                href="/compass/notas/novo"
                className="block mt-3 text-[10px] font-mono text-compass-neon/60 hover:text-compass-neon transition-solar"
              >
                Criar primeira nota →
              </Link>
            )}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {filtered.map((note) => (
              <div key={note.id} className="break-inside-avoid mb-4">
                <NoteCard item={note} onTagClick={handleTagClick} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
