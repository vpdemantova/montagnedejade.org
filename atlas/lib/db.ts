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

// ─── Slug ─────────────────────────────────────────────────────────────────────

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")     // remove chars especiais
    .trim()
    .replace(/\s+/g, "-")             // espaços → hifens
    .replace(/-+/g, "-")              // múltiplos hifens → um
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let n = 1
  while (true) {
    const existing = await prisma.atlasItem.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

// ─── Leitura — AtlasItem ──────────────────────────────────────────────────────

export async function findAll(
  options: AtlasFilterOptions = {}
): Promise<AtlasItemWithTags[]> {
  const { area, type, status, hemisphere, tags, search, limit = 100, offset = 0 } = options

  return prisma.atlasItem.findMany({
    where: {
      ...(area      && { area }),
      ...(type      && { type }),
      ...(status    && { status }),
      ...(hemisphere && { hemisphere }),
      ...(tags?.length && {
        tags: { some: { name: { in: tags } } },
      }),
      ...(search && {
        OR: [
          { title:   { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
    take:    limit,
    skip:    offset,
  })
}

export async function findById(id: string): Promise<AtlasItemWithTags | null> {
  return prisma.atlasItem.findUnique({
    where:   { id },
    include: { tags: true },
  })
}

// Busca por slug; se não encontrar, tenta como id (retrocompatibilidade)
export async function findBySlug(slug: string): Promise<AtlasItemWithTags | null> {
  const bySlug = await prisma.atlasItem.findUnique({
    where:   { slug },
    include: { tags: true },
  })
  if (bySlug) return bySlug
  // fallback: slug pode ser um id antigo
  return prisma.atlasItem.findUnique({
    where:   { id: slug },
    include: { tags: true },
  }).catch(() => null)
}

export async function findRecent(limit = 10): Promise<AtlasItemWithTags[]> {
  return prisma.atlasItem.findMany({
    include:  { tags: true },
    orderBy:  { updatedAt: "desc" },
    take:     limit,
  })
}

export async function findByHemisphere(
  hemisphere: "PORTAL" | "COMPASS",
  limit = 100
): Promise<AtlasItemWithTags[]> {
  return prisma.atlasItem.findMany({
    where:   { hemisphere },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
    take:    limit,
  })
}

export async function findFavorites(): Promise<AtlasItemWithTags[]> {
  return prisma.atlasItem.findMany({
    where:   { OR: [{ isFavorite: true }, { status: "FAVORITE" }] },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  })
}

export async function findPinned(): Promise<AtlasItemWithTags[]> {
  return prisma.atlasItem.findMany({
    where:   { isPinned: true },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  })
}

export async function countByArea(): Promise<Record<string, number>> {
  const counts = await prisma.atlasItem.groupBy({
    by:     ["area"],
    _count: { _all: true },
  })
  return Object.fromEntries(counts.map((c) => [c.area, c._count._all]))
}

// ─── Mutações — AtlasItem ─────────────────────────────────────────────────────

export async function create(data: {
  title:        string
  type:         string
  area:         string
  hemisphere?:  string
  status?:      string
  isFavorite?:  boolean
  isPinned?:    boolean
  content?:     string
  contentPath?: string
  metadata?:    string
  coverImage?:  string
  location?:    string
  viewType?:    string
  tagNames?:    string[]
}): Promise<AtlasItemWithTags> {
  const { tagNames = [], ...fields } = data

  const slug = await uniqueSlug(toSlug(data.title))

  return prisma.atlasItem.create({
    data: {
      ...fields,
      slug,
      tags: {
        connectOrCreate: tagNames.map((name) => ({
          where:  { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  })
}

export async function update(
  id: string,
  data: {
    title?:       string
    type?:        string
    area?:        string
    hemisphere?:  string
    status?:      string
    isFavorite?:  boolean
    isPinned?:    boolean
    content?:     string
    contentPath?: string
    metadata?:    string
    coverImage?:  string
    location?:    string
    viewType?:    string
    tagNames?:    string[]
  }
): Promise<AtlasItemWithTags> {
  const { tagNames, ...fields } = data

  const slug = fields.title ? await uniqueSlug(toSlug(fields.title), id) : undefined

  return prisma.atlasItem.update({
    where: { id },
    data: {
      ...fields,
      ...(slug !== undefined && { slug }),
      ...(tagNames !== undefined && {
        tags: {
          set: [],
          connectOrCreate: tagNames.map((name) => ({
            where:  { name },
            create: { name },
          })),
        },
      }),
    },
    include: { tags: true },
  })
}

export async function remove(id: string): Promise<void> {
  await prisma.atlasItem.delete({ where: { id } })
}

// ─── Relações ─────────────────────────────────────────────────────────────────

export async function createRelation(
  fromItemId: string,
  toItemId:   string,
  relationType: string
) {
  return prisma.atlasRelation.create({
    data: { fromItemId, toItemId, relationType },
  })
}

export async function findRelations(itemId: string) {
  return prisma.atlasRelation.findMany({
    where: {
      OR: [{ fromItemId: itemId }, { toItemId: itemId }],
    },
  })
}

// ─── WorldNotice ──────────────────────────────────────────────────────────────

export async function findAllNotices(limit = 50) {
  return prisma.worldNotice.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take:    limit,
  })
}

export async function findPinnedNotices() {
  return prisma.worldNotice.findMany({
    where:   { isPinned: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function createNotice(data: {
  title:     string
  body:      string
  type?:     string
  area?:     string
  author?:   string
  sourceUrl?: string
  isPinned?: boolean
  expiresAt?: Date
}) {
  return prisma.worldNotice.create({ data })
}
