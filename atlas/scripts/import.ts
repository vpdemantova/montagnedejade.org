/**
 * import.ts
 * Importa arquivos .md do /content para o banco SQLite.
 * Cria itens novos ou atualiza existentes (idempotente pelo campo `id`).
 *
 * Uso: pnpm run import
 *      pnpm run import -- --dry-run   (apenas lista, não grava)
 */

import { promises as fs } from "fs"
import path               from "path"
import matter             from "gray-matter"
import { PrismaClient }   from "@prisma/client"

const prisma = new PrismaClient()
const DRY    = process.argv.includes("--dry-run")

async function findMdFiles(dir: string): Promise<string[]> {
  let results: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(await findMdFiles(full))
    } else if (entry.name.endsWith(".md")) {
      results.push(full)
    }
  }
  return results
}

async function main() {
  const contentDir = path.join(process.cwd(), "content")
  console.log(DRY ? "🔍 Dry-run — nada será gravado\n" : "📥 Importando /content → banco…\n")

  const files = (await findMdFiles(contentDir)).filter((f) => !f.endsWith("index.json"))
  console.log(`   Encontrados: ${files.length} arquivos .md`)

  let created  = 0
  let updated  = 0
  let skipped  = 0
  let errors   = 0

  for (const file of files) {
    try {
      const raw     = await fs.readFile(file, "utf-8")
      const { data } = matter(raw)

      if (!data.title || !data.type || !data.area) {
        console.warn(`  ⚠ Frontmatter incompleto: ${path.relative(process.cwd(), file)}`)
        skipped++
        continue
      }

      const tagNames: string[] = Array.isArray(data.tags) ? (data.tags as string[]) : []
      const id = data.id as string | undefined

      if (DRY) {
        console.log(`  ${id ? "→" : "+"} ${data.title} [${data.area}/${data.type}]`)
        continue
      }

      const existing = id
        ? await prisma.atlasItem.findUnique({ where: { id } })
        : null

      if (existing) {
        await prisma.atlasItem.update({
          where: { id: existing.id },
          data: {
            title:      String(data.title),
            type:       String(data.type),
            area:       String(data.area),
            hemisphere: data.hemisphere ? String(data.hemisphere) : existing.hemisphere,
            status:     data.status     ? String(data.status)     : existing.status,
            isFavorite: data.isFavorite !== undefined ? Boolean(data.isFavorite) : existing.isFavorite,
            tags: {
              set: [],
              connectOrCreate: tagNames.map((name) => ({
                where:  { name },
                create: { name },
              })),
            },
          },
        })
        updated++
      } else {
        await prisma.atlasItem.create({
          data: {
            ...(id ? { id } : {}),
            title:      String(data.title),
            type:       String(data.type),
            area:       String(data.area),
            hemisphere: data.hemisphere ? String(data.hemisphere) : "PORTAL",
            status:     data.status     ? String(data.status)     : "ACTIVE",
            isFavorite: Boolean(data.isFavorite),
            contentPath: path.relative(process.cwd(), file),
            tags: {
              connectOrCreate: tagNames.map((name) => ({
                where:  { name },
                create: { name },
              })),
            },
          },
        })
        created++
      }
    } catch (e) {
      console.warn(`  ✗ Erro em ${path.relative(process.cwd(), file)}:`, e)
      errors++
    }
  }

  if (!DRY) {
    console.log(`\n✅ Importação concluída:`)
    console.log(`   Criados:  ${created}`)
    console.log(`   Atualizados: ${updated}`)
    console.log(`   Ignorados: ${skipped}`)
    console.log(`   Erros:    ${errors}`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
