/**
 * sync-up.ts — importa arquivos .md para o banco de dados.
 *
 * SEGURO: usa upsert por ID. Nunca apaga dados sociais (users, follows, posts, etc.).
 * Só atualiza um item se o arquivo for mais recente que o registro no banco.
 *
 * Suporta:
 *   - content/atlas/           → AtlasItem (enciclopédico)
 *   - content/compass/notas/   → AtlasItem (COMPASS hemisphere)
 *   - content/compass/diario/  → JournalEntry
 *   - content/workspace/       → Page (vinculada a usuário pelo username na pasta)
 *
 * Uso:
 *   pnpm sync:up              — sync completo
 *   pnpm sync:up -- --dry-run — simula sem escrever no banco
 *   pnpm sync:up -- --force   — ignora comparação de datas
 */

import { promises as fs } from "fs"
import path               from "path"
import matter             from "gray-matter"
import { PrismaClient }   from "@prisma/client"
import { markdownToBlockNote } from "../lib/blocknote-md"

const prisma  = new PrismaClient()
const DRY_RUN = process.argv.includes("--dry-run")
const FORCE   = process.argv.includes("--force")
const ROOT    = process.cwd()
const CONTENT = path.join(ROOT, "content")

// ── Utilitários ───────────────────────────────────────────────────────────────

async function findMdFiles(dir: string): Promise<string[]> {
  let results: string[] = []
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results = results.concat(await findMdFiles(full))
      } else if (entry.name.endsWith(".md")) {
        results.push(full)
      }
    }
  } catch { /* dir não existe */ }
  return results
}

function relPath(abs: string): string {
  return path.relative(ROOT, abs)
}

function parseDate(val: unknown): Date | null {
  if (!val) return null
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? null : d
}

function isFileNewer(fileDate: Date | null, dbDate: Date | null): boolean {
  if (FORCE) return true
  if (!fileDate) return false
  if (!dbDate)   return true
  return fileDate > dbDate
}

// ── Processadores por tipo de arquivo ────────────────────────────────────────

/** Detecta o tipo de arquivo pelo caminho relativo ao /content. */
function detectContentType(absPath: string): "atlas" | "compass-nota" | "compass-diario" | "workspace" | "unknown" {
  const rel = path.relative(CONTENT, absPath)

  if (rel.startsWith("atlas/"))     return "atlas"
  if (rel.startsWith("compass/")) {
    if (rel.includes("/diario/"))   return "compass-diario"
    if (rel.includes("/notas/"))    return "compass-nota"
    // Compass sem subfolder claro → trata como atlas-item compass
    return "compass-nota"
  }
  if (rel.startsWith("workspace/")) return "workspace"
  return "unknown"
}

/** Extrai o username da pasta (2º segmento após content/{type}/) */
function extractUsername(absPath: string, type: "compass-nota" | "compass-diario" | "workspace"): string | null {
  const rel      = path.relative(CONTENT, absPath)
  const segments = rel.split(path.sep)
  // segments[0] = "compass" ou "workspace"
  // segments[1] = username (se existir)
  if (segments.length > 1 && segments[1] && !["diario", "notas", "atlas"].includes(segments[1])) {
    return segments[1]
  }
  return null
}

// ─── AtlasItem ────────────────────────────────────────────────────────────────

