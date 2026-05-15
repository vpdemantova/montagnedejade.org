import { NextResponse }     from "next/server"
import { prisma }           from "@/atlas/lib/db"
import { verifyToken }      from "@/atlas/lib/jwt"
import { cookies }          from "next/headers"
import { writePageMirror }  from "@/atlas/lib/mirror"

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// GET — lista páginas do usuário em estrutura de árvore
export async function GET() {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const pages = await prisma.page.findMany({
    where:   { userId: me.userId },
    select:  {
      id: true, title: true, icon: true, parentId: true,
      isPublic: true, isBlog: true, sortOrder: true,
      createdAt: true, updatedAt: true, slug: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json(pages)
}

// POST — cria nova página
export async function POST(req: Request) {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { title, parentId, icon } = await req.json() as {
    title?:    string
    parentId?: string
    icon?:     string
  }

  // Slug único baseado no título + timestamp
  const base = (title ?? "sem-titulo")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60)
  const slug = `${base}-${Date.now().toString(36)}`

  const page = await prisma.page.create({
    include: { user: { select: { username: true } } },
    data: {
      userId:   me.userId,
      title:    title?.trim() || "Sem título",
      icon:     icon ?? "📄",
      parentId: parentId ?? null,
      slug,
    },
  })

  void writePageMirror(page, page.user.username).catch(console.error)

  return NextResponse.json(page, { status: 201 })
}
