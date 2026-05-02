"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { AtlasItemWithTags } from "@/atlas/types"
import { TYPE_LABELS } from "@/atlas/types"
import { WikiImage } from "@/atlas/components/ui/WikiImage"

type SectionDef = {
  id:    string
  label: string
  icon:  string
  areas: string[]
  types?: string[]
  desc:  string
}

const SECTIONS: SectionDef[] = [
  { id:"cosmos",      label:"Cosmos",         icon:"✦", desc:"Universo, astronomia e espaço",         areas:["COSMOS"]                                                     },
  { id:"natureza",    label:"Natureza",        icon:"◉", desc:"Terra, vida e ecossistemas",            areas:["NATUREZA"]                                                    },
  { id:"ciencias",    label:"Ciências",        icon:"⬡", desc:"Física, química, matemática",          areas:["CIENCIAS","ELEMENTOS","GEOMETRIA"]                           },
  { id:"historia",    label:"História",        icon:"◈", desc:"Civilizações, eras, movimentos, países",areas:["HISTORIA"]                                                   },
  { id:"filosofia",   label:"Filosofia",       icon:"◻", desc:"Pensamento, ética e metafísica",       areas:["FILOSOFIA"]                                                   },
  { id:"mitologia",   label:"Mitologias",      icon:"⊕", desc:"Deuses e mitos do mundo",              areas:["HISTORIA"], types:["CONCEPT"]                                },
  { id:"musica-inst", label:"Instrumentos",    icon:"♩", desc:"Instrumentos musicais do mundo",       areas:["MUSICA"]                                                     },
  { id:"tecnologia",  label:"Tecnologia",      icon:"⬛", desc:"Invenções, máquinas e computação",     areas:["TECNOLOGIA","COMPUTACAO"]                                    },
  { id:"pessoas",     label:"Pessoas",         icon:"○", desc:"Humanos notáveis da história",         areas:["PESSOAS","MUSICOS","PINTORES","ESCRITORES","CIENTISTAS","FILOSOFOS","ARQUITETOS"] },
  { id:"obras",       label:"Obras",           icon:"▣", desc:"Criações que moldaram a civilização",  areas:["OBRAS","PINTURAS","ESCULTURA","ARQUITETURA","CINEMA","ARTES"] },
  { id:"biblioteca",  label:"Biblioteca",      icon:"▤", desc:"Livros da humanidade",                 areas:["BIBLIOTECA"], types:["READING"]                              },
  { id:"acervo",      label:"Acervo Geral",    icon:"◈", desc:"Todo o conhecimento indexado",         areas:["ATLAS","STUDIO"]                                              },
]

function parseMetadata(raw?: string | null): Record<string, unknown> {
  try { return JSON.parse(raw ?? "{}") } catch { return {} }
}

function AtlasCard({ item, size = "md" }: { item: AtlasItemWithTags; size?: "sm" | "md" | "lg" }) {
  const meta    = useMemo(() => parseMetadata(item.metadata), [item.metadata])
  const imgSrc  = ((item as Record<string,unknown>).coverImage ?? meta.imageUrl ?? meta.coverImage ?? null) as string | null
  const period  = meta.period as { start?: number; end?: number } | undefined
  const typeLabel = TYPE_LABELS[item.type] ?? item.type

  const w = size === "lg" ? "w-52" : size === "sm" ? "w-32" : "w-40"
  const h = size === "lg" ? "h-36" : size === "sm" ? "h-20" : "h-28"
  const t = size === "sm"  ? "text-[10px]" : "text-[12px]"

  return (
    <Link href={`/atlas/${item.slug ?? item.id}`} className={`${w} flex-shrink-0 group`}>
      <div className={`${h} overflow-hidden mb-1.5 border border-solar-border/20 group-hover:border-solar-border/40 transition-colors duration-200`}>
        <WikiImage
          src={imgSrc}
          name={item.title}
          alt={item.title}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
          wikiSearch={!imgSrc}
        />
      </div>
      <p className={`${t} font-display leading-snug text-solar-text/85 group-hover:text-solar-text line-clamp-2 transition-colors`}>
        {item.title}
      </p>
      <p className="text-[7px] font-mono uppercase tracking-widest text-solar-muted/55 mt-0.5">
        {typeLabel}{period?.start ? ` · ${period.start}` : ""}
      </p>
    </Link>
  )
}

function FeaturedRow({ items }: { items: AtlasItemWithTags[] }) {
  if (!items.length) return null
  return (
    <section className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="font-mono text-[8px] uppercase tracking-[0.3em] text-solar-muted/65">Em destaque</h2>
          <p className="font-mono text-[6.5px] uppercase tracking-widest text-solar-muted/40">Seleção editorial</p>
        </div>
        <Link href="/display" className="font-mono text-[7.5px] uppercase tracking-widest text-solar-accent/70 hover:text-solar-accent transition-colors">
          Display →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => <AtlasCard key={item.id} item={item} size="lg" />)}
      </div>
    </section>
  )
}

