"use client"

import { useState } from "react"
import type { WorldNotice } from "@/atlas/types"
import type { AtlasItemWithTags } from "@/atlas/types"
import { NOTICE_LABELS } from "@/atlas/types"
import Link from "next/link"
import { WorldBoard } from "@/atlas/components/ui/WorldBoard"

// ── Notice type colors ─────────────────────────────────────────────────────────

const TYPE_STYLE: Record<string, { text: string; border: string; bg: string }> = {
  OBRA:       { text: "text-solar-amber",    border: "border-solar-amber/40",    bg: "bg-solar-amber/5"    },
  AVISO:      { text: "text-solar-red/80",   border: "border-solar-red/30",      bg: "bg-solar-red/5"      },
  EVENTO:     { text: "text-[#4A6C7C]",      border: "border-[#4A6C7C]/40",      bg: "bg-[#4A6C7C]/5"      },
  DESCOBERTA: { text: "text-compass-neon",   border: "border-compass-neon/30",   bg: "bg-compass-neon/5"   },
  HOMENAGEM:  { text: "text-solar-muted/70", border: "border-solar-border/40",   bg: "bg-solar-surface/30" },
  CITACAO:    { text: "text-solar-text/60",  border: "border-solar-border/30",   bg: "bg-transparent"      },
}

const NOTICE_TYPES = ["Todos", ...Object.keys(NOTICE_LABELS)]

// ── Notice card ────────────────────────────────────────────────────────────────

