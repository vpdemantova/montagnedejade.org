/**
 * sync-down.ts — exporta conteúdo do banco para arquivos .md.
 *
 * Exporta:
 *   - AtlasItem (PORTAL)   → content/atlas/{area}/{slug-ou-id}.md
 *   - AtlasItem (COMPASS)  → content/compass/{username}/notas/{slug-ou-id}.md
 *   - JournalEntry         → content/compass/diario/{date}.md (ou por username no futuro)
 *   - Page                 → content/workspace/{username}/{slug-ou-id}.md
 *
 * Só sobrescreve se o registro do banco for mais recente que o arquivo existente.
 *
 * Uso:
 *   pnpm sync:down              — exportação completa
 *   pnpm sync:down -- --force   — sobrescreve tudo independente de data
 *   pnpm sync:down -- --dry-run — simula sem escrever em disco
 */

import { promises as fs } from "fs"
import path               from "path"
import { PrismaClient }   from "@prisma/client"
import matter             from "gray-matter"
import {
  buildMirrorContent,
  buildJournalMirrorContent,
  buildPageMirrorContent,
  resolveMirrorPath,
  resolveJournalMirrorPath,
  resolvePageMirrorPath,
} from "../lib/mirror"
import { blockNoteToMarkdown } from "../lib/blocknote-md"

const prisma  = new PrismaClient()
const DRY_RUN = process.argv.includes("--dry-run")
const FORCE   = process.argv.includes("--force")
const ROOT    = process.cwd()

if (DRY_RUN) console.log("🔍 Modo dry-run — nada será escrito em disco.\n")
if (FORCE)   console.log("⚡ Modo force — sobrescreve todos os arquivos.\n")

// ── Utilitários ───────────────────────────────────────────────────────────────

async function readFileMtime(filePath: string): Promise<Date | null> {
  try {
    const stat = await fs.stat(filePath)
    return stat.mtime
  } catch {
    return null
  }
}

async function readFrontmatterUpdatedAt(filePath: string): Promise<Date | null> {
  try {
    const raw  = await fs.readFile(filePath, "utf-8")
    const { data } = matter(raw)
    const val = data.updatedAt ?? data.updated
    if (!val) return null
    const d = new Date(String(val))
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

async function shouldWrite(filePath: string, dbUpdatedAt: Date): Promise<boolean> {
  if (FORCE) return true
  const fileDate = await readFrontmatterUpdatedAt(filePath)
  if (!fileDate) return true      // arquivo não existe ou sem frontmatter
  return dbUpdatedAt > fileDate
}

async function write(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, "utf-8")
}

// ── Exportadores ──────────────────────────────────────────────────────────────

async function exportAtlasItems(): Promise<{ written: number; skipped: number }> {
  const items = await prisma.atlasItem.findMany({
    include: { tags: true },
  })

  let written = 0, skipped = 0

  for (const item of items) {
    const filePath  = resolveMirrorPath(item)
    const body      = blockNoteToMarkdown(item.content)
    const fileContent = buildMirrorContent(item as Parameters<typeof buildMirrorContent>[0], body)

    if (!DRY_RUN && await shouldWrite(filePath, item.updatedAt)) {
      await write(filePath, fileContent)
      written++
      console.log(`  ✓ atlas: ${path.relative(ROOT, filePath)}`)
    } else {
      skipped++
    }
  }

  return { written, skipped }
}

async function exportJournalEntries(): Promise<{ written: number; skipped: number }> {
  const entries = await prisma.journalEntry.findMany()

  let written = 0, skipped = 0

  for (const entry of entries) {
    const filePath    = resolveJournalMirrorPath(entry.date)
    const body        = blockNoteToMarkdown(entry.content)
    const fileContent = buildJournalMirrorContent(entry, body)

    if (!DRY_RUN && await shouldWrite(filePath, entry.updatedAt)) {
      await write(filePath, fileContent)
      written++
      console.log(`  ✓ diário: ${path.relative(ROOT, filePath)}`)
    } else {
      skipped++
    }
  }

  return { written, skipped }
}

async function exportPages(): Promise<{ written: number; skipped: number }> {
  const pages = await prisma.page.findMany({
    include: { user: { select: { username: true } } },
  })

  let written = 0, skipped = 0

  for (const page of pages) {
    const username  = page.user.username
    const filePath  = resolvePageMirrorPath(page.slug, page.id, username)
    const body      = blockNoteToMarkdown(page.content)
    const fileContent = buildPageMirrorContent(page, body)

    if (!DRY_RUN && await shouldWrite(filePath, page.updatedAt)) {
      await write(filePath, fileContent)
      written++
      console.log(`  ✓ workspace: ${path.relative(ROOT, filePath)}`)
    } else {
      skipped++
    }
  }

  return { written, skipped }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("📤 sync:down — exportando banco → arquivos\n")

  console.log("◎ Atlas items…")
  const atlas     = await exportAtlasItems()

  console.log("\n◌ Diário…")
  const journal   = await exportJournalEntries()

  console.log("\n▸ Workspace / Blog…")
  const workspace = await exportPages()

  const total = {
    written: atlas.written + journal.written + workspace.written,
    skipped: atlas.skipped + journal.skipped + workspace.skipped,
  }

  console.log(`\n✅ sync:down completo`)
  console.log(`   ✓ ${total.written} arquivos escritos · = ${total.skipped} sem mudanças`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