function AtlasSection({ section, items }: { section: SectionDef; items: AtlasItemWithTags[] }) {
  let sectionItems = items.filter((i) => section.areas.includes(i.area ?? ""))

  // Seção de mitologias: filtra apenas itens com metadata.category = "mythology"
  if (section.id === "mitologia") {
    sectionItems = sectionItems.filter((i) => {
      const m = parseMetadata(i.metadata)
      return m.category === "mythology"
    })
  }

  if (!sectionItems.length) return null

  const presentTypes  = Array.from(new Set(sectionItems.map((i) => i.type)))
  const availableTabs = section.types ? section.types.filter((t) => presentTypes.includes(t)) : presentTypes
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const filtered = activeTab ? sectionItems.filter((i) => i.type === activeTab) : sectionItems

  return (
    <section className="mb-8">
      <div className="flex items-end gap-3 mb-2.5 pb-2" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.12)" }}>
        <span className="text-[9px] text-solar-muted/45">{section.icon}</span>
        <h2 className="font-mono text-[8px] uppercase tracking-[0.3em] text-solar-text/75 flex-1">{section.label}</h2>
        <span className="font-mono text-[7px] text-solar-muted/35 hidden sm:inline">{section.desc}</span>
        <span className="font-mono text-[7px] text-solar-muted/35 tabular-nums">{sectionItems.length}</span>

        {availableTabs.length > 1 && (
          <div className="flex items-center">
            <button onClick={() => setActiveTab(null)}
              className="font-mono text-[6.5px] uppercase tracking-widest px-2 py-0.5 border-r transition-colors"
              style={{ borderColor: "rgb(var(--c-border) / 0.2)", color: activeTab === null ? "rgb(var(--c-text) / 0.9)" : "rgb(var(--c-text) / 0.38)", backgroundColor: activeTab === null ? "rgb(var(--c-surface) / 0.5)" : "transparent" }}>
              Todos
            </button>
            {availableTabs.map((t) => (
              <button key={t} onClick={() => setActiveTab(t === activeTab ? null : t)}
                className="font-mono text-[6.5px] uppercase tracking-widest px-2 py-0.5 border-r last:border-r-0 transition-colors"
                style={{ borderColor: "rgb(var(--c-border) / 0.2)", color: activeTab === t ? "rgb(var(--c-text) / 0.9)" : "rgb(var(--c-text) / 0.38)", backgroundColor: activeTab === t ? "rgb(var(--c-surface) / 0.5)" : "transparent" }}>
                {TYPE_LABELS[t] ?? t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {/* Link especial para tabela periódica na seção de Ciências */}
        {section.id === "ciencias" && (
          <Link href="/atlas/tabela-periodica"
            className="w-40 flex-shrink-0 flex flex-col items-center justify-center gap-1 border border-solar-accent/25 bg-solar-accent/5 hover:bg-solar-accent/10 hover:border-solar-accent/50 transition-all"
            style={{ minHeight: "112px" }}>
            <span className="font-mono text-[18px]" style={{ color: "rgb(var(--c-accent))" }}>⬡</span>
            <span className="font-mono text-[7px] uppercase tracking-widest text-center" style={{ color: "rgb(var(--c-accent) / 0.8)" }}>Tabela<br/>Periódica</span>
          </Link>
        )}
        {filtered.slice(0, 24).map((item) => <AtlasCard key={item.id} item={item} size="md" />)}
        {filtered.length > 24 && (
          <Link href={`/?area=${section.areas[0]}`}
            className="w-40 flex-shrink-0 flex items-center justify-center border border-dashed border-solar-border/25 hover:border-solar-border/50 transition-colors text-solar-muted/45 hover:text-solar-muted text-[7.5px] font-mono uppercase tracking-widest"
            style={{ minHeight: "112px" }}>
            +{filtered.length - 24}
          </Link>
        )}
        {filtered.length === 0 && (
          <div className="py-4">
            <p className="font-mono text-[7.5px] text-solar-muted/40 uppercase tracking-widest">{section.label} sem itens ainda</p>
            <Link href="/atlas/seed" className="font-mono text-[7px] text-solar-accent/60 hover:text-solar-accent transition-colors mt-1 block">Executar seed →</Link>
          </div>
        )}
      </div>
    </section>
  )
}

export function AtlasHomeView({ items }: { items: AtlasItemWithTags[] }) {
  const featured = useMemo(() => items.filter((i) => i.isFavorite || i.status === "FAVORITE").slice(0, 8), [items])

  return (
    <div>
      {/* Cabeçalho — sem repetição do nome "Atlas" */}
      <div className="mb-8 pt-6 pb-5" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.15)" }}>
        <h1 className="font-display text-3xl font-bold leading-none mb-2" style={{ color: "rgb(var(--c-text) / 0.9)" }}>
          do Conhecimento
        </h1>
        <p className="font-mono text-[9px] max-w-2xl" style={{ color: "rgb(var(--c-muted) / 0.65)" }}>
          Índice enciclopédico — cosmos, natureza, história, ciências, pessoas, obras e biblioteca.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
          <span className="font-mono text-[8px] tabular-nums" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>{items.length.toLocaleString("pt-BR")} itens</span>
          <Link href="/atlas/grafo" className="font-mono text-[8px] hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-accent) / 0.75)" }}>Grafo →</Link>
          <Link href="/atlas/novo"  className="font-mono text-[8px] hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>+ Novo</Link>
          {items.length < 200 && (
            <Link href="/atlas/seed" className="font-mono text-[8px] hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>Seed enciclopédico →</Link>
          )}
        </div>
      </div>

      <FeaturedRow items={featured} />
      {SECTIONS.map((s) => <AtlasSection key={s.id} section={s} items={items} />)}
    </div>
  )
}
