/**
 * mirror.ts — escrita server-side do arquivo .md espelho
 * Pode ser importado em API routes e scripts Node.js.
 */

import { promises as fs } from "fs"
import path from "path"
import matter from "gray-matter"
import type { AtlasItemWithTags, AtlasRelation } from "@/atlas/types"

export type RelationEdge = Pick<AtlasRelation, "toItemId" | "relationType">

/**
 * Gera o conteúdo do arquivo .md espelho com frontmatter canônico.
 * markdownBody: conteúdo convertido do editor (ou string vazia).
 * relations: lista de relações FROM este item.
 */
export function buildMirrorContent(
  item: Pick<
    AtlasItemWithTags,
    "id" | "title" | "type" | "area" | "hemisphere" | "status" | "isFavorite" | "tags" | "createdAt" | "updatedAt"
  >,
  markdownBody: string,
  relations: RelationEdge[] = []
): string {
  const frontmatter: Record<string, unknown> = {
    id:         item.id,
    title:      item.title,
    type:       item.type,
    area:       item.area,
    hemisphere: item.hemisphere,
    status:     item.status,
    isFavorite: item.isFavorite,
    tags:       item.tags.map((t) => t.name),
    created:    item.createdAt instanceof Date
      ? item.createdAt.toISOString()
      : String(item.createdAt),
    updated:    item.updatedAt instanceof Date
      ? item.updatedAt.toISOString()
      : String(item.updatedAt),
  }

  if (relations.length > 0) {
    frontmatter.relations = relations.map((r) => ({
      toId: r.toItemId,
      type: r.relationType,
    }))
  }

  return matter.stringify(markdownBody || "", frontmatter)
}

/**
 * Resolve o caminho absoluto do .md espelho dado o item.
 */
export function resolveMirrorPath(item: { id: string; area: string; hemisphere: string }): string {
  const section = item.hemisphere === "COMPASS"
    ? `compass/${item.area.toLowerCase()}`
    : "atlas"
  return path.join(process.cwd(), "content", section, `${item.id}.md`)
}

/**
 * Resolve o caminho relativo (para guardar no banco em contentPath).
 */
export function resolveMirrorRelPath(item: { id: string; area: string; hemisphere: string }): string {
  const section = item.hemisphere === "COMPASS"
    ? `compass/${item.area.toLowerCase()}`
    : "atlas"
  return `content/${section}/${item.id}.md`
}

/**
 * Escreve o arquivo .md espelho em disco.
 * Cria diretórios pai se necessário.
 */
export async function writeMirror(
  item: Pick<
    AtlasItemWithTags,
    "id" | "title" | "type" | "area" | "hemisphere" | "status" | "isFavorite" | "tags" | "createdAt" | "updatedAt"
  >,
  markdownBody: string,
  relations: RelationEdge[] = []
): Promise<string> {
  const content  = buildMirrorContent(item, markdownBody, relations)
  const filePath = resolveMirrorPath(item)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, "utf-8")
  return filePath
}

/**
 * Apaga o arquivo .md espelho de um item (usado em DELETE).
 */
export async function deleteMirror(item: { id: string; area: string; hemisphere: string }): Promise<void> {
  const filePath = resolveMirrorPath(item)
  await fs.unlink(filePath).catch(() => { /* ignora se não existe */ })
}