async function syncAtlasItem(absPath: string, hemisphere: "PORTAL" | "COMPASS"): Promise<"created" | "updated" | "skipped" | "error"> {
  try {
    const raw          = await fs.readFile(absPath, "utf-8")
    const { data, content } = matter(raw)

    if (!data.title || !data.type || !data.area) {
      console.warn(`  ⚠ Frontmatter incompleto (title/type/area): ${relPath(absPath)}`)
      return "skipped"
    }

    const fileUpdated  = parseDate(data.updatedAt ?? data.updated)
    const existingItem = data.id
      ? await prisma.atlasItem.findUnique({ where: { id: String(data.id) }, select: { id: true, updatedAt: true } })
      : await prisma.atlasItem.findFirst({ where: { slug: data.slug ? String(data.slug) : undefined }, select: { id: true, updatedAt: true } })

    if (existingItem && !isFileNewer(fileUpdated, existingItem.updatedAt)) {
      return "skipped"
    }

    const tagNames: string[] = Array.isArray(data.tags) ? data.tags.map(String) : []
    const metadata = data.metadata ? JSON.stringify(data.metadata) : null
    const contentPath = relPath(absPath)

    const fields = {
      title:       String(data.title),
      type:        String(data.type),
      area:        String(data.area),
      hemisphere:  hemisphere,
      status:      data.status      ? String(data.status)      : "ACTIVE",
      isFavorite:  Boolean(data.isFavorite),
      isPinned:    Boolean(data.isPinned),
      slug:        data.slug        ? String(data.slug)        : undefined,
      coverImage:  data.coverImage  ? String(data.coverImage)  : null,
      location:    data.location    ? String(data.location)    : null,
      metadata,
      contentPath,
      content:     content.trim() || null,
      ...(fileUpdated ? { updatedAt: fileUpdated } : {}),
    }

    if (DRY_RUN) {
      console.log(`  [dry-run] ${existingItem ? "update" : "create"} AtlasItem: ${data.title}`)
      return existingItem ? "updated" : "created"
    }

    await prisma.atlasItem.upsert({
      where:  { id: existingItem?.id ?? (data.id ? String(data.id) : `__new__${Date.now()}`) },
      create: {
        ...(data.id ? { id: String(data.id) } : {}),
        ...fields,
        tags: {
          connectOrCreate: tagNames.map((name) => ({ where: { name }, create: { name } })),
        },
      },
      update: {
        ...fields,
        tags: {
          set:            [],
          connectOrCreate: tagNames.map((name) => ({ where: { name }, create: { name } })),
        },
      },
    })

    return existingItem ? "updated" : "created"
  } catch (e) {
    console.error(`  ✗ Erro em ${relPath(absPath)}:`, (e as Error).message)
    return "error"
  }
}

// ─── JournalEntry ─────────────────────────────────────────────────────────────

async function syncJournalEntry(absPath: string): Promise<"created" | "updated" | "skipped" | "error"> {
  try {
    const raw          = await fs.readFile(absPath, "utf-8")
    const { data, content } = matter(raw)

    if (!data.date) {
      console.warn(`  ⚠ Frontmatter sem 'date': ${relPath(absPath)}`)
      return "skipped"
    }

    const date         = String(data.date)
    const fileUpdated  = parseDate(data.updatedAt ?? data.updated)
    const existingEntry = await prisma.journalEntry.findUnique({ where: { date }, select: { id: true, updatedAt: true } })

    if (existingEntry && !isFileNewer(fileUpdated, existingEntry.updatedAt)) {
      return "skipped"
    }

    if (DRY_RUN) {
      console.log(`  [dry-run] ${existingEntry ? "update" : "create"} JournalEntry: ${date}`)
      return existingEntry ? "updated" : "created"
    }

    await prisma.journalEntry.upsert({
      where:  { date },
      create: {
        date,
        content:   content.trim() || null,
        energy:    Number(data.energy    ?? 3),
        intention: data.intention ? String(data.intention) : null,
        mood:      data.mood      ? String(data.mood)      : null,
      },
      update: {
        content:   content.trim() || null,
        energy:    Number(data.energy    ?? 3),
        intention: data.intention ? String(data.intention) : null,
        mood:      data.mood      ? String(data.mood)      : null,
        ...(fileUpdated ? { updatedAt: fileUpdated } : {}),
      },
    })

    return existingEntry ? "updated" : "created"
  } catch (e) {
    console.error(`  ✗ Erro em ${relPath(absPath)}:`, (e as Error).message)
    return "error"
  }
}

// ─── Page (Workspace) ─────────────────────────────────────────────────────────

