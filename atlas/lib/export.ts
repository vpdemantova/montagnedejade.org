import { findById } from "@/atlas/lib/db"
import { stringifyMarkdown, deserializeMetadata } from "@/atlas/lib/metadata"

/**
 * Exporta um item do Atlas como string Markdown com frontmatter YAML.
 * Formato compatível com reimportação e leitura humana.
 */
export async function exportToMarkdown(id: string): Promise<string> {
  const item = await findById(id)
  if (!item) throw new Error(`Item ${id} não encontrado`)

  const metadata = deserializeMetadata(item.metadata)

  const frontmatter = {
    id: item.id,
    title: item.title,
    type: item.type,
    area: item.area,
    status: item.status,
    tags: item.tags.map((t) => t.name),
    created: item.createdAt.toISOString(),
    updated: item.updatedAt.toISOString(),
    ...metadata,
  }

  // Conteúdo BlockNote é JSON — exportamos como bloco de código por ora
  const body = item.content
    ? `<!-- BlockNote JSON -->\n\`\`\`json\n${item.content}\n\`\`\``
    : ""

  return stringifyMarkdown(frontmatter, body)
}

/**
 * Exporta um item do Atlas como string JSON estruturado.
 */
export async function exportToJson(id: string): Promise<string> {
  const item = await findById(id)
  if (!item) throw new Error(`Item ${id} não encontrado`)

  return JSON.stringify(
    {
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
      tags: item.tags.map((t) => t.name),
    },
    null,
    2
  )
}
