import { cookies }    from "next/headers"
import { notFound, redirect } from "next/navigation"
import { prisma }    from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { PageEditor } from "@/atlas/components/workspace/PageEditor"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const page = await prisma.page.findUnique({ where: { id }, select: { title: true, icon: true } })
  return { title: `${page?.icon ?? "📄"} ${page?.title ?? "Página"} — Workspace` }
}

export default async function WorkspacePageDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const jar    = await cookies()
  const token  = jar.get("ps_session")?.value
  const me     = token ? await verifyToken(token) : null
  if (!me || me.guest) redirect("/login")

  const page = await prisma.page.findUnique({
    where:  { id },
    select: {
      id: true, title: true, icon: true, content: true,
      isPublic: true, isBlog: true, parentId: true, userId: true,
      parent:   { select: { id: true, title: true, icon: true } },
      children: {
        select:  { id: true, title: true, icon: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  })

  if (!page) notFound()
  if (page.userId !== me.userId) redirect("/workspace")

  return <PageEditor page={page} />
}
