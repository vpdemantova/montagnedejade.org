import Fuse from "fuse.js"
import type { IFuseOptions } from "fuse.js"
import type { AtlasItemWithTags, SearchResult } from "@/atlas/types"

// ── Fuse options (title:3 | tags:2 | excerpt:1) ───────────────────────────────

const FUSE_OPTIONS: IFuseOptions<AtlasItemWithTags> = {
  keys: [
    { name: "title",     weight: 3 },
    { name: "tags.name", weight: 2 },
    { name: "content",   weight: 1 },
    { name: "area",      weight: 0.5 },
  ],
  threshold:          0.35,
  includeScore:       true,
  includeMatches:     true,
  minMatchCharLength: 2,
  ignoreLocation:     true,
}

export function createSearchIndex(items: AtlasItemWithTags[]): Fuse<AtlasItemWithTags> {
  return new Fuse(items, FUSE_OPTIONS)
}

export function fuzzySearch(fuse: Fuse<AtlasItemWithTags>, query: string): SearchResult[] {
  if (!query.trim()) return []
  return fuse.search(query).map((r) => ({
    item:          r.item,
    score:         r.score ?? 1,
    matchedFields: (r.matches ?? []).map((m) => m.key ?? "").filter(Boolean),
  }))
}

// ── Prefix resolution ─────────────────────────────────────────────────────────

export type SearchMode =
  | { type: "normal";  query: string }
  | { type: "notas";   query: string }   // > texto
  | { type: "autores"; query: string }   // @ nome
  | { type: "tag";     query: string }   // # tag

export function resolveSearchMode(raw: string): SearchMode {
  const trimmed = raw.trimStart()
  if (trimmed.startsWith("> "))   return { type: "notas",   query: trimmed.slice(2).trim() }
  if (trimmed.startsWith(">"))    return { type: "notas",   query: trimmed.slice(1).trim() }
  if (trimmed.startsWith("@ "))   return { type: "autores", query: trimmed.slice(2).trim() }
  if (trimmed.startsWith("@"))    return { type: "autores", query: trimmed.slice(1).trim() }
  if (trimmed.startsWith("# "))   return { type: "tag",     query: trimmed.slice(2).trim() }
  if (trimmed.startsWith("#"))    return { type: "tag",     query: trimmed.slice(1).trim() }
  return { type: "normal", query: trimmed }
}

export function applySearchMode(
  items: AtlasItemWithTags[],
  mode: SearchMode
): AtlasItemWithTags[] {
  switch (mode.type) {
    case "notas":   return items.filter((i) => i.area === "NOTAS")
    case "autores": return items.filter((i) => i.type === "PERSON")
    case "tag":     return mode.query
      ? items.filter((i) => i.tags.some((t) => t.name.toLowerCase().includes(mode.query.toLowerCase())))
      : items
    default: return items
  }
}
