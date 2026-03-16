import Fuse from "fuse.js"
import type { IFuseOptions } from "fuse.js"
import type { AtlasItemWithTags, SearchResult } from "@/atlas/types"

// Configuração do Fuse.js — busca fuzzy com pesos por campo
const FUSE_OPTIONS: IFuseOptions<AtlasItemWithTags> = {
  keys: [
    { name: "title",     weight: 0.5  },
    { name: "tags.name", weight: 0.25 },
    { name: "content",   weight: 0.12 },
    { name: "area",      weight: 0.07 }, // permite buscar "academia", "artes"...
    { name: "type",      weight: 0.06 }, // permite buscar "pessoa", "obra"...
  ],
  threshold: 0.35,       // 0 = exato, 1 = qualquer coisa
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,  // busca no texto inteiro, não apenas no início
}

/**
 * Cria um índice de busca Fuse.js a partir de uma lista de itens.
 * Recrie o índice sempre que a lista de itens mudar.
 */
export function createSearchIndex(
  items: AtlasItemWithTags[]
): Fuse<AtlasItemWithTags> {
  return new Fuse(items, FUSE_OPTIONS)
}

/**
 * Executa uma busca fuzzy e retorna resultados formatados.
 */
export function fuzzySearch(
  fuse: Fuse<AtlasItemWithTags>,
  query: string
): SearchResult[] {
  if (!query.trim()) return []

  const results = fuse.search(query)

  return results.map((result) => ({
    item: result.item,
    score: result.score ?? 1,
    matchedFields: (result.matches ?? [])
      .map((m) => m.key ?? "")
      .filter(Boolean),
  }))
}
