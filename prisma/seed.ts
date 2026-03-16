import { PrismaClient } from "@prisma/client"
import { serializeMetadata } from "../atlas/lib/metadata"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do Portal Solar...")

  // Limpa dados existentes
  await prisma.atlasRelation.deleteMany()
  await prisma.atlasItem.deleteMany()
  await prisma.tag.deleteMany()

  // ── 1. Academia: Mecânica Quântica ────────────────────────────────────────
  const quantica = await prisma.atlasItem.create({
    data: {
      title: "Mecânica Quântica",
      type: "CONCEPT",
      area: "ACADEMIA",
      status: "ACTIVE",
      metadata: serializeMetadata({
        period: { start: 1900, end: 1930 },
        language: "pt-BR",
      }),
      tags: {
        connectOrCreate: [
          { where: { name: "Física" }, create: { name: "Física", color: "#C8A45A" } },
          { where: { name: "Ciência" }, create: { name: "Ciência", color: "#4A7C6F" } },
        ],
      },
    },
  })

  // ── 2. Academia: Linguística Estrutural ───────────────────────────────────
  const linguistica = await prisma.atlasItem.create({
    data: {
      title: "Linguística Estrutural — Saussure",
      type: "CONCEPT",
      area: "ACADEMIA",
      status: "ACTIVE",
      metadata: serializeMetadata({
        period: { start: 1857, end: 1913 },
        location: "Genebra",
      }),
      tags: {
        connectOrCreate: [
          { where: { name: "Linguística" }, create: { name: "Linguística", color: "#4A6C7C" } },
          { where: { name: "Ciência" }, create: { name: "Ciência", color: "#4A7C6F" } },
        ],
      },
    },
  })

  // ── 3. Artes: Alexander Scriabin ──────────────────────────────────────────
  const scriabin = await prisma.atlasItem.create({
    data: {
      title: "Alexander Scriabin",
      type: "PERSON",
      area: "ARTES",
      status: "FAVORITE",
      metadata: serializeMetadata({
        period: { start: 1872, end: 1915 },
        location: "Moscou",
      }),
      tags: {
        connectOrCreate: [
          { where: { name: "Música" }, create: { name: "Música", color: "#7C4A7C" } },
          { where: { name: "Piano" }, create: { name: "Piano", color: "#C8A45A" } },
          { where: { name: "Romantismo" }, create: { name: "Romantismo", color: "#8A8678" } },
        ],
      },
    },
  })

  // ── 4. Artes: Sonata Op. 19 ───────────────────────────────────────────────
  const sonata = await prisma.atlasItem.create({
    data: {
      title: "Sonata para Piano nº 2, Op. 19 — Scriabin",
      type: "WORK",
      area: "ARTES",
      status: "ACTIVE",
      viewType: "GALLERY",
      metadata: serializeMetadata({
        period: { start: 1897, end: 1897 },
        rating: 5,
      }),
      tags: {
        connectOrCreate: [
          { where: { name: "Música" }, create: { name: "Música", color: "#7C4A7C" } },
          { where: { name: "Piano" }, create: { name: "Piano", color: "#C8A45A" } },
          { where: { name: "Sonata" }, create: { name: "Sonata", color: "#4A7C6F" } },
        ],
      },
    },
  })

  // ── 5. Studio: Projeto Portal Solar ──────────────────────────────────────
  await prisma.atlasItem.create({
    data: {
      title: "Portal Solar — Documentação do Projeto",
      type: "PAGE",
      area: "STUDIO",
      status: "ACTIVE",
      viewType: "LIST",
      metadata: serializeMetadata({
        language: "pt-BR",
        url: "https://github.com/diamantov/portal-solar",
      }),
      tags: {
        connectOrCreate: [
          { where: { name: "Projeto" }, create: { name: "Projeto", color: "#C8A45A" } },
          { where: { name: "Design" }, create: { name: "Design", color: "#4A6C7C" } },
          { where: { name: "PUCC" }, create: { name: "PUCC", color: "#4A7C6F" } },
        ],
      },
    },
  })

  // ── Relações ──────────────────────────────────────────────────────────────
  // Scriabin é autor da Sonata Op. 19
  await prisma.atlasRelation.create({
    data: {
      fromItemId: scriabin.id,
      toItemId: sonata.id,
      relationType: "autor-de",
    },
  })

  // Mecânica Quântica influenciou a Linguística Estrutural (no período)
  await prisma.atlasRelation.create({
    data: {
      fromItemId: quantica.id,
      toItemId: linguistica.id,
      relationType: "contemporâneo-de",
    },
  })

  console.log("✅ Seed concluído — 5 itens criados, 2 relações estabelecidas")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
