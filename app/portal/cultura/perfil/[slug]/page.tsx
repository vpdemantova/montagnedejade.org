import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/atlas/lib/db"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import type { AtlasRelation, WorldNotice } from "@prisma/client"

// ── Tipos ──────────────────────────────────────────────────────────────────────

type RelationWithItems = AtlasRelation & {
  fromItem: { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null }
  toItem:   { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null }
}

// ── Extrai texto plain dos blocos BlockNote ────────────────────────────────────

function extractText(content: string | null): string[] {
  if (!content) return []
  try {
    const blocks = JSON.parse(content) as Array<{
      content?: Array<{ text?: string }>
      children?: Array<{ content?: Array<{ text?: string }> }>
    }>
    return blocks
      .map((b) => (b.content ?? []).map((c) => c.text ?? "").join(""))
      .filter(Boolean)
  } catch { return [] }
}

// ── Extrai metadata do campo JSON ─────────────────────────────────────────────

function getMeta(metadata: string | null): Record<string, string> {
  if (!metadata) return {}
  try { return JSON.parse(metadata) as Record<string, string> }
  catch { return {} }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PerfilCulturaPage({
  params,
}: {
  params: { slug: string }
}) {
  const person = await prisma.atlasItem.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      type: "PERSON",
    },
    include: { tags: true },
  })

  if (!person) notFound()

  const [relations, notices] = await Promise.all([
    prisma.atlasRelation.findMany({
      where: { OR: [{ fromItemId: person.id }, { toItemId: person.id }] },
      include: {
        fromItem: { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
        toItem:   { select: { id: true, slug: true, title: true, type: true, area: true, coverImage: true } },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<RelationWithItems[]>,

    prisma.worldNotice.findMany({
      where: {
        OR: [
          { title:  { contains: person.title, mode: "insensitive" } },
          { body:   { contains: person.title, mode: "insensitive" } },
          { author: { contains: person.title, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  const paragraphs = extractText(person.content)
  const meta       = getMeta(person.metadata)
  const works      = relations.map((r) =>
    r.fromItemId === person.id ? r.toItem : r.fromItem
  ).filter((item) => item.id !== person.id)

  const areaLabel = AREA_LABELS[person.area] ?? person.area

  return (
    <div className="relative min-h-screen">

      {/* ── Hero ── */}
      <div className="relative border-b border-solar-border/30">
        {person.coverImage ? (
          <div className="relative h-[40vh] min-h-64 overflow-hidden">
            <img src={person.coverImage} alt={person.title} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-solar-void/60 to-solar-void" />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-b from-solar-deep to-solar-void" />
        )}

        <div className="max-w-4xl mx-auto px-12 pb-8 -mt-16 relative z-10">
          {/* Avatar placeholder */}
          {!person.coverImage && (
            <div className="w-20 h-20 border border-solar-border/40 bg-solar-surface/30 flex items-center justify-center mb-4">
              <span className="font-display text-[28px] text-solar-amber/60">
                {person.title.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50 mb-2">
                <Link href="/portal/cultura" className="hover:text-solar-amber transition-solar">Cultura</Link>
                {" "}· Perfil
              </p>
              <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight mb-3">
                {person.title}
              </h1>

              {/* Meta: disciplina, época, local */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-4">
                {meta.disciplina && (
                  <span className="text-[10px] font-mono text-solar-amber/70">{meta.disciplina}</span>
                )}
                {meta.periodo && (
                  <span className="text-[10px] font-mono text-solar-muted/50">{meta.periodo}</span>
                )}
                {meta.local && (
                  <span className="text-[10px] font-mono text-solar-muted/40">{meta.local}</span>
                )}
                {meta.nascimento && (
                  <span className="text-[10px] font-mono text-solar-muted/40">{meta.nascimento}</span>
                )}
              </div>

              {/* Tags */}
              {person.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {person.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[8px] font-mono px-2 py-0.5 border border-solar-border/40 text-solar-muted/60 uppercase tracking-widest"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Edit link — subtle */}
            <Link
              href={`/atlas/${person.slug ?? person.id}`}
              className="flex-shrink-0 text-[8px] font-mono uppercase tracking-widest text-solar-muted/25 hover:text-solar-amber/50 transition-solar border border-solar-border/15 px-2 py-1 hover:border-solar-amber/20 mt-2"
            >
              Editar →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="max-w-4xl mx-auto px-12 py-10">
        <div className="grid grid-cols-3 gap-12">

          {/* Coluna principal */}
          <div className="col-span-2 space-y-10">

            {/* Biografia */}
            {paragraphs.length > 0 && (
              <section>
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-5">
                  Sobre
                </p>
                <div className="space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-[13px] font-body text-solar-text/80 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Obras relacionadas */}
            {works.length > 0 && (
              <section>
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-5">
                  Obras & Relações · {works.length}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {works.map((item) => (
                    <Link
                      key={item.id}
                      href={`/atlas/${item.slug ?? item.id}`}
                      className="group flex gap-3 p-3 border border-solar-border/20 hover:border-solar-amber/30 transition-solar"
                    >
                      {item.coverImage ? (
                        <div className="w-12 h-12 overflow-hidden flex-shrink-0 border border-solar-border/20">
                          <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex-shrink-0 border border-solar-border/15 bg-solar-deep/30 flex items-center justify-center">
                          <span className="text-[10px] text-solar-muted/30 font-mono">
                            {(TYPE_LABELS[item.type] ?? item.type).charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-solar-muted/40 mb-0.5 uppercase tracking-widest">
                          {AREA_LABELS[item.area] ?? item.area}
                        </p>
                        <p className="text-[11px] font-mono text-solar-text/80 group-hover:text-solar-text transition-solar leading-snug truncate">
                          {item.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Avisos relacionados */}
            {notices.length > 0 && (
              <section>
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-5">
                  No Radar
                </p>
                <div className="space-y-3">
                  {notices.map((n: WorldNotice) => (
                    <div key={n.id} className="flex gap-4 p-3 border border-solar-border/15 hover:border-solar-border/30 transition-solar">
                      <span className="text-[8px] font-mono text-solar-muted/30 flex-shrink-0 mt-0.5">
                        {new Date(n.createdAt).toLocaleDateString("pt-BR", { month: "short", day: "2-digit" })}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono text-solar-text/80 truncate mb-0.5">{n.title}</p>
                        {n.body && (
                          <p className="text-[9px] font-mono text-solar-muted/45 leading-snug line-clamp-2">{n.body}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Estado vazio */}
            {paragraphs.length === 0 && works.length === 0 && (
              <div className="py-16 text-center border border-dashed border-solar-border/20">
                <p className="text-[10px] font-mono text-solar-muted/35 mb-3">
                  Perfil sem conteúdo ainda.
                </p>
                <Link
                  href={`/atlas/${person.slug ?? person.id}`}
                  className="text-[9px] font-mono uppercase tracking-widest text-solar-amber/50 hover:text-solar-amber transition-solar"
                >
                  Editar perfil →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Metadados */}
            <div className="border border-solar-border/20 p-4 space-y-3">
              <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-3">Dados</p>
              {[
                ["Área",     areaLabel],
                ["Status",   person.status],
                ["Adicionado", new Date(person.createdAt).toLocaleDateString("pt-BR")],
                ...(meta.disciplina ? [["Disciplina", meta.disciplina]] : []),
                ...(meta.periodo    ? [["Período",    meta.periodo]]    : []),
                ...(meta.local      ? [["Local",      meta.local]]      : []),
                ...(meta.isbn       ? [["ISBN",       meta.isbn]]       : []),
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-2">
                  <span className="text-[8px] font-mono text-solar-muted/35 uppercase tracking-widest flex-shrink-0">{label}</span>
                  <span className="text-[9px] font-mono text-solar-text/60 text-right truncate">{value}</span>
                </div>
              ))}
            </div>

            {/* Relações count */}
            {relations.length > 0 && (
              <div className="border border-solar-border/15 p-4">
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-2">Conexões</p>
                <p className="font-display text-[32px] leading-none text-solar-amber/60">{relations.length}</p>
                <p className="text-[9px] font-mono text-solar-muted/35 mt-1">itens relacionados</p>
              </div>
            )}

            {/* Back link */}
            <Link
              href="/portal/cultura"
              className="block text-[9px] font-mono uppercase tracking-widest text-solar-muted/35 hover:text-solar-amber transition-solar"
            >
              ← Voltar à Cultura
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
