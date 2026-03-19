/**
 * export-all.ts
 * Exporta todos os itens do banco para /content como arquivos .md.
 * Cria a estrutura de diretórios conforme hemisphere/area.
 *
 * Uso: pnpm run export-all
 */

import { promises as fs } from "fs"
import path               from "path"
import matter             from "gray-matter"
import { PrismaClient }   from "@prisma/client"

const prisma = new PrismaClient()

function buildMd(item: {
  id: string; title: string; type: string; area: string; hemisphere: string
  status: string; isFavorite: boolean; tags: { name: string }[]
  createdAt: Date; updatedAt: Date
}): string {
  const frontmatter = {
    id:         item.id,
    title:      item.title,
    type:       item.type,
    area:       item.area,
    hemisphere: item.hemisphere,
    status:     item.status,
    isFavorite: item.isFavorite,
    tags:       item.tags.map((t) => t.name),
    created:    item.createdAt.toISOString(),
    updated:    item.updatedAt.toISOString(),
  }
  return matter.stringify("", frontmatter)
}

function resolveDir(item: { area: string; hemisphere: string }): string {
  const section = item.hemisphere === "COMPASS"
    ? `compass/${item.area.toLowerCase()}`
    : "atlas"
  return path.join(process.cwd(), "content", section)
}

async function main() {
  console.log("📦 Exportando todos os itens para /content…")

  const items = await prisma.atlasItem.findMany({
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  })

  console.log(`   Total: ${items.length} itens`)

  let written = 0
  let errors  = 0

  for (const item of items) {
    try {
      const dir     = resolveDir(item)
      const filePath = path.join(dir, `${item.id}.md`)
      const md      = buildMd(item)
      await fs.mkdir(dir, { recursive: true })
      await fs.writeFile(filePath, md, "utf-8")
      written++
    } catch (e) {
      console.warn(`  ⚠ Erro ao escrever ${item.id}:`, e)
      errors++
    }
  }

  // Atualiza index.json
  const index = {
    version:     "1.0.0",
    lastIndexed: new Date().toISOString(),
    totalItems:  written,
    areas:       Array.from(new Set(items.map((i) => i.area.toLowerCase()))),
  }
  await fs.writeFile(
    path.join(process.cwd(), "content", "index.json"),
    JSON.stringify(index, null, 2),
    "utf-8"
  )

  console.log(`✅ Exportação concluída: ${written} escritos, ${errors} erros`)
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
