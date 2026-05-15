import Link     from "next/link"
import { prisma } from "@/atlas/lib/db"

export const dynamic  = "force-dynamic"
export const metadata = { title: "Blog — Portal Solar" }

export default async function BlogPage() {
  const posts = await prisma.page.findMany({
    where:   { isBlog: true, isPublic: true },
    select:  {
      id: true, title: true, icon: true, slug: true,
      createdAt: true, updatedAt: true,
      user: { select: { username: true, displayName: true, avatarUrl: true, accentColor: true } },
    },
    orderBy: { updatedAt: "desc" },
    take:    50,
  })

  return (
    <div className="min-h-screen">
      <header className="ph">
        <div className="page-narrow">
          <p className="page-label mb-2">Portal Solar · Blog</p>
          <h1 className="page-title mb-1">Blog</h1>
          <p className="page-subtitle">Textos, ensaios e reflexões publicados pelos membros.</p>
        </div>
      </header>

      <div className="page-narrow py-10">
        {posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-solar-text/20 mb-3">Nenhum post ainda</p>
            <p className="font-mono text-[9px] text-solar-muted/30">
              Os textos publicados no Workspace aparecem aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-solar-border/15">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug ?? post.id}`}
                className="group flex items-start gap-4 py-7 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{post.icon ?? "📄"}</span>

                <div className="flex-1 min-w-0">
                  <h2
                    className="font-display text-xl leading-snug text-solar-text/90 group-hover:text-solar-text mb-2 transition-colors"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {post.title || "Sem título"}
                  </h2>

                  <div className="flex items-center gap-3 font-mono text-[8px] text-solar-muted/45">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0"
                        style={{ background: `${post.user.accentColor}25`, color: post.user.accentColor }}
                      >
                        {post.user.displayName[0]?.toUpperCase()}
                      </div>
                      <span>@{post.user.username}</span>
                    </div>

                    <span className="opacity-40">·</span>

                    <span>
                      {new Date(post.updatedAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-[9px] text-solar-muted/30 group-hover:text-solar-accent/60 transition-colors flex-shrink-0 mt-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
