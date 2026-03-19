"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Fuse from "fuse.js"
import type { AtlasItemWithTags, SearchResult } from "@/atlas/types"
import { createSearchIndex, fuzzySearch, resolveSearchMode, applySearchMode } from "@/atlas/lib/search"

export function useGlobalSearch() {
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState("")
  const [items,   setItems]   = useState<AtlasItemWithTags[]>([])
  const [loaded,  setLoaded]  = useState(false)
  const fuseRef               = useRef<Fuse<AtlasItemWithTags> | null>(null)

  // Lazy-load items on first open
  useEffect(() => {
    if (!open || loaded) return
    fetch("/api/atlas?limit=5000")
      .then((r) => r.json())
      .then((data: AtlasItemWithTags[]) => {
        setItems(data)
        fuseRef.current = createSearchIndex(data)
        setLoaded(true)
      })
      .catch(console.error)
  }, [open, loaded])

  // Cmd/Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const close = useCallback(() => { setOpen(false); setQuery("") }, [])

  const mode = useMemo(() => resolveSearchMode(query), [query])

  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || !fuseRef.current) return []
    const pool = applySearchMode(items, mode)
    if (!mode.query) return pool.slice(0, 8).map((item) => ({ item, score: 1, matchedFields: [] }))
    const tempFuse = createSearchIndex(pool)
    return fuzzySearch(tempFuse, mode.query).slice(0, 12)
  }, [query, items, mode])

  // Grouped by hemisphere
  const grouped = useMemo(() => ({
    portal:  results.filter((r) => r.item.hemisphere === "PORTAL"),
    compass: results.filter((r) => r.item.hemisphere === "COMPASS"),
  }), [results])

  return { open, setOpen, close, query, setQuery, results, grouped, mode, loaded }
}
