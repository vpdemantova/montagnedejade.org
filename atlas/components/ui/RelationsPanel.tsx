"use client"

import { useState, useEffect, useRef } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

type RelatedItem = { id: string; title: string; type: string; area: string }

type Relation = {
  id:           string
  relationType: string
  fromItem:     RelatedItem
  toItem:       RelatedItem
}

// ── Relation type options ─────────────────────────────────────────────────────

const RELATION_TYPES = [
  "referencia",
  "inspira",
  "parte-de",
  "autor-de",
  "influenciou",
  "contradiz",
  "complementa",
  "cita",
]

// ── Search autocomplete ───────────────────────────────────────────────────────

function ItemSearch({
  itemId,
  onSelect,
}: {
  itemId:   string
  onSelect: (item: RelatedItem) => void
}) {
  const [query,    setQuery]    = useState("")
  const [results,  setResults]  = useState<RelatedItem[]>([])
  const [open,     setOpen]     = useState(false)
  const debounce   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      const res  = await fetch(`/api/atlas?search=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json() as RelatedItem[]
      setResults(data.filter((i) => i.id !== itemId))
      setOpen(true)
    }, 200)
  }, [query, itemId])

  const pick = (item: RelatedItem) => {
    onSelect(item)
    setQuery(item.title)
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Buscar item..."
        className="
          w-full bg-solar-deep/50 border border-solar-border/30
          px-3 py-1.5 text-[10px] font-mono text-solar-text
          placeholder:text-solar-muted/30
          focus:outline-none focus:border-solar-amber/35
          transition-all
        "
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 bg-solar-deep border border-solar-border/40 max-h-44 overflow-y-auto shadow-xl">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => pick(item)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-solar-surface/40 text-left transition-colors"
            >
              <span className="text-[8px] font-mono text-solar-muted/40 uppercase w-16 flex-shrink-0">{item.area}</span>
              <span className="text-[10px] font-mono text-solar-text/80 truncate">{item.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function RelationsPanel({ itemId }: { itemId: string }) {
  const [relations,  setRelations]  = useState<Relation[]>([])
  const [loading,    setLoading]    = useState(true)
  const [expanded,   setExpanded]   = useState(false)
  const [target,     setTarget]     = useState<RelatedItem | null>(null)
  const [relType,    setRelType]    = useState(RELATION_TYPES[0]!)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    if (!itemId) return
    fetch(`/api/atlas/${itemId}/relations`)
      .then((r) => r.json() as Promise<Relation[]>)
      .then((data) => { setRelations(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [itemId])

  const addRelation = async () => {
    if (!target) return
    setSaving(true)
    const res      = await fetch(`/api/atlas/${itemId}/relations`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ toItemId: target.id, relationType: relType }),
    })
    const created  = await res.json() as { id: string; relationType: string }
    // Reconstruct full relation object
    setRelations((prev) => [
      ...prev,
      {
        id:           created.id,
        relationType: created.relationType,
        fromItem:     { id: itemId, title: "Este item", type: "", area: "" },
        toItem:       target,
      },
    ])
    setTarget(null)
    setSaving(false)
    setExpanded(false)
  }

  const remove = async (relationId: string) => {
    await fetch(`/api/atlas/${itemId}/relations?relationId=${relationId}`, { method: "DELETE" })
    setRelations((prev) => prev.filter((r) => r.id !== relationId))
  }

  const getOther = (r: Relation): RelatedItem =>
    r.fromItem.id === itemId ? r.toItem : r.fromItem

  return (
    <div className="px-6 py-4 border-t border-solar-border/30">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/50">
          Relações {relations.length > 0 && `· ${relations.length}`}
        </p>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[8px] font-mono text-solar-muted/35 hover:text-solar-amber/60 transition-colors uppercase tracking-widest"
        >
          {expanded ? "Cancelar" : "+ Conectar"}
        </button>
      </div>

      {/* Add form */}
      {expanded && (
        <div className="flex flex-col gap-2 mb-4 p-3 border border-solar-border/20 bg-solar-surface/10">
          <ItemSearch itemId={itemId} onSelect={setTarget} />
          <div className="flex gap-2">
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="flex-1 bg-solar-deep border border-solar-border/30 px-2 py-1.5 text-[10px] font-mono text-solar-muted/70 focus:outline-none focus:border-solar-amber/35"
            >
              {RELATION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={addRelation}
              disabled={!target || saving}
              className="
                px-3 py-1.5 border border-solar-amber/40 text-[9px] font-mono
                text-solar-amber hover:bg-solar-amber/10 transition-all
                disabled:opacity-30
              "
            >
              {saving ? "..." : "Conectar"}
            </button>
          </div>
        </div>
      )}

      {/* Relations list */}
      {loading ? (
        <p className="text-[9px] font-mono text-solar-muted/25 animate-pulse">Carregando...</p>
      ) : relations.length === 0 ? (
        <p className="text-[9px] font-mono text-solar-muted/25">Sem relações ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {relations.map((r) => {
            const other     = getOther(r)
            const direction = r.fromItem.id === itemId ? "→" : "←"
            return (
              <div key={r.id} className="flex items-center gap-2 group">
                <span className="text-[8px] font-mono text-solar-muted/25 w-3">{direction}</span>
                <span className="text-[8px] font-mono text-solar-amber/50 border border-solar-amber/15 px-1 py-0.5 flex-shrink-0">
                  {r.relationType}
                </span>
                <a
                  href={`/atlas/${other.id}`}
                  className="text-[10px] font-mono text-solar-text/70 hover:text-solar-amber truncate transition-colors flex-1"
                >
                  {other.title}
                </a>
                <button
                  onClick={() => remove(r.id)}
                  className="text-[8px] font-mono text-solar-muted/15 hover:text-solar-red/50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
