import matter from "gray-matter"
import type { AtlasMetadata } from "@/atlas/types"

export type ParsedContent = {
  data: AtlasMetadata
  content: string
  excerpt?: string
}

/**
 * Parseia um arquivo Markdown com frontmatter YAML.
 * Retorna os metadados e o corpo do texto separados.
 */
export function parseMarkdown(raw: string): ParsedContent {
  const { data, content, excerpt } = matter(raw, {
    excerpt: true,
    excerpt_separator: "<!-- more -->",
  })

  return {
    data: data as AtlasMetadata,
    content: content.trim(),
    excerpt: excerpt?.trim(),
  }
}

/**
 * Serializa metadados e conteúdo de volta para formato Markdown com frontmatter.
 */
export function stringifyMarkdown(
  data: AtlasMetadata,
  content: string
): string {
  return matter.stringify(content, data as Record<string, unknown>)
}

/**
 * Serializa metadados de AtlasItem para string JSON (campo metadata no banco).
 */
export function serializeMetadata(metadata: AtlasMetadata): string {
  return JSON.stringify(metadata)
}

/**
 * Desserializa o campo metadata do banco de volta para objeto.
 */
export function deserializeMetadata(raw: string | null): AtlasMetadata {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as AtlasMetadata
  } catch {
    return {}
  }
}
