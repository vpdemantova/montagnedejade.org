import { NextResponse }       from "next/server"
import { prisma }             from "@/atlas/lib/db"
import { verifyToken }        from "@/atlas/lib/jwt"
import { cookies }            from "next/headers"
import { writePageMirror }    from "@/atlas/lib/mirror"

type Params = { params: Promise<{ id: string }> }

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — detalhe de uma página (inclui conteúdo)
// Páginas públicas retornam sem login; privadas exigem o dono
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()

  const page = await prisma.page.findUnique({
    where:  { id },
    select: {
      id: true, title: true, icon: true, content: true,
      parentId: true, isPublic: true, isBlog: true,
      slug: true, sortOrder: true, createdAt: true, updatedAt: true,
      userId: true,
      parent:   { select: { id: true, title: true, icon: true } },
      children: { select: { id: true, title: true, icon: true, sortOrder: true }, orderBy: { sortOrder: "asc" } },
    },
  })

  if (!page) return NextResponse.json({ error: "Página não encontrada" }, { status: 404 })

  // Privada e não é o dono → 403
  if (!page.isPublic && me?.userId !== page.userId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  return NextResponse.json(page)
}

// PATCH — atualiza título, conteúdo, ícone, isPublic, isBlog, parentId
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const page = await prisma.page.findUnique({ where: { id }, select: { userId: true } })
  if (!page) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  if (page.userId !== me.userId) return NextResponse.json({ error: "Proibido" }, { status: 403 })

  const body = await req.json() as Partial<{
    title: string; content: string; icon: string
    isPublic: boolean; isBlog: boolean; parentId: string | null; sortOrder: number
  }>

  const updated = await prisma.page.update({
    where:  { id },
    include: { user: { select: { username: true } } },
    data: {
      ...(body.title     !== undefined ? { title:     body.title?.trim() || "Sem título" } : {}),
      ...(body.content   !== undefined ? { content:   body.content }   : {}),
      ...(body.icon      !== undefined ? { icon:      body.icon }      : {}),
      ...(body.isPublic  !== undefined ? { isPublic:  body.isPublic }  : {}),
      ...(body.isBlog    !== undefined ? { isBlog:    body.isBlog }    : {}),
      ...(body.parentId  !== undefined ? { parentId:  body.parentId }  : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
  })

  // Escreve/atualiza o arquivo .md espelho
  void writePageMirror(updated, updated.user.username).catch(console.error)

  return NextResponse.json(updated)
}

// DELETE — remove página e filhos em cascata (via Prisma)
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const page = await prisma.page.findUnique({ where: { id }, select: { userId: true } })
  if (!page) return NextResponse.json({ error: "Não encontrada" }, { status: 404 })
  if (page.userId !== me.userId) return NextResponse.json({ error: "Proibido" }, { status: 403 })

  // Deleta filhos recursivamente primeiro
  async function deleteWithChildren(pageId: string) {
    const children = await prisma.page.findMany({ where: { parentId: pageId }, select: { id: true } })
    for (const child of children) await deleteWithChildren(child.id)
    await prisma.page.delete({ where: { id: pageId } })
  }

  await deleteWithChildren(id)

  return NextResponse.json({ ok: true })
}
