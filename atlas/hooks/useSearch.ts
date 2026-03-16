"use client"

import { useState, useMemo } from "react"
import { createSearchIndex, fuzzySearch } from "@/atlas/lib/search"
import type { AtlasItemWithTags, SearchResult } from "@/atlas/types"

/**
 * Hook de busca fuzzy — encapsula o índice Fuse.js.
 * Recebe a lista de itens e retorna uma função de busca e os resultados.
 */
export function useSearch(items: AtlasItemWithTags[]) {
  const [query, setQuery] = useState("")

  // Reconstrói o índice apenas quando a lista de itens muda
  const fuse = useMemo(() => createSearchIndex(items), [items])

  const results: SearchResult[] = useMemo(
    () => (query.trim() ? fuzzySearch(fuse, query) : []),
    [fuse, query]
  )

  return {
    query,
    setQuery,
    results,
    isSearching: query.trim().length > 0,
  }
}
