/**
 * mirror.ts — escrita server-side dos arquivos .md espelho.
 * Funciona em desenvolvimento e produção (quando o filesystem é gravável).
 * Suporta: AtlasItem, JournalEntry, Page (Workspace).
 */

import { promises as fs } from "fs"
import path               from "path"
import matter             from "gray-matter"
import { blockNoteToMarkdown } from "./blocknote-md"
import type { AtlasItemWithTags, AtlasRelation } from "@/atlas/types"

export type RelationEdge = Pick<AtlasRelation, "toItemId" | "relationType">

// ── Helpers de caminho ────────────────────────────────────────────────────────

function areaFolder(area: string): string {
  return area.toLowerCase()
}

function fileBase(slug: string | null | undefined, id: string): string {
  return (slug ?? id).replace(/[^a-z0-9-_]/gi, "-").toLowerCase()
}

// ── AtlasItem ─────────────────────────────────────────────────────────────────

/**
 * Resolve caminho absoluto do .md de um AtlasItem.
 * Enciclopédico:  content/atlas/{area}/{slug-ou-id}.md
 * Compass/pessoal: content/compass/{username}/{area}/{slug-ou-id}.md
 */
export function resolveMirrorPath(
  item: { id: string; slug?: string | null; area: string; hemisphere: string },
  username?: string
): string {
  const base = fileBase(item.slug, item.id)
  const rel  = item.hemisphere === "COMPASS" && username
    ? path.join("content", "compass", username, areaFolder(item.area), `${base}.md`)
    : path.join("content", "atlas", areaFolder(item.area), `${base}.md`)
  return path.join(process.cwd(), rel)
}

/** Caminho relativo (para guardar em AtlasItem.contentPath). */
export function resolveMirrorRelPath(
  item: { id: string; slug?: string | null; area: string; hemisphere: string },
  username?: string
): string {
  const base = fileBase(item.slug, item.id)
  return item.hemisphere === "COMPASS" && username
    ? `content/compass/${username}/${areaFolder(item.area)}/${base}.md`
    : `content/atlas/${areaFolder(item.area)}/${base}.md`
}

/** Constrói o conteúdo do arquivo .md para AtlasItem. */
export function buildMirrorContent(
  item: Pick<
    AtlasItemWithTags,
    "id" | "slug" | "title" | "type" | "area" | "hemisphere" | "status" |
    "isFavorite" | "isPinned" | "tags" | "coverImage" | "location" |
    "metadata" | "createdAt" | "updatedAt"
  >,
  markdownBody: string,
  relations: RelationEdge[] = []
): string {
  const meta = item.metadata ? (() => {
    try { return JSON.parse(item.metadata!) as Record<string, unknown> } catch { return {} }
  })() : {}

  const frontmatter: Record<string, unknown> = {
    id:         item.id,
    slug:       item.slug ?? undefined,
    title:      item.title,
    type:       item.type,
    area:       item.area,
    hemisphere: item.hemisphere,
    status:     item.status,
    isFavorite: item.isFavorite,
    isPinned:   item.isPinned,
    tags:       item.tags.map((t) => t.name),
    ...(item.coverImage ? { coverImage: item.coverImage } : {}),
    ...(item.location   ? { location:   item.location   } : {}),
    ...(Object.keys(meta).length > 0 ? { metadata: meta } : {}),
    ...(relations.length > 0 ? {
      relations: relations.map((r) => ({ toId: r.toItemId, type: r.relationType })),
    } : {}),
    createdAt:  item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
    updatedAt:  item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
  }

  return matter.stringify(markdownBody || "", frontmatter)
}

/** Escreve o arquivo .md de um AtlasItem. */
export async function writeMirror(
  item: Pick<
    AtlasItemWithTags,
    "id" | "slug" | "title" | "type" | "area" | "hemisphere" | "status" |
    "isFavorite" | "isPinned" | "tags" | "coverImage" | "location" |
    "metadata" | "createdAt" | "updatedAt"
  >,
  markdownBody: string,
  relations: RelationEdge[] = [],
  username?: string
): Promise<string> {
  const content  = buildMirrorContent(item, markdownBody, relations)
  const filePath = resolveMirrorPath(item, username)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, "utf-8")
  return filePath
}

