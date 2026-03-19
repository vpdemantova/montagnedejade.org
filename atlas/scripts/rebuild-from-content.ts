/**
 * rebuild-from-content.ts
 * Reconstrói o banco SQLite inteiro a partir dos arquivos .md em /content.
 * CUIDADO: remove todos os dados do banco antes de reimportar.
 *
 * Uso: pnpm run db:rebuild
 *      pnpm run db:rebuild -- --confirm   (obrigatório para evitar acidente)
 */

import { promises as fs } from "fs"
import path               from "path"
import matter             from "gray-matter"
import { PrismaClient }   from "@prisma/client"

const prisma  = new PrismaClient()
const CONFIRM = process.argv.includes("--confirm")

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

async function main() {
  if (!CONFIRM) {
    console.log("⚠️  db:rebuild apaga todo o banco e reimporta do /content.")
    console.log("   Execute com --confirm para continuar:")
    console.log("   pnpm run db:rebuild -- --confirm\n")
    process.exit(0)
  }

  console.log("🗑  Limpando banco de dados…")
  await prisma.atlasRelation.deleteMany()
  await prisma.atlasItem.deleteMany()
  // Tags são compartilhadas — limpa órfãs via cascade implícito
  // WorldNotice mantido (notícias não vêm de /content)

  const contentDir = path.join(process.cwd(), "content")
  const files = (await findMdFiles(contentDir)).filter((f) => !f.endsWith("index.json"))
  console.log(`📥 Reimportando ${files.length} arquivos .md…`)

  let created = 0
  let errors  = 0

  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf-8")
      const { data, content } = matter(raw)

      if (!data.title || !data.type || !data.area) continue

      const tagNames: string[] = Array.isArray(data.tags) ? (data.tags as string[]) : []
      const id = data.id as string | undefined

      await prisma.atlasItem.create({
        data: {
          ...(id ? { id } : {}),
          title:       String(data.title),
          type:        String(data.type),
          area:        String(data.area),
          hemisphere:  data.hemisphere  ? String(data.hemisphere)  : "PORTAL",
          status:      data.status      ? String(data.status)      : "ACTIVE",
          isFavorite:  Boolean(data.isFavorite),
          contentPath: path.relative(process.cwd(), file),
          // Guarda o corpo markdown como content bruto (sem conversão para BlockNote)
          content:     content.trim() || null,
          tags: {
            connectOrCreate: tagNames.map((name) => ({
              where:  { name },
              create: { name },
            })),
          },
        },
      })
      created++
    } catch (e) {
      console.warn(`  ✗ Erro em ${path.relative(process.cwd(), file)}:`, e)
      errors++
    }
  }

  // Reconstrói index.json
  const index = {
    version:     "1.0.0",
    lastIndexed: new Date().toISOString(),
    totalItems:  created,
    rebuiltFrom: "content/",
  }
  await fs.writeFile(
    path.join(contentDir, "index.json"),
    JSON.stringify(index, null, 2),
    "utf-8"
  ).catch(() => null)

  console.log(`\n✅ Banco reconstruído: ${created} itens importados, ${errors} erros`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
