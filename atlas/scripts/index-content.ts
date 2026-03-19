/**
 * index-content.ts
 * Varre /content recursivamente, lê frontmatter de cada .md,
 * gera/atualiza content/index.json e detecta divergências com o banco.
 *
 * Uso: pnpm run index
 */

import { promises as fs }  from "fs"
import path                 from "path"
import matter               from "gray-matter"
import { PrismaClient }     from "@prisma/client"

const prisma = new PrismaClient()

async function findMdFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...await findMdFiles(full))
    } else if (entry.name.endsWith(".md")) {
      results.push(full)
    }
  }
  return results
}

async function main() {
  const contentDir  = path.join(process.cwd(), "content")
  const indexPath   = path.join(contentDir, "index.json")

  console.log("🔍 Varrendo", contentDir)
  const files = await findMdFiles(contentDir)
  const mdFiles = files.filter((f) => !f.endsWith("index.json"))
  console.log(`   Encontrados: ${mdFiles.length} arquivos .md`)

  // Lê frontmatter de cada .md
  type MdEntry = {
    id?:        string
    title?:     string
    type?:      string
    area?:      string
    hemisphere?: string
    status?:    string
    tags?:      string[]
    file:       string
    relPath:    string
  }

  const mdEntries: MdEntry[] = []
  for (const file of mdFiles) {
    try {
      const raw     = await fs.readFile(file, "utf-8")
      const { data } = matter(raw)
      mdEntries.push({
        ...data as Omit<MdEntry, "file" | "relPath">,
        file,
        relPath: path.relative(process.cwd(), file),
      })
    } catch {
      console.warn("  ⚠ Erro ao ler:", file)
    }
  }

  // Busca todos os IDs no banco
  const dbItems = await prisma.atlasItem.findMany({
    select: { id: true, title: true, area: true, contentPath: true, updatedAt: true },
  })
  const dbIds = new Set(dbItems.map((i) => i.id))

  // .md sem registro no banco
  const orphanMd = mdEntries.filter((e) => e.id && !dbIds.has(e.id))
  if (orphanMd.length > 0) {
    console.log(`\n⚠  ${orphanMd.length} arquivo(s) .md sem registro no banco:`)
    orphanMd.forEach((e) => console.log(`   • ${e.relPath} (id: ${e.id ?? "sem id"})`))
    console.log("   → Execute: pnpm run import para importar")
  }

  // Registros no banco sem .md
  const mdIds = new Set(mdEntries.map((e) => e.id).filter(Boolean) as string[])
  const orphanDb = dbItems.filter((i) => !mdIds.has(i.id))
  if (orphanDb.length > 0) {
    console.log(`\n⚠  ${orphanDb.length} registro(s) no banco sem arquivo .md:`)
    orphanDb.forEach((i) => console.log(`   • ${i.id}: "${i.title}"`))
    console.log("   → Execute: pnpm run db:rebuild para regenerar")
  }

  // Gera index.json
  const index = {
    version:     "1.0.0",
    lastIndexed: new Date().toISOString(),
    totalItems:  mdEntries.length,
    areas:       Array.from(new Set(mdEntries.map((e) => e.area?.toLowerCase()).filter(Boolean))),
    items: mdEntries.map((e) => ({
      id:         e.id,
      title:      e.title,
      type:       e.type,
      area:       e.area,
      hemisphere: e.hemisphere,
      status:     e.status,
      tags:       e.tags ?? [],
      file:       e.relPath,
    })),
  }

  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf-8")
  console.log(`\n✅ index.json gerado: ${mdEntries.length} itens indexados`)

  if (orphanMd.length === 0 && orphanDb.length === 0) {
    console.log("✅ Banco e /content estão sincronizados")
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
