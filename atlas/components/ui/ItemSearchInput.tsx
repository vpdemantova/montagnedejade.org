"use client"

import { useState, useEffect, useRef } from "react"

export type SearchableItem = { id: string; title: string; type: string; area: string; slug: string | null }

type ItemSearchInputProps = {
  onSelect:    (item: SearchableItem) => void
  excludeId?:  string
  placeholder?: string
}

// Autocomplete de itens do Atlas — usado por RelationsPanel e AssetDrawer.
export function ItemSearchInput({ onSelect, excludeId, placeholder = "Buscar item..." }: ItemSearchInputProps) {
  const [query,   setQuery]   = useState("")
  const [results, setResults] = useState<SearchableItem[]>([])
  const [open,    setOpen]    = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      const res  = await fetch(`/api/atlas?q=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json() as SearchableItem[]
      setResults(excludeId ? data.filter((i) => i.id !== excludeId) : data)
      setOpen(true)
    }, 200)
  }, [query, excludeId])

  const pick = (item: SearchableItem) => {
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
        placeholder={placeholder}
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
