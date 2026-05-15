import { cookies }           from "next/headers"
import { redirect }          from "next/navigation"
import { prisma }            from "@/atlas/lib/db"
import { verifyToken }       from "@/atlas/lib/jwt"
import { WorkspaceSidebar }  from "@/atlas/components/workspace/WorkspaceSidebar"

export const dynamic = "force-dynamic"
export const metadata = { title: "Workspace — Portal Solar" }

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jar   = await cookies()
  const token = jar.get("ps_session")?.value
  const me    = token ? await verifyToken(token) : null

  if (!me || me.guest) redirect("/login")

  const pages = await prisma.page.findMany({
    where:   { userId: me.userId },
    select:  { id: true, title: true, icon: true, parentId: true, sortOrder: true, isPublic: true, isBlog: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="flex h-[calc(100vh-76px)]" style={{ overflow: "hidden" }}>
      {/* Sidebar */}
      <div className="flex-shrink-0 w-56 overflow-hidden">
        <WorkspaceSidebar pages={pages} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
