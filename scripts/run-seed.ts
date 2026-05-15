/**
 * Script de seed direto — popula o banco com todos os dados enciclopédicos
 * Executar: npx tsx scripts/run-seed.ts
 */

import { PrismaClient } from "@prisma/client"
import { ALL_SEED_ITEMS } from "../atlas/scripts/seed-data"

const prisma = new PrismaClient()

function slugify(text: string, id?: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  return id ? `${base}-${id.slice(-6)}` : base
}

async function main() {
  console.log(`\n🌱 Iniciando seed — ${ALL_SEED_ITEMS.length} itens\n`)

  let inserted = 0
  let updated  = 0
  let errors   = 0

  const BATCH = 30

  for (let i = 0; i < ALL_SEED_ITEMS.length; i += BATCH) {
    const batch = ALL_SEED_ITEMS.slice(i, i + BATCH)

    await Promise.all(
      batch.map(async (item) => {
        try {
          // Verifica se já existe pelo título + área
          const existing = await prisma.atlasItem.findFirst({
            where: { title: item.title, area: item.area },
            select: { id: true },
          })

          if (existing) {
            await prisma.atlasItem.update({
              where: { id: existing.id },
              data: {
                type:       item.type,
                metadata:   item.metadata ? JSON.stringify(item.metadata) : null,
                isFavorite: item.isFavorite ?? false,
              },
            })
            updated++
          } else {
            const id   = crypto.randomUUID().replace(/-/g, "").slice(0, 24)
            const slug = slugify(item.title, id)

            await prisma.atlasItem.create({
              data: {
                id,
                title:      item.title,
                area:       item.area,
                type:       item.type,
                metadata:   item.metadata ? JSON.stringify(item.metadata) : null,
                isFavorite: item.isFavorite ?? false,
                slug,
              },
            })
            inserted++
          }
        } catch (e) {
          errors++
          // Slug duplicado — tenta com sufixo diferente
          try {
            const id2  = crypto.randomUUID().replace(/-/g, "").slice(0, 24)
            const slug = slugify(item.title, id2)
            await prisma.atlasItem.create({
              data: { id: id2, title: item.title, area: item.area, type: item.type,
                      metadata: item.metadata ? JSON.stringify(item.metadata) : null,
                      isFavorite: item.isFavorite ?? false, slug },
            })
            inserted++
            errors--
          } catch {
            // ignora duplicatas reais
          }
        }
      })
    )

    const pct = Math.round(((i + batch.length) / ALL_SEED_ITEMS.length) * 100)
    process.stdout.write(`\r  ${pct}% — inseridos: ${inserted} · atualizados: ${updated} · erros: ${errors}`)
  }

  const total = await prisma.atlasItem.count()
  console.log(`\n\n✅ Seed completo!`)
  console.log(`   Inseridos:  ${inserted}`)
  console.log(`   Atualizados: ${updated}`)
  console.log(`   Erros:       ${errors}`)
  console.log(`   Total no banco: ${total} itens\n`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error("\n❌ Erro:", e.message); prisma.$disconnect(); process.exit(1) })