/** Remove o arquivo .md de um AtlasItem. */
export async function deleteMirror(
  item: { id: string; slug?: string | null; area: string; hemisphere: string },
  username?: string
): Promise<void> {
  const filePath = resolveMirrorPath(item, username)
  await fs.unlink(filePath).catch(() => { /* ignora se não existe */ })
}

// ── JournalEntry ──────────────────────────────────────────────────────────────

export function resolveJournalMirrorPath(date: string, username?: string): string {
  const folder = username ? `compass/${username}/diario` : "compass/diario"
  return path.join(process.cwd(), "content", folder, `${date}.md`)
}

export function resolveJournalMirrorRelPath(date: string, username?: string): string {
  const folder = username ? `compass/${username}/diario` : "compass/diario"
  return `content/${folder}/${date}.md`
}

export function buildJournalMirrorContent(entry: {
  id:         string
  date:       string
  energy:     number
  intention?: string | null
  mood?:      string | null
  createdAt:  Date | string
  updatedAt:  Date | string
}, body: string): string {
  const frontmatter: Record<string, unknown> = {
    id:        entry.id,
    date:      entry.date,
    energy:    entry.energy,
    ...(entry.intention ? { intention: entry.intention } : {}),
    ...(entry.mood      ? { mood:      entry.mood      } : {}),
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : String(entry.createdAt),
    updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : String(entry.updatedAt),
  }
  return matter.stringify(body || "", frontmatter)
}

export async function writeJournalMirror(
  entry: {
    id:         string
    date:       string
    content?:   string | null
    energy:     number
    intention?: string | null
    mood?:      string | null
    createdAt:  Date | string
    updatedAt:  Date | string
  },
  username?: string
): Promise<string> {
  const body     = blockNoteToMarkdown(entry.content)
  const content  = buildJournalMirrorContent(entry, body)
  const filePath = resolveJournalMirrorPath(entry.date, username)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, "utf-8")
  return filePath
}

// ── Page (Workspace / Blog) ───────────────────────────────────────────────────

export function resolvePageMirrorPath(slug: string | null, id: string, username: string): string {
  const base = fileBase(slug, id)
  return path.join(process.cwd(), "content", "workspace", username, `${base}.md`)
}

export function resolvePageMirrorRelPath(slug: string | null, id: string, username: string): string {
  const base = fileBase(slug, id)
  return `content/workspace/${username}/${base}.md`
}

export function buildPageMirrorContent(
  page: {
    id:        string
    title:     string
    icon?:     string | null
    slug?:     string | null
    isPublic:  boolean
    isBlog:    boolean
    parentId?: string | null
    createdAt: Date | string
    updatedAt: Date | string
  },
  body: string
): string {
  const frontmatter: Record<string, unknown> = {
    id:       page.id,
    title:    page.title,
    ...(page.icon     ? { icon:     page.icon     } : {}),
    ...(page.slug     ? { slug:     page.slug     } : {}),
    isPublic: page.isPublic,
    isBlog:   page.isBlog,
    ...(page.parentId ? { parentId: page.parentId } : {}),
    createdAt: page.createdAt instanceof Date ? page.createdAt.toISOString() : String(page.createdAt),
    updatedAt: page.updatedAt instanceof Date ? page.updatedAt.toISOString() : String(page.updatedAt),
  }
  return matter.stringify(body || "", frontmatter)
}

export async function writePageMirror(
  page: {
    id:        string
    title:     string
    icon?:     string | null
    slug?:     string | null
    content?:  string | null
    isPublic:  boolean
    isBlog:    boolean
    parentId?: string | null
    createdAt: Date | string
    updatedAt: Date | string
  },
  username: string
): Promise<string> {
  const body     = blockNoteToMarkdown(page.content)
  const content  = buildPageMirrorContent(page, body)
  const filePath = resolvePageMirrorPath(page.slug ?? null, page.id, username)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, "utf-8")
  return filePath
}
