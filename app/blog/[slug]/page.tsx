import { notFound } from "next/navigation"
import Link         from "next/link"
import { prisma }   from "@/atlas/lib/db"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.page.findFirst({
    where:  { slug, isPublic: true, isBlog: true },
    select: { title: true, icon: true, user: { select: { username: true } } },
  })
  return {
    title:       post ? `${post.icon ?? "📄"} ${post.title} — Blog Portal Solar` : "Post não encontrado",
    description: post ? `Texto de @${post.user.username} publicado no Portal Solar.` : undefined,
  }
}

// Renderizador BlockNote JSON → HTML
function renderContent(raw: string | null): string {
  if (!raw) return ""
  try {
    type BNBlock = {
      type: string
      content?: Array<{ type: string; text?: string; styles?: Record<string, string> }>
      children?: BNBlock[]
    }
    const blocks = JSON.parse(raw) as BNBlock[]

    const renderInline = (content: BNBlock["content"]) =>
      (content ?? []).map((s) => {
        let text = s.text ?? ""
        if (s.styles?.bold)   text = `<strong>${text}</strong>`
        if (s.styles?.italic) text = `<em>${text}</em>`
        if (s.styles?.code)   text = `<code>${text}</code>`
        return text
      }).join("")

    const renderBlock = (b: BNBlock): string => {
      const inner = renderInline(b.content)
      switch (b.type) {
        case "heading":           return `<h2>${inner}</h2>`
        case "paragraph":         return inner ? `<p>${inner}</p>` : "<br>"
        case "bulletListItem":    return `<li>${inner}</li>`
        case "numberedListItem":  return `<li>${inner}</li>`
        case "quote":             return `<blockquote>${inner}</blockquote>`
        case "code":              return `<pre><code>${inner}</code></pre>`
        default:                  return inner ? `<p>${inner}</p>` : ""
      }
    }

    return blocks.map(renderBlock).join("\n")
  } catch {
    return ""
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await prisma.page.findFirst({
    where:  { slug, isPublic: true, isBlog: true },
    select: {
      id: true, title: true, icon: true, content: true, slug: true,
      createdAt: true, updatedAt: true,
      user: { select: { username: true, displayName: true, avatarUrl: true, accentColor: true } },
    },
  })

  if (!post) notFound()

  const html = renderContent(post.content)

  return (
    <div className="min-h-screen">
      <div className="page-narrow pt-8">
        <Link
          href="/blog"
          className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/40 hover:text-solar-muted/70 transition-colors"
        >
          ← Blog
        </Link>
      </div>

      <article className="page-narrow py-10">
        <div className="mb-8">
          <div className="text-5xl mb-6">{post.icon ?? "📄"}</div>
          <h1
            className="font-display font-bold text-solar-text/95 leading-tight mb-4"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", letterSpacing: "-0.02em" }}
          >
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: `${post.user.accentColor}25`, color: post.user.accentColor }}
            >
              {post.user.displayName[0]?.toUpperCase()}
            </div>
            <div className="font-mono text-[8px] text-solar-muted/50">
              <Link
                href={`/perfil/${post.user.username}`}
                className="hover:opacity-80 transition-opacity"
                style={{ color: post.user.accentColor }}
              >
                @{post.user.username}
              </Link>
              <span className="mx-2 opacity-40">·</span>
              {new Date(post.updatedAt).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "long", year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "rgb(var(--c-border)/0.15)", marginBottom: "2.5rem" }} />

        {html ? (
          <div
            className="prose-portal"
            style={{ color: "rgb(var(--c-text)/0.82)", lineHeight: 1.8, fontSize: "1rem" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="font-mono text-[10px] text-solar-muted/30 italic">
            Este post não tem conteúdo ainda.
          </p>
        )}
      </article>

      <div className="page-narrow pb-16">
        <div style={{ height: 1, background: "rgb(var(--c-border)/0.12)", marginBottom: "1.5rem" }} />
        <p className="font-mono text-[8px] text-solar-muted/30">
          Publicado no{" "}
          <Link href="/" className="text-solar-accent/60 hover:text-solar-accent transition-colors">
            Portal Solar
          </Link>
          {" "}· Ecossistema de conhecimento — Diamantov
        </p>
      </div>
    </div>
  )
}
