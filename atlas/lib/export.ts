import { findById } from "@/atlas/lib/db"
import { stringifyMarkdown, deserializeMetadata } from "@/atlas/lib/metadata"
import matter from "gray-matter"
import type { AtlasItemWithTags } from "@/atlas/types"

// ─── Exportação clássica (servidor) ──────────────────────────────────────────

export async function exportToMarkdown(id: string): Promise<string> {
  const item = await findById(id)
  if (!item) throw new Error(`Item ${id} não encontrado`)

  const metadata = deserializeMetadata(item.metadata)

  const frontmatter = {
    id:     item.id,
    title:  item.title,
    type:   item.type,
    area:   item.area,
    status: item.status,
    tags:   item.tags.map((t) => t.name),
    created: item.createdAt.toISOString(),
    updated: item.updatedAt.toISOString(),
    ...metadata,
  }

  const body = item.content
    ? `<!-- BlockNote JSON -->\n\`\`\`json\n${item.content}\n\`\`\``
    : ""

  return stringifyMarkdown(frontmatter, body)
}

export async function exportToJson(id: string): Promise<string> {
  const item = await findById(id)
  if (!item) throw new Error(`Item ${id} não encontrado`)

  return JSON.stringify(
    { ...item, metadata: item.metadata ? JSON.parse(item.metadata) : null, tags: item.tags.map((t) => t.name) },
    null, 2
  )
}

// ─── Espelho .md — gerado pelo cliente após conversão BlockNote → markdown ────

/**
 * Gera o conteúdo do arquivo .md espelho.
 * markdownBody já vem convertido pelo editor (blocksToMarkdownLossy).
 */
export function generateMarkdownMirror(
  item: Pick<AtlasItemWithTags,
    "id" | "title" | "type" | "area" | "hemisphere" | "status" | "isFavorite" | "tags" | "createdAt" | "updatedAt"
  >,
  markdownBody: string
): string {
  const frontmatter = {
    id:         item.id,
    title:      item.title,
    type:       item.type,
    area:       item.area,
    hemisphere: item.hemisphere,
    status:     item.status,
    isFavorite: item.isFavorite,
    tags:       item.tags.map((t) => t.name),
    createdAt:  item.createdAt,
    updatedAt:  item.updatedAt,
  }
  return matter.stringify(markdownBody || "", frontmatter)
}

/** Resolve o path relativo do .md espelho para um item. */
export function resolveContentPath(item: { id: string; area: string; hemisphere: string }): string {
  const section = item.hemisphere === "COMPASS"
    ? `compass/${item.area.toLowerCase()}`
    : "atlas"
  return `content/${section}/${item.id}.md`
}

/** Estatísticas de conteúdo a partir de texto plano. */
export function contentStats(text: string): { words: number; chars: number; minutes: number } {
  const words   = text.trim().split(/\s+/).filter(Boolean).length
  const chars   = text.length
  const minutes = Math.max(1, Math.round(words / 200))
  return { words, chars, minutes }
}
