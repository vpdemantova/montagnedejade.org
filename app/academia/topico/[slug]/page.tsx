import { notFound } from "next/navigation"
import Link from "next/link"
import { getTopicBySlug, getRelatedTopics, TOPICS } from "@/atlas/lib/topics"

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) return {}
  return { title: `${topic.title} — Academia · Portal Solar` }
}

export default async function TopicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()

  const related = getRelatedTopics(topic)

  return (
    <main className="min-h-screen pb-24">
      <div className="page-narrow py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10">
          <Link href="/academia" className="page-label hover:opacity-70 transition-opacity">
            Academia
          </Link>
          <span className="page-label">→</span>
          <span className="page-label">{topic.title}</span>
        </div>

        {/* Título */}
        <h1 className="page-title mb-2">{topic.title}</h1>
        <p className="font-display mb-8"
          style={{ fontSize: "1.05rem", color: "rgb(var(--c-muted) / 0.7)", letterSpacing: "-0.01em" }}>
          {topic.subtitle}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {topic.tags.map((tag) => (
            <span key={tag} className="editorial-tag">{tag}</span>
          ))}
        </div>

        {/* Separador */}
        <div className="border-t mb-8" style={{ borderColor: "rgb(var(--c-border) / 0.15)" }} />

        {/* Descrição */}
        <div className="space-y-4 mb-12">
          {topic.description.split("\n\n").map((para, i) => (
            <p key={i} className="font-display leading-relaxed"
              style={{ fontSize: "1rem", color: "rgb(var(--c-text) / 0.82)", letterSpacing: "-0.005em" }}>
              {para}
            </p>
          ))}
        </div>

        {/* Perguntas para reflexão */}
        <div className="mb-12">
          <p className="section-label mb-5">Perguntas para reflexão</p>
          <div className="space-y-3">
            {topic.questions.map((q, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="font-mono text-[6px] pt-1 flex-shrink-0"
                  style={{ color: "rgb(var(--c-muted) / 0.3)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-display leading-snug"
                  style={{ fontSize: "0.95rem", color: "rgb(var(--c-text) / 0.75)", letterSpacing: "-0.01em" }}>
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tópicos relacionados */}
        {related.length > 0 && (
          <div>
            <p className="section-label mb-5">Tópicos relacionados</p>
            <div className="grid grid-cols-2 gap-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/academia/topico/${r.slug}`}
                  className="block p-4 group hover:opacity-80 transition-opacity card">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-display"
                      style={{ fontSize: "0.88rem", letterSpacing: "-0.01em", color: "rgb(var(--c-text) / 0.85)" }}>
                      {r.title}
                    </span>
                    <span className="opacity-0 group-hover:opacity-40 transition-opacity"
                      style={{ fontSize: 10, color: "rgb(var(--c-text))" }}>→</span>
                  </div>
                  <p className="font-mono text-[7px] leading-snug"
                    style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
                    {r.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
