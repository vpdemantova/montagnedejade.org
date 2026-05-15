import { cookies }  from "next/headers"
import { redirect } from "next/navigation"
import { prisma }   from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import Link         from "next/link"

export const dynamic = "force-dynamic"

export default async function WorkspacePage() {
  const jar   = await cookies()
  const token = jar.get("ps_session")?.value
  const me    = token ? await verifyToken(token) : null
  if (!me || me.guest) redirect("/login")

  const recentes = await prisma.page.findMany({
    where:   { userId: me.userId },
    orderBy: { updatedAt: "desc" },
    take:    6,
    select:  { id: true, title: true, icon: true, updatedAt: true, isPublic: true, isBlog: true },
  })

  const total = await prisma.page.count({ where: { userId: me.userId } })

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-[7.5px] uppercase tracking-[0.3em] text-solar-muted/40 mb-2">
            Workspace
          </p>
          <h1 className="font-display text-3xl font-bold leading-none text-solar-text/90 mb-1">
            Suas páginas
          </h1>
          <p className="font-mono text-[9px] text-solar-muted/45">
            {total} {total === 1 ? "página" : "páginas"} · edite, organize e publique
          </p>
        </div>

        {/* Criar primeira página */}
        {total === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-solar-text/25 mb-3">Nenhuma página ainda</p>
            <p className="font-mono text-[9px] text-solar-muted/30 mb-6 leading-relaxed">
              O Workspace é o seu caderno de ideias,<br/>
              ensaios e textos — conectado ao Atlas.
            </p>
            <form action={async () => {
              "use server"
              // A criação é feita pela sidebar — o usuário clica "+ Nova"
            }}>
              <Link
                href="#"
                onClick={() => {
                  void fetch("/api/workspace/pages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: "Minha primeira página" }),
                  }).then((r) => r.json()).then((p: { id: string }) => {
                    window.location.href = `/workspace/${p.id}`
                  })
                }}
                className="btn btn-primary btn-md"
              >
                Criar primeira página →
              </Link>
            </form>
          </div>
        ) : (
          <>
            {/* Recentes */}
            <div className="mb-8">
              <p className="section-label mb-4">Editadas recentemente</p>
              <div className="grid gap-2">
                {recentes.map((p) => (
                  <Link
                    key={p.id}
                    href={`/workspace/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 border border-solar-border/20 hover:border-solar-border/40 hover:bg-solar-surface/20 transition-all"
                  >
                    <span className="text-xl flex-shrink-0">{p.icon ?? "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-solar-text/80 truncate">
                        {p.title || "Sem título"}
                      </p>
                      <p className="font-mono text-[7.5px] text-solar-muted/35">
                        {new Date(p.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {p.isBlog && (
                        <span className="font-mono text-[6.5px] uppercase tracking-widest px-1.5 py-0.5"
                          style={{ background: "rgb(var(--c-accent)/0.1)", color: "rgb(var(--c-accent))" }}>
                          blog
                        </span>
                      )}
                      {p.isPublic && !p.isBlog && (
                        <span className="font-mono text-[6.5px] uppercase tracking-widest px-1.5 py-0.5"
                          style={{ background: "rgb(var(--c-teal)/0.1)", color: "rgb(var(--c-teal))" }}>
                          público
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-solar-border/15 pt-6">
              <p className="font-mono text-[8px] text-solar-muted/35 leading-relaxed">
                Use a sidebar esquerda para navegar pelas páginas e criar sub-páginas.
                Páginas marcadas como <span className="text-solar-accent/70">Blog</span> aparecem em{" "}
                <Link href="/blog" className="text-solar-accent/60 hover:text-solar-accent transition-colors">/blog</Link>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
