import { PrismaClient } from "@prisma/client"
import type { AtlasItemWithTags, AtlasFilterOptions } from "@/atlas/types"

// Singleton do Prisma para evitar múltiplas instâncias no hot-reload do Next.js
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// ─── Queries de leitura ───────────────────────────────────────────────────────

/**
 * Retorna todos os itens do Atlas com filtros opcionais.
 */
export async function findAll(
  options: AtlasFilterOptions = {}
): Promise<AtlasItemWithTags[]> {
  const { area, type, status, tags, search, limit = 100, offset = 0 } = options

  return prisma.atlasItem.findMany({
    where: {
      ...(area && { area }),
      ...(type && { type }),
      ...(status && { status }),
      ...(tags?.length && {
        tags: { some: { name: { in: tags } } },
      }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      }),
    },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip: offset,
  })
}

/**
 * Retorna um item por ID com tags. Retorna null se não encontrado.
 */
export async function findById(id: string): Promise<AtlasItemWithTags | null> {
  return prisma.atlasItem.findUnique({
    where: { id },
    include: { tags: true },
  })
}

/**
 * Retorna os N itens modificados mais recentemente.
 */
export async function findRecent(limit = 10): Promise<AtlasItemWithTags[]> {
  return prisma.atlasItem.findMany({
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
  })
}

/**
 * Conta itens por área para as estatísticas do dashboard.
 */
export async function countByArea(): Promise<Record<string, number>> {
  const counts = await prisma.atlasItem.groupBy({
    by: ["area"],
    _count: { _all: true },
  })
  return Object.fromEntries(counts.map((c) => [c.area, c._count._all]))
}

// ─── Mutações ─────────────────────────────────────────────────────────────────

/**
 * Cria um novo item no Atlas.
 * Tags são conectadas pelo nome — criadas automaticamente se não existirem.
 */
export async function create(data: {
  title: string
  type: string
  area: string
  status?: string
  content?: string
  metadata?: string
  viewType?: string
  tagNames?: string[]
}): Promise<AtlasItemWithTags> {
  const { tagNames = [], ...fields } = data

  return prisma.atlasItem.create({
    data: {
      ...fields,
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  })
}

/**
 * Atualiza um item existente. Substituição total de tags se `tagNames` for fornecido.
 */
export async function update(
  id: string,
  data: {
    title?: string
    type?: string
    area?: string
    status?: string
    content?: string
    metadata?: string
    viewType?: string
    tagNames?: string[]
  }
): Promise<AtlasItemWithTags> {
  const { tagNames, ...fields } = data

  return prisma.atlasItem.update({
    where: { id },
    data: {
      ...fields,
      ...(tagNames !== undefined && {
        tags: {
          set: [],
          connectOrCreate: tagNames.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    },
    include: { tags: true },
  })
}

/**
 * Remove um item e suas relações (cascade no banco).
 */
export async function remove(id: string): Promise<void> {
  await prisma.atlasItem.delete({ where: { id } })
}

// ─── Relações ─────────────────────────────────────────────────────────────────

/**
 * Cria uma relação dirigida entre dois itens.
 */
export async function createRelation(
  fromItemId: string,
  toItemId: string,
  relationType: string
) {
  return prisma.atlasRelation.create({
    data: { fromItemId, toItemId, relationType },
  })
}

/**
 * Retorna todas as relações de um item (de e para).
 */
export async function findRelations(itemId: string) {
  return prisma.atlasRelation.findMany({
    where: {
      OR: [{ fromItemId: itemId }, { toItemId: itemId }],
    },
  })
}
