"use client"

import { useState } from "react"
import { MarkdownRender } from "@/atlas/components/ui/MarkdownRender"

type DocTab = "visao" | "arquitetura" | "stack"
type StaticTab = "taxonomia" | "modulos"
type Tab = DocTab | StaticTab

type Doc = { key: DocTab; label: string; content: string }

const TAB_LABELS: Record<Tab, string> = {
  visao:       "Visão & Manifesto",
  arquitetura: "Arquitetura",
  stack:       "Stack",
  taxonomia:   "Taxonomia",
  modulos:     "Mapa de Módulos",
}

// ─── Taxonomia — os quatro eixos de conteúdo do Atlas ─────────────────────────

const TAXONOMY_AXES = [
  {
    name: "Matéria",
    desc: "Entidades físicas, propriedades de objetos, física do som — o que as coisas são.",
  },
  {
    name: "Linha do Tempo",
    desc: "Estruturas temporais, história, cronologias — quando as coisas aconteceram.",
  },
  {
    name: "Lógica",
    desc: "Algoritmos, regras matemáticas, teoria estrutural, harmonia — como as coisas se relacionam.",
  },
  {
    name: "Ação",
    desc: "Métodos práticos, execução humana, rotinas, gestos — como as coisas se fazem.",
  },
]

function TaxonomiaTab() {
  return (
    <div>
      <p className="text-[13px] text-solar-text/70 leading-relaxed mb-8">
        Todo item do Atlas — não importa a área — pode ser lido através de quatro eixos.
        Eles não são categorias exclusivas: a maioria dos itens toca em mais de um eixo ao
        mesmo tempo, e é essa sobreposição que gera as conexões do grafo.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TAXONOMY_AXES.map((axis) => (
          <div key={axis.name} className="border border-solar-border/25 rounded-[6px] p-4">
            <h3 className="text-sm font-display font-semibold text-solar-accent/80 mb-2">{axis.name}</h3>
            <p className="text-[12px] text-solar-text/60 leading-relaxed">{axis.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mapa de Módulos — todas as áreas de topo do app ──────────────────────────

const MODULE_MAP: Array<{ route: string; purpose: string; model: string }> = [
  { route: "/atlas",         purpose: "Repositório geral de todo o conhecimento catalogado", model: "AtlasItem" },
  { route: "/academia",      purpose: "Curadoria de trilhas — sequências de passos pelo conteúdo",       model: "AtlasItem (type: PATH)" },
  { route: "/directory",     purpose: "Biblioteca de mídia — imagens, áudio, PDFs e outros arquivos",     model: "Asset / AssetLink" },
  { route: "/structure",     purpose: "Como o Portal Solar em si é construído",                           model: "docs/*.md (estático)" },
  { route: "/world",         purpose: "Mapa interativo — o Grande Mapa",                                  model: "AtlasItem (geolocalizado)" },
  { route: "/mind",          purpose: "Meditação, consciência e hábitos mentais",                         model: "AtlasItem (area: MIND)" },
  { route: "/manifestation", purpose: "Guias de como criar, produzir e fazer",                             model: "AtlasItem (area: MANIFESTATION)" },
  { route: "/foundation",    purpose: "Gramática, matemática — as bases de todo conhecimento",             model: "AtlasItem (area: FOUNDATION)" },
  { route: "/expression",    purpose: "Música, escrita, teatro — as artes criativas",                      model: "AtlasItem (area: EXPRESSION)" },
  { route: "/hymns",         purpose: "Cânticos, odes e orações — coleção devocional",                     model: "AtlasItem (area: HYMNS)" },
  { route: "/social",        purpose: "Feed, eventos e rede de conexões",                                  model: "Post / Event" },
  { route: "/compass",       purpose: "Espaço pessoal — diário, notas, metas, estudos",                    model: "JournalEntry / Note / Goal" },
]

function ModulosTab() {
  return (
    <div>
      <p className="text-[13px] text-solar-text/70 leading-relaxed mb-6">
        Cada área de topo do Portal Solar, sua rota e o modelo de dados que a alimenta.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] font-mono">
          <thead className="border-b border-solar-border/30">
            <tr>
              <th className="text-left text-[10px] uppercase tracking-widest text-solar-muted/60 pb-2 pr-4 font-normal">Rota</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-solar-muted/60 pb-2 pr-4 font-normal">Propósito</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-solar-muted/60 pb-2 font-normal">Modelo</th>
            </tr>
          </thead>
          <tbody>
            {MODULE_MAP.map((m) => (
              <tr key={m.route}>
                <td className="text-solar-accent/80 py-2 pr-4 border-b border-solar-border/10 align-top whitespace-nowrap">{m.route}</td>
                <td className="text-solar-text/60 py-2 pr-4 border-b border-solar-border/10 align-top">{m.purpose}</td>
                <td className="text-solar-text/40 py-2 border-b border-solar-border/10 align-top whitespace-nowrap">{m.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function StructureClient({ docs }: { docs: Doc[] }) {
  const [active, setActive] = useState<Tab>("visao")

  const currentDoc = docs.find((d) => d.key === active)

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Tabs */}
      <div className="flex gap-0 border-b border-solar-border/20 flex-shrink-0 overflow-x-auto">
        {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`
              py-3 px-1 mr-6 text-[11px] font-mono uppercase tracking-widest transition-colors whitespace-nowrap
              ${active === key
                ? "text-solar-text border-b-2 border-solar-accent -mb-px"
                : "text-solar-text/35 hover:text-solar-text/60"
              }
            `}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-10">
          {active === "taxonomia" && <TaxonomiaTab />}
          {active === "modulos"   && <ModulosTab />}
          {currentDoc && <MarkdownRender content={currentDoc.content} />}
        </div>
      </div>

    </div>
  )
}