async function syncPage(absPath: string, username: string | null): Promise<"created" | "updated" | "skipped" | "error"> {
  try {
    const raw          = await fs.readFile(absPath, "utf-8")
    const { data, content } = matter(raw)

    if (!data.title) {
      console.warn(`  ⚠ Frontmatter sem 'title': ${relPath(absPath)}`)
      return "skipped"
    }

    const fileUpdated = parseDate(data.updatedAt ?? data.updated)
    const existingPage = data.id
      ? await prisma.page.findUnique({ where: { id: String(data.id) }, select: { id: true, updatedAt: true, userId: true } })
      : null

    if (existingPage && !isFileNewer(fileUpdated, existingPage.updatedAt)) {
      return "skipped"
    }

    // Precisamos de userId — buscamos pelo username da pasta
    let userId = existingPage?.userId ?? null
    if (!userId && username) {
      const user = await prisma.user.findUnique({ where: { username }, select: { id: true } })
      userId = user?.id ?? null
    }
    if (!userId) {
      console.warn(`  ⚠ Usuário não encontrado para workspace/${username}: ${relPath(absPath)}`)
      return "skipped"
    }

    // Conteúdo: se o .md veio de um editor BlockNote, a body é markdown e precisa converter de volta
    const contentForDb = content.trim() ? markdownToBlockNote(content.trim()) : null

    if (DRY_RUN) {
      console.log(`  [dry-run] ${existingPage ? "update" : "create"} Page: ${data.title}`)
      return existingPage ? "updated" : "created"
    }

    await prisma.page.upsert({
      where:  { id: existingPage?.id ?? (data.id ? String(data.id) : `__new__${Date.now()}`) },
      create: {
        ...(data.id ? { id: String(data.id) } : {}),
        userId,
        title:    String(data.title),
        icon:     data.icon     ? String(data.icon)     : "📄",
        slug:     data.slug     ? String(data.slug)     : undefined,
        isPublic: Boolean(data.isPublic),
        isBlog:   Boolean(data.isBlog),
        parentId: data.parentId ? String(data.parentId) : null,
        content:  contentForDb,
      },
      update: {
        title:    String(data.title),
        icon:     data.icon     ? String(data.icon)     : "📄",
        isPublic: Boolean(data.isPublic),
        isBlog:   Boolean(data.isBlog),
        parentId: data.parentId ? String(data.parentId) : null,
        content:  contentForDb,
        ...(fileUpdated ? { updatedAt: fileUpdated } : {}),
      },
    })

    return existingPage ? "updated" : "created"
  } catch (e) {
    console.error(`  ✗ Erro em ${relPath(absPath)}:`, (e as Error).message)
    return "error"
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log("🔍 Modo dry-run — nada será escrito no banco.\n")
  if (FORCE)   console.log("⚡ Modo force — ignora comparação de datas.\n")

  const allFiles = await findMdFiles(CONTENT)
  const mdFiles  = allFiles.filter((f) => !f.endsWith("index.json"))

  console.log(`📥 Encontrados ${mdFiles.length} arquivos .md em /content\n`)

  const stats = { created: 0, updated: 0, skipped: 0, error: 0 }

  for (const absPath of mdFiles) {
    const type = detectContentType(absPath)

    let result: "created" | "updated" | "skipped" | "error" = "skipped"

    if (type === "atlas") {
      console.log(`  ◎ atlas: ${relPath(absPath)}`)
      result = await syncAtlasItem(absPath, "PORTAL")
    } else if (type === "compass-nota") {
      const username = extractUsername(absPath, "compass-nota")
      console.log(`  ◌ compass/nota: ${relPath(absPath)}`)
      result = await syncAtlasItem(absPath, "COMPASS")
    } else if (type === "compass-diario") {
      console.log(`  ◌ diário: ${relPath(absPath)}`)
      result = await syncJournalEntry(absPath)
    } else if (type === "workspace") {
      const username = extractUsername(absPath, "workspace")
      console.log(`  ▸ workspace: ${relPath(absPath)}`)
      result = await syncPage(absPath, username)
    } else {
      console.log(`  ⊘ ignorado: ${relPath(absPath)}`)
      result = "skipped"
    }

    stats[result]++
    if (result === "created") console.log("    → criado")
    if (result === "updated") console.log("    → atualizado")
    if (result === "skipped") console.log("    → sem mudanças")
  }

  console.log(`\n✅ sync:up completo`)
  console.log(`   ✓ ${stats.created} criados · ↑ ${stats.updated} atualizados · = ${stats.skipped} sem mudanças · ✗ ${stats.error} erros`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
