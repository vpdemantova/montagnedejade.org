"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import type { AtlasItemWithTags } from "@/atlas/types"

// ── Excerpt helper ─────────────────────────────────────────────────────────────

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

// ── Note card ──────────────────────────────────────────────────────────────────

function NoteCard({ item }: { item: AtlasItemWithTags }) {
  const excerpt = getExcerpt(item.content)
  const date = new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })

  return (
    <Link
      href={`/compass/notas/${item.id}`}
      className="group block border border-solar-border/20 bg-solar-void/30 p-4 hover:bg-compass-neon/4 hover:border-compass-neon/20 transition-solar"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[11px] font-mono text-solar-text/85 group-hover:text-solar-text transition-solar line-clamp-2 flex-1">
          {item.title}
        </h3>
        <span className="text-[8px] font-mono text-solar-muted/35 flex-shrink-0 mt-0.5">{date}</span>
      </div>

      {excerpt && (
        <p className="text-[10px] font-mono text-solar-muted/45 line-clamp-3 mb-3">
          {excerpt}
        </p>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="text-[8px] font-mono px-1.5 py-0.5 border border-solar-border/30 text-solar-muted/50 uppercase tracking-widest"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NotasPage() {
  const [notes, setNotes] = useState<AtlasItemWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/atlas?area=NOTAS&limit=200")
      .then((r) => r.json())
      .then((data: AtlasItemWithTags[]) => { setNotes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        getExcerpt(n.content).toLowerCase().includes(q) ||
        n.tags.some((t) => t.name.toLowerCase().includes(q))
    )
  }, [notes, search])

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-12">
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

      <div className="relative z-10 max-w-6xl mx-auto px-12 py-6 space-y-6">

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
              {search ? "Nenhuma nota encontrada." : "Nenhuma nota ainda."}
            </p>
            {!search && (
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
                <NoteCard item={note} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