function NoticeCard({ notice }: { notice: WorldNotice }) {
  const style = TYPE_STYLE[notice.type] ?? TYPE_STYLE.AVISO!
  const date  = new Date(notice.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div className={`border ${style.border} ${style.bg} p-5 transition-solar hover:brightness-110`}>
      {notice.isPinned && (
        <p className="text-[8px] font-mono uppercase tracking-widest text-solar-amber/70 mb-2">
          ★ Fixado
        </p>
      )}

      <div className="flex items-start gap-3 mb-3">
        <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 border ${style.border} ${style.text} flex-shrink-0 mt-0.5`}>
          {NOTICE_LABELS[notice.type] ?? notice.type}
        </span>
        <p className={`text-[9px] font-mono uppercase tracking-widest ${style.text} opacity-50`}>
          {notice.area}
        </p>
      </div>

      <h3 className="font-display text-[16px] leading-snug text-solar-text/90 mb-2">
        {notice.title}
      </h3>

      {notice.body && (
        <p className="text-[10px] font-mono text-solar-muted/55 leading-relaxed line-clamp-4">
          {notice.body}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-solar-border/15">
        <div className="flex items-center gap-3">
          {notice.author && (
            <span className="text-[9px] font-mono text-solar-muted/45">{notice.author}</span>
          )}
          <span className="text-[9px] font-mono text-solar-muted/30">{date}</span>
        </div>
        {notice.sourceUrl && (
          <a
            href={notice.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-solar-amber/50 hover:text-solar-amber transition-solar uppercase tracking-widest"
          >
            Fonte →
          </a>
        )}
      </div>
    </div>
  )
}

// ── Atlas item radar card ──────────────────────────────────────────────────────

function RadarItemCard({ item }: { item: AtlasItemWithTags }) {
  return (
    <Link
      href={`/atlas/${item.slug ?? item.id}`}
      className="group flex items-center gap-4 px-4 py-3 border-b border-solar-border/15 hover:bg-solar-surface/20 transition-solar"
    >
      <span className="text-[9px] font-mono text-solar-muted/30 w-14 flex-shrink-0 text-right">
        {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono text-solar-text/80 group-hover:text-solar-text transition-solar truncate">
          {item.title}
        </p>
        <p className="text-[9px] font-mono text-solar-muted/40">
          {item.type} · {item.area}
        </p>
      </div>
      {item.tags.slice(0, 2).map((t) => (
        <span key={t.id} className="text-[8px] font-mono text-solar-muted/40 uppercase tracking-widest hidden sm:block">
          {t.name}
        </span>
      ))}
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function CulturaClient({
  notices,
  eventos,
}: {
  notices: WorldNotice[]
  eventos: AtlasItemWithTags[]
}) {
  const [typeFilter, setTypeFilter] = useState("Todos")

  const pinned  = notices.filter((n) => n.isPinned)
  const filtered = typeFilter === "Todos"
    ? notices
    : notices.filter((n) => n.type === typeFilter)

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/70 mb-3">
            Portal Solar · Cultura
          </p>
          <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
            Radar de Inteligência
          </h1>
          <p className="text-[11px] font-mono text-solar-muted/50 mt-3 max-w-xl">
            Notícias, eventos e ações sociais. Curadoria que combate bolhas cruzando áreas do conhecimento.
          </p>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-12 py-6">

        {/* WorldBoard — 5 views */}
        <div className="mb-10">
          <WorldBoard notices={notices} />
        </div>

        <div className="flex gap-8">

          {/* ── Coluna principal: Notices filtrados ────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Filtros de tipo */}
            <div className="flex items-center gap-0 border-b border-solar-border/20 pb-0">
              {NOTICE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2 text-[8px] font-mono uppercase tracking-widest border-b-2 -mb-px transition-solar ${
                    typeFilter === t
                      ? "border-solar-amber text-solar-amber"
                      : "border-transparent text-solar-muted/40 hover:text-solar-muted"
                  }`}
                >
                  {t === "Todos" ? t : (NOTICE_LABELS[t] ?? t)}
                </button>
              ))}
              <div className="flex-1" />
              <span className="text-[8px] font-mono text-solar-muted/25 pb-2">
                {filtered.length} {filtered.length === 1 ? "entrada" : "entradas"}
              </span>
            </div>

            {/* Grade de notices */}
            {filtered.length === 0 ? (
              <div className="py-16 border border-dashed border-solar-border/15 text-center">
                <p className="text-[10px] font-mono text-solar-muted/35">
                  Nenhuma entrada para este filtro.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="flex-shrink-0 w-64 space-y-4">

            {/* Perfis culturais (pessoas) */}
            {(() => {
              const pessoas = eventos.filter((i) => i.type === "PERSON")
              if (pessoas.length === 0) return null
              return (
                <div className="border border-solar-border/20">
                  <div className="border-b border-solar-border/20 px-4 py-2 flex items-center justify-between">
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/40">
                      Perfis
                    </p>
                    <span className="text-[8px] font-mono text-solar-muted/25">{pessoas.length}</span>
                  </div>
                  <div className="divide-y divide-solar-border/10">
                    {pessoas.slice(0, 8).map((item) => (
                      <Link
                        key={item.id}
                        href={`/portal/cultura/perfil/${item.slug ?? item.id}`}
                        className="group flex items-center gap-3 px-4 py-2.5 hover:bg-solar-surface/20 transition-solar"
                      >
                        {item.coverImage ? (
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-solar-border/30 flex-shrink-0">
                            <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full border border-solar-border/30 bg-solar-deep/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-mono text-solar-muted/50">
                              {item.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <p className="text-[10px] font-mono text-solar-text/70 group-hover:text-solar-text transition-solar truncate">
                          {item.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Acervo geral (não-pessoas) */}
            <div className="border border-solar-border/20">
              <div className="border-b border-solar-border/20 px-4 py-2 flex items-center justify-between">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/40">
                  Acervo
                </p>
                <span className="text-[8px] font-mono text-solar-muted/25">
                  {eventos.filter((i) => i.type !== "PERSON").length}
                </span>
              </div>
              {eventos.filter((i) => i.type !== "PERSON").length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[9px] font-mono text-solar-muted/35">Sem itens da área Cultura.</p>
                  <Link href="/atlas/novo?area=CULTURA" className="block mt-2 text-[9px] font-mono text-solar-amber/50 hover:text-solar-amber transition-solar">
                    + Adicionar →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-solar-border/10">
                  {eventos.filter((i) => i.type !== "PERSON").slice(0, 15).map((item) => (
                    <RadarItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
