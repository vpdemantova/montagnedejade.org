import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// GET /api/cultura/profiles/[slug]
// Retorna um perfil cultural (tipo PERSON) com relações e avisos relacionados
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const person = await prisma.atlasItem.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      type: "PERSON",
    },
    include: { tags: true },
  })

  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [relations, notices] = await Promise.all([
    // Obras e relações
    prisma.atlasRelation.findMany({
      where: { OR: [{ fromItemId: person.id }, { toItemId: person.id }] },
      include: {
        fromItem: { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
        toItem:   { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    // WorldNotices mencionando a pessoa
    prisma.worldNotice.findMany({
      where: {
        OR: [
          { title:  { contains: person.title } },
          { body:   { contains: person.title } },
          { author: { contains: person.title } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ])

  return NextResponse.json({ person, relations, notices })
}
