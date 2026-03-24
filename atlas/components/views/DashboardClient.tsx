"use client"

import React, { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useSolarStore } from "@/atlas/lib/store"
import type { HomeSectionId } from "@/atlas/lib/store"

function EscolaPlaceholder() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ height: "68vh", minHeight: 480, background: "#040609" }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(200,164,90,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(200,164,90,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Corner brackets */}
      {[["top-5 left-5","border-t border-l"],["top-5 right-5","border-t border-r"],["bottom-5 left-5","border-b border-l"],["bottom-5 right-5","border-b border-r"]].map(([pos, cls]) => (
        <div key={pos} className={`absolute ${pos} ${cls} border-solar-amber/12 w-6 h-6`} />
      ))}

      {/* Architectural silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="100%" height="100%"
          viewBox="0 0 380 220"
          fill="none"
          className="opacity-[0.13] max-w-[380px]"
          aria-hidden
        >
          {/* Ground line */}
          <line x1="10" y1="195" x2="370" y2="195" stroke="#C8A45A" strokeWidth="1"/>
          {/* Steps */}
          <line x1="50" y1="195" x2="50" y2="188" stroke="#C8A45A" strokeWidth="0.7"/>
          <line x1="50" y1="188" x2="330" y2="188" stroke="#C8A45A" strokeWidth="0.7"/>
          <line x1="330" y1="188" x2="330" y2="195" stroke="#C8A45A" strokeWidth="0.7"/>
          <line x1="65" y1="188" x2="65" y2="181" stroke="#C8A45A" strokeWidth="0.7"/>
          <line x1="65" y1="181" x2="315" y2="181" stroke="#C8A45A" strokeWidth="0.7"/>
          <line x1="315" y1="181" x2="315" y2="188" stroke="#C8A45A" strokeWidth="0.7"/>
          {/* Main facade */}
          <rect x="75" y="75" width="230" height="106" stroke="#C8A45A" strokeWidth="0.8" fill="none"/>
          {/* Pediment triangle */}
          <polygon points="55,75 190,20 325,75" stroke="#C8A45A" strokeWidth="0.8" fill="none"/>
          {/* Pediment inner */}
          <polygon points="80,75 190,32 300,75" stroke="#C8A45A" strokeWidth="0.4" fill="none" opacity="0.5"/>
          {/* Columns */}
          {[95,122,149,176,203,230,257,284].map((x) => (
            <line key={x} x1={x} y1="75" x2={x} y2="181" stroke="#C8A45A" strokeWidth="0.6" opacity="0.7"/>
          ))}
          {/* Column capitals */}
          {[95,122,149,176,203,230,257,284].map((x) => (
            <rect key={x} x={x - 5} y="72" width="10" height="4" stroke="#C8A45A" strokeWidth="0.5" fill="none" opacity="0.5"/>
          ))}
          {/* Door */}
          <rect x="166" y="135" width="48" height="46" stroke="#C8A45A" strokeWidth="0.8" fill="none"/>
          {/* Door arch */}
          <path d={`M166,135 Q190,115 214,135`} stroke="#C8A45A" strokeWidth="0.6" fill="none"/>
          {/* Windows row */}
          {[90, 143, 220, 273].map((x) => (
            <rect key={x} x={x} y="92" width="32" height="28" stroke="#C8A45A" strokeWidth="0.6" fill="none" opacity="0.8"/>
          ))}
          {/* Window muntins */}
          {[90, 143, 220, 273].map((x) => (
            <g key={x} opacity="0.4">
              <line x1={x + 16} y1="92" x2={x + 16} y2="120" stroke="#C8A45A" strokeWidth="0.4"/>
              <line x1={x} y1="106" x2={x + 32} y2="106" stroke="#C8A45A" strokeWidth="0.4"/>
            </g>
          ))}
        </svg>
      </div>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 gap-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-solar-amber/15" />
          <span className="text-[8px] font-mono uppercase tracking-[0.35em] text-solar-amber/30">
            Escola Solar
          </span>
          <div className="h-px w-12 bg-solar-amber/15" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-solar-amber/25 animate-pulse" />
          <span className="text-[7px] font-mono text-solar-muted/20 uppercase tracking-widest">
            Inicializando cena 3D…
          </span>
          <div className="w-1 h-1 rounded-full bg-solar-amber/25 animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>

      {/* Subtle scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />
    </div>
  )
}

const EscolaMuseu = dynamic(
  () => import("@/atlas/components/3d/EscolaMuseu").then((m) => m.EscolaMuseu),
  { ssr: false, loading: () => <EscolaPlaceholder /> }
)
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { AtlasItemWithTags, WorldNotice } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import { ItemCard } from "@/atlas/components/ui/ItemCard"
import { WorldBoard } from "@/atlas/components/ui/WorldBoard"

gsap.registerPlugin(ScrollTrigger)

// ── Saudação ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return "Bom dia"
  if (h >= 12 && h < 18) return "Boa tarde"
  return "Boa noite"
}

function LiveClock() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const tick = () => {
      if (ref.current) {
        ref.current.textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span ref={ref} />
}

// ── Descoberta do Dia ─────────────────────────────────────────────────────────

function DiscoveryCard({ item }: { item: AtlasItemWithTags }) {
  const areaLabel = AREA_LABELS[item.area] ?? item.area
  const typeLabel = TYPE_LABELS[item.type] ?? item.type
  const excerpt   = item.content
    ? (() => {
        try {
          const blocks = JSON.parse(item.content) as Array<{ content?: Array<{ text?: string }> }>
          return blocks.flatMap((b) => b.content?.map((c) => c.text ?? "") ?? []).join(" ").slice(0, 150)
        } catch { return item.content.slice(0, 150) }
      })()
    : null

  return (
    <div className="bg-solar-void p-4 sm:p-8 flex flex-col gap-4">
      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70">Descoberta do Dia</p>
      <div className="flex-1">
        <p className="text-[9px] font-mono text-solar-muted/55 uppercase tracking-widest mb-2">
          {areaLabel} · {typeLabel}
        </p>
        <h3 className="font-display text-solar-text text-base leading-snug mb-3">{item.title}</h3>
        {excerpt && (
          <p className="text-[11px] font-body text-solar-muted/65 leading-relaxed line-clamp-3">{excerpt}…</p>
        )}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="text-[8px] font-mono px-1.5 py-0.5 border border-solar-border/50 text-solar-muted/55 uppercase tracking-widest">
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <Link href={`/atlas/${item.slug ?? item.id}`} className="text-[10px] font-mono text-solar-amber/70 hover:text-solar-amber transition-solar uppercase tracking-widest">
        Explorar →
      </Link>
    </div>
  )
}

// ── Board de Artes — 3 view modes ─────────────────────────────────────────────

type ArtItem = { id: string; slug?: string | null; title: string; area: string; type: string; coverUrl?: string | null; location?: string | null }
type BoardView = "galeria" | "carrossel" | "mosaico"

function BoardGaleria({ items }: { items: ArtItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-solar-border/20">
      {items.slice(0, 9).map((item) => (
        <Link key={item.id} href={`/atlas/${item.slug ?? item.id}`}
          className="group relative bg-solar-void aspect-square flex flex-col justify-end p-4 overflow-hidden hover:bg-solar-surface/30 transition-colors"
        >
          {item.coverUrl ? (
            <img src={item.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-solar-surface to-solar-deep" />
          )}
          <div className="relative z-10">
            <p className="text-[7px] font-mono uppercase tracking-widest text-solar-muted/50 mb-1">{item.area}</p>
            <p className="text-[10px] font-mono text-solar-text/90 leading-snug line-clamp-2">{item.title}</p>
          </div>
        </Link>
      ))}
      {items.length === 0 && (
        <div className="col-span-3 flex items-center justify-center h-32">
          <Link href="/atlas/novo" className="text-[10px] font-mono text-solar-muted/40 hover:text-solar-amber transition-solar">
            Adicionar obras ao Atlas →
          </Link>
        </div>
      )}
    </div>
  )
}

function BoardCarrossel({ items }: { items: ArtItem[] }) {
  const [idx, setIdx] = useState(0)
  const cur = items[idx]
  if (!cur) return <div className="flex items-center justify-center h-48"><p className="text-[9px] font-mono text-solar-muted/30">Sem itens</p></div>

  return (
    <div className="relative h-56 bg-solar-void flex items-end overflow-hidden">
      {cur.coverUrl ? (
        <img src={cur.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-solar-deep to-solar-surface" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-solar-void/80 to-transparent" />
      <div className="relative z-10 flex items-end justify-between w-full px-6 pb-5">
        <div>
          <p className="text-[8px] font-mono uppercase tracking-widest text-solar-amber/50 mb-1">{cur.area} · {cur.type}</p>
          <Link href={`/atlas/${cur.slug ?? cur.id}`} className="font-display text-xl text-solar-text hover:text-solar-amber transition-solar leading-tight block">
            {cur.title}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)} className="text-solar-muted/50 hover:text-solar-amber transition-solar font-mono text-sm">←</button>
          <span className="text-[8px] font-mono text-solar-muted/30">{idx + 1} / {items.length}</span>
          <button onClick={() => setIdx((i) => (i + 1) % items.length)} className="text-solar-muted/50 hover:text-solar-amber transition-solar font-mono text-sm">→</button>
        </div>
      </div>
    </div>
  )
}

function BoardMosaico({ items }: { items: ArtItem[] }) {
  const grid = items.slice(0, 7)
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 grid-rows-2 gap-px bg-solar-border/20" style={{ height: "clamp(160px, 30vw, 220px)" }}>
      {/* Big tile */}
      {grid[0] && (
        <Link href={`/atlas/${grid[0].slug ?? grid[0].id}`}
          className="col-span-2 row-span-2 group relative bg-solar-void flex flex-col justify-end p-4 overflow-hidden hover:bg-solar-surface/20 transition-colors"
        >
          {grid[0].coverUrl
            ? <img src={grid[0].coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity" />
            : <div className="absolute inset-0 bg-gradient-to-br from-solar-amber/5 to-solar-surface" />
          }
          <div className="absolute inset-0 bg-gradient-to-t from-solar-void/70 to-transparent" />
          <p className="relative z-10 text-[10px] font-mono text-solar-text/90 leading-snug line-clamp-2">{grid[0].title}</p>
        </Link>
      )}
      {/* Small tiles */}
      {grid.slice(1).map((item) => (
        <Link key={item.id} href={`/atlas/${item.slug ?? item.id}`}
          className="group relative bg-solar-void flex items-end p-2 overflow-hidden hover:bg-solar-surface/30 transition-colors"
        >
          {item.coverUrl
            ? <img src={item.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity" />
            : <div className="absolute inset-0 bg-solar-surface/30" />
          }
          <p className="relative z-10 text-[7px] font-mono text-solar-text/80 leading-tight line-clamp-2">{item.title}</p>
        </Link>
      ))}
      {grid.length === 0 && (
        <div className="col-span-3 sm:col-span-4 row-span-2 flex items-center justify-center">
          <p className="text-[9px] font-mono text-solar-muted/30">Sem itens</p>
        </div>
      )}
    </div>
  )
}

function BoardArtes() {
  const [items, setItems] = useState<ArtItem[]>([])
  const [view,  setView]  = useState<BoardView>("galeria")

  useEffect(() => {
    fetch("/api/atlas?area=ARTES&limit=20")
      .then((r) => r.json() as Promise<ArtItem[]>)
      .then(setItems)
      .catch(() => {})
  }, [])

  return (
    <div className="border border-solar-border/30 bg-solar-border/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-solar-border/20 bg-solar-void">
        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70">Acervo de Artes</p>
        <div className="flex items-center gap-0">
          {(["galeria", "carrossel", "mosaico"] as BoardView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-[7px] font-mono uppercase tracking-widest transition-solar border-b-2 ${view === v ? "border-solar-amber text-solar-amber" : "border-transparent text-solar-muted/40 hover:text-solar-muted"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-solar-void">
        {view === "galeria"   && <BoardGaleria   items={items} />}
        {view === "carrossel" && <BoardCarrossel  items={items} />}
        {view === "mosaico"   && <BoardMosaico    items={items} />}
      </div>
    </div>
  )
}

// ── Painel RSS ────────────────────────────────────────────────────────────────

type RSSItem = { id: string; title: string; url: string; pubDate: string | null; feedLabel: string | null }

function RSSPanel() {
  const [items, setItems] = useState<RSSItem[]>([])

  useEffect(() => {
    fetch("/api/rss?mode=items&limit=8")
      .then((r) => r.json() as Promise<RSSItem[]>)
      .then(setItems)
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <div className="border border-solar-border/30 bg-solar-border/10">
      <div className="flex items-center justify-between px-6 py-3 border-b border-solar-border/20 bg-solar-void">
        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70">Notícias & Feeds</p>
        <Link href="/settings#rss" className="text-[7px] font-mono text-solar-muted/30 hover:text-solar-amber transition-solar uppercase tracking-widest">
          Gerenciar →
        </Link>
      </div>
      <div className="bg-solar-void">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 px-6 py-3 border-b border-solar-border/10 last:border-0 hover:bg-solar-surface/20 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-solar-text/80 leading-snug group-hover:text-solar-amber transition-solar line-clamp-1">
                {item.title}
              </p>
              {item.feedLabel && (
                <p className="text-[7px] font-mono text-solar-muted/35 uppercase tracking-widest mt-0.5">
                  {item.feedLabel}
                </p>
              )}
            </div>
            <span className="text-[8px] font-mono text-solar-muted/25 flex-shrink-0 pt-0.5">↗</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Seção: Hub — Pitch & Manifesto ────────────────────────────────────────────

const HUB_PILARES = [
  {
    symbol: "◎",
    nome: "Atlas",
    subtitulo: "O Catálogo da Humanidade",
    desc: "Um banco de conhecimento enciclopédico onde você registra tudo que estuda: obras de arte, filósofos, descobertas científicas, lugares, pessoas, movimentos históricos. Cada entrada tem tipo, área, tags, conteúdo rico e relações com outros itens. É a sua Enciclopédia Pessoal, viva e navegável.",
    href: "/atlas",
  },
  {
    symbol: "◈",
    nome: "Compass",
    subtitulo: "O Interior em Movimento",
    desc: "Seu diário intelectual e emocional. Escreva entradas diárias, defina metas de estudo, acompanhe sessões de foco e trace o mapa da sua mente ao longo do tempo. O Compass é onde o conhecimento externo encontra sua jornada interna.",
    href: "/compass/diario",
  },
  {
    symbol: "⊕",
    nome: "Cultura",
    subtitulo: "A Rede dos Estudiosos",
    desc: "Uma rede social minimalista para perfis de pessoas notáveis — professores, artistas, filósofos, cientistas — e os registros que os conectam. Eventos culturais, homenagens, citações e descobertas compartilhadas vivem aqui.",
    href: "/portal/cultura",
  },
  {
    symbol: "⬡",
    nome: "Vilas",
    subtitulo: "Comunidades de Saber",
    desc: "Espaços temáticos onde o conhecimento se organiza em comunidades: cada Vila é um universo com sua própria curadoria, estética e conjunto de membros. Uma Filosofia, uma Música, uma Matemática — cada qual com seu território.",
    href: "/portal/vilas",
  },
]

const HUB_MODULOS = [
  { n: "01", nome: "Atlas Editor",       desc: "Editor rico BlockNote com suporte a texto, imagens, listas, callouts e conteúdo estruturado." },
  { n: "02", nome: "Atlas Relations",    desc: "Grafos de relação entre itens — conecte obras a autores, descobertas a contextos históricos." },
  { n: "03", nome: "Compass Diário",     desc: "Entradas diárias com calendário, humor e reflexões livres." },
  { n: "04", nome: "Compass Metas",      desc: "Sistema de objetivos com progresso rastreado e sessões de estudo cronometradas." },
  { n: "05", nome: "Escola Solar",       desc: "Ambiente 3D (React Three Fiber) para cursos de artes visuais e design." },
  { n: "06", nome: "Cultura & Perfis",   desc: "Páginas de perfil de pessoas com obras relacionadas, conexões e presença no radar." },
  { n: "07", nome: "WorldBoard",         desc: "Mural de avisos, eventos, citações e descobertas do mundo da cultura." },
  { n: "08", nome: "RSS & Notícias",     desc: "Agregador de feeds para manter o fluxo de informação curado no painel." },
  { n: "09", nome: "Vilas",             desc: "Comunidades temáticas com curadoria independente por área do saber." },
  { n: "10", nome: "Consciência",        desc: "Questionário filosófico para auto-mapeamento intelectual e existencial." },
  { n: "11", nome: "IA no Editor",       desc: "Gemini e Replicate para gerar descrições, sugerir tags e criar capas automaticamente." },
  { n: "12", nome: "Sistema de Temas",   desc: "32 temas visuais com CSS custom properties — do escuro cosmos ao papel amarelo." },
]

function SecaoHub() {
  return (
    <div className="border border-solar-border/30 bg-solar-void">

      {/* Header — Pitch principal */}
      <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-6 sm:pb-8 border-b border-solar-border/20">
        <p className="text-[8px] font-mono uppercase tracking-[0.28em] text-solar-amber/50 mb-5">
          ✦ Hub — O que é o Portal Solar
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 sm:gap-8 items-start">
          <div>
            <h2 className="font-display text-fluid-4xl text-solar-text font-semibold leading-tight mb-5 max-w-2xl">
              Um sistema vivo de conhecimento para quem leva a sério o estudo da humanidade.
            </h2>
            <p className="text-[12px] font-body text-solar-muted/65 leading-[1.8] max-w-2xl mb-4">
              O <strong className="text-solar-text/80 font-semibold">Portal Solar</strong> é um ecossistema de gestão do conhecimento pessoal — local-first,
              sem nuvem obrigatória, construído para estudantes, pesquisadores, artistas e curiosos que acreditam
              que o conhecimento acumulado ao longo de uma vida merece uma casa digna.
            </p>
            <p className="text-[12px] font-body text-solar-muted/55 leading-[1.8] max-w-2xl">
              Não é um app de notas. Não é uma rede social. Não é uma enciclopédia pronta.
              É o cruzamento dos três — onde <em>você</em> é o curador, o arquivista e o explorador
              do seu próprio universo intelectual.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center gap-3 pt-2">
            <div className="w-20 h-20 border border-solar-amber/20 rounded-full flex items-center justify-center">
              <span className="font-mono text-solar-amber/40 text-4xl leading-none">☀</span>
            </div>
            <p className="text-[8px] font-mono text-solar-muted/30 uppercase tracking-widest text-center">
              Portal Solar<br/>v1.0 · Local-first
            </p>
          </div>
        </div>
      </div>

      {/* O problema que resolve */}
      <div className="px-4 sm:px-8 py-6 sm:py-7 border-b border-solar-border/20 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {[
          {
            titulo: "O problema",
            corpo: "O conhecimento que você acumula está espalhado: favoritos perdidos no browser, anotações em apps diferentes, livros sem indexação, conexões invisíveis entre ideias que nunca se encontram. A memória humana não foi feita para guardar tudo — precisa de um sistema.",
          },
          {
            titulo: "A proposta",
            corpo: "Um único lugar onde tudo o que você estuda ganha forma: nome, tipo, área, conteúdo, relações, status. Obras conectadas a autores. Autores a movimentos. Movimentos a épocas. Um grafo de conhecimento que cresce com você — e que você pode navegar, buscar e revisitar.",
          },
          {
            titulo: "A filosofia",
            corpo: "Construído como uma catedral, uma pedra de cada vez. Não existe versão final — existe a versão de hoje. O Portal Solar cresce junto com quem o usa, módulo por módulo, entrada por entrada, descoberta por descoberta. É a sua obra intelectual em andamento.",
          },
        ].map(({ titulo, corpo }) => (
          <div key={titulo}>
            <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-amber/45 mb-3">{titulo}</p>
            <p className="text-[11px] font-body text-solar-muted/60 leading-[1.75]">{corpo}</p>
          </div>
        ))}
      </div>

      {/* Os 4 Pilares */}
      <div className="px-4 sm:px-8 py-6 sm:py-7 border-b border-solar-border/20">
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/50 mb-6">
          Os 4 Pilares
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HUB_PILARES.map(({ symbol, nome, subtitulo, desc, href }) => (
            <a
              key={nome}
              href={href}
              className="group border border-solar-border/20 hover:border-solar-amber/25 p-5 transition-solar block"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="font-mono text-solar-amber/50 text-xl leading-none group-hover:text-solar-amber/70 transition-solar mt-0.5">
                  {symbol}
                </span>
                <div>
                  <p className="font-mono text-[13px] text-solar-text/85 font-medium">{nome}</p>
                  <p className="text-[9px] font-mono text-solar-muted/45 uppercase tracking-widest mt-0.5">{subtitulo}</p>
                </div>
              </div>
              <p className="text-[11px] font-body text-solar-muted/55 leading-[1.7] pl-7">
                {desc}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Como funciona */}
      <div className="px-4 sm:px-8 py-6 sm:py-7 border-b border-solar-border/20">
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/50 mb-6">
          Como Funciona
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-solar-border/15 divide-y md:divide-y-0 md:divide-x divide-solar-border/15">
          {[
            {
              passo: "01",
              titulo: "Você registra",
              desc: "Cria entradas no Atlas para tudo que estuda: uma pintura, um filósofo, uma teoria científica, um lugar que quer conhecer. Cada item tem título, tipo, área, conteúdo rico e tags.",
            },
            {
              passo: "02",
              titulo: "Você conecta",
              desc: "Liga itens entre si através de relações. Leonardo conectado à Renascença. A Renascença ao Humanismo. O Humanismo a Erasmo. Um grafo de ideias que espelha como o conhecimento realmente funciona.",
            },
            {
              passo: "03",
              titulo: "Você navega",
              desc: "Explora o que você construiu — filtrando por área, buscando por texto, revisitando recentes, descobrindo conexões esquecidas. O painel inicial reúne tudo numa visão integrada do seu universo.",
            },
          ].map(({ passo, titulo, desc }) => (
            <div key={passo} className="px-4 sm:px-6 py-5 sm:py-6">
              <p className="text-[8px] font-mono text-solar-amber/30 mb-3 tracking-[0.2em]">PASSO {passo}</p>
              <p className="text-[11px] font-mono text-solar-text/75 mb-2 font-medium">{titulo}</p>
              <p className="text-[10px] font-body text-solar-muted/50 leading-[1.7]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Módulos implementados */}
      <div className="px-4 sm:px-8 py-6 sm:py-7 border-b border-solar-border/20">
        <div className="flex items-baseline justify-between mb-6">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/50">
            Módulos Implementados
          </p>
          <span className="text-[9px] font-mono text-solar-amber/40">{HUB_MODULOS.length} módulos ativos</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-solar-border/15 divide-y divide-solar-border/10">
          {HUB_MODULOS.map(({ n, nome, desc }) => (
            <div key={n} className="flex gap-4 px-5 py-3 odd:border-r odd:border-solar-border/10">
              <span className="text-[9px] font-mono text-solar-amber/25 tabular-nums pt-0.5 flex-shrink-0">{n}</span>
              <div>
                <p className="text-[10px] font-mono text-solar-text/70">{nome}</p>
                <p className="text-[9px] font-body text-solar-muted/45 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planos de operação */}
      <div className="px-4 sm:px-8 py-6 sm:py-7 border-b border-solar-border/20">
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/50 mb-6">Planos de Operação</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              plano: "Local · Solo",
              status: "Ativo",
              cor: "text-solar-amber/60",
              desc: "O modo padrão e a essência do projeto. Roda inteiramente no seu computador, sem contas, sem sync obrigatório, sem telemetria. Seus dados ficam em SQLite local. É o seu sistema, sob seu controle total.",
              itens: ["SQLite local via Prisma", "Sem autenticação", "Sem serviços externos obrigatórios", "Dados exportáveis a qualquer momento"],
            },
            {
              plano: "Rede · Colaborativo",
              status: "Roadmap",
              cor: "text-solar-muted/35",
              desc: "A próxima fase: compartilhar curadoria com outros estudantes, colaborar em Vilas temáticas e contribuir para acervos coletivos mantendo a base local-first como fundação.",
              itens: ["Sync opcional peer-to-peer", "Vilas colaborativas", "Contribuições ao WorldBoard", "Identidade federada"],
            },
            {
              plano: "Institucional · Escola",
              status: "Visão",
              cor: "text-solar-muted/25",
              desc: "Portal Solar como infraestrutura para escolas e institutos: turmas com curadores, acervos institucionais, aulas na Escola Solar 3D e painéis de acompanhamento pedagógico.",
              itens: ["Turmas e curadoria educacional", "Escola Solar como plataforma de cursos", "Relatórios pedagógicos", "White-label e customização"],
            },
          ].map(({ plano, status, cor, desc, itens }) => (
            <div key={plano} className="border border-solar-border/20 p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[11px] font-mono text-solar-text/75 font-medium">{plano}</p>
                <span className={`text-[8px] font-mono uppercase tracking-widest ${cor} border border-current/20 px-2 py-0.5 flex-shrink-0`}>
                  {status}
                </span>
              </div>
              <p className="text-[10px] font-body text-solar-muted/50 leading-[1.7] mb-4">{desc}</p>
              <ul className="space-y-1">
                {itens.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-solar-amber/30 font-mono text-[8px] pt-0.5">—</span>
                    <span className="text-[9px] font-mono text-solar-muted/40 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé — Manifesto */}
      <div className="px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-solar-amber/30 mb-5">Manifesto</p>
          <blockquote className="text-[13px] font-body text-solar-muted/55 leading-[1.9] italic mb-6">
            "Acreditamos que o conhecimento humano — a arte, a filosofia, a ciência, a história —
            merece ser vivenciado com a mesma seriedade com que foi produzido.
            O Portal Solar não é uma ferramenta de produtividade.
            É uma prática intelectual. Uma disciplina de atenção.
            Um arquivo vivo de tudo que você decidiu que vale a pena lembrar."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-solar-border/20" />
            <span className="font-mono text-solar-amber/25 text-xs">☀ Portal Solar</span>
            <div className="h-px flex-1 bg-solar-border/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Seção: Plataforma ─────────────────────────────────────────────────────────

function SecaoPlataforma() {
  return (
    <div className="border border-solar-border/30 bg-solar-void">
      <div className="px-4 sm:px-8 py-6 sm:py-8 border-b border-solar-border/20 flex items-start justify-between gap-6 sm:gap-12">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/60 mb-4">Sobre a Plataforma</p>
          <h2 className="font-display text-fluid-3xl text-solar-text font-semibold leading-tight mb-4">
            Portal Solar — um sistema vivo de conhecimento
          </h2>
          <p className="text-[11px] font-body text-solar-muted/65 leading-relaxed max-w-xl">
            O Portal Solar é um ecossistema de gestão de conhecimento pessoal — local-first, sem nuvem obrigatória,
            construído para quem leva a sério o estudo da humanidade. Atlas, Compass, Cultura e Vilas formam
            um sistema integrado onde cada ideia, obra, pessoa e descoberta tem seu lugar.
          </p>
        </div>
        <div className="flex-shrink-0 hidden md:block">
          <div className="w-24 h-24 border border-solar-amber/20 rounded-full flex items-center justify-center">
            <span className="font-mono text-solar-amber/40 text-3xl">☀</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-solar-border/15">
        {[
          { label: "Atlas",    desc: "Catálogo enciclopédico de tudo que você estuda",  symbol: "◎" },
          { label: "Compass",  desc: "Diário interior, metas e mapa pessoal",           symbol: "◈" },
          { label: "Cultura",  desc: "Rede social minimalista de estudantes",           symbol: "⊕" },
        ].map(({ label, desc, symbol }) => (
          <div key={label} className="px-4 sm:px-6 py-4 sm:py-5">
            <p className="text-[10px] font-mono text-solar-amber/50 mb-1">{symbol} {label}</p>
            <p className="text-[9px] font-mono text-solar-muted/45 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Seção: Consciência ────────────────────────────────────────────────────────

type ConscienciaAnswer = Record<string, string>

const QUESTOES = [
  {
    id:       "estudos",
    tema:     "Estudos",
    pergunta: "Qual área do conhecimento mais te atrai agora?",
    opcoes:   ["Filosofia & Ética", "Ciências Naturais", "Artes & Música", "História & Civilizações", "Matemática & Lógica", "Literatura", "Tecnologia", "Outro"],
  },
  {
    id:       "politica",
    tema:     "Visão de Mundo",
    pergunta: "Como você entende a relação entre indivíduo e sociedade?",
    opcoes:   ["O indivíduo é soberano", "A sociedade molda o indivíduo", "Relação dialética e dinâmica", "Ainda construindo essa visão"],
  },
  {
    id:       "aprendizado",
    tema:     "Aprendizado",
    pergunta: "Como você aprende melhor?",
    opcoes:   ["Leitura profunda", "Escuta e audiovisual", "Prática e experimento", "Diálogo e debate", "Escrita e síntese"],
  },
  {
    id:       "proposito",
    tema:     "Propósito",
    pergunta: "O que move seu estudo?",
    opcoes:   ["Curiosidade pura", "Transformar a realidade", "Criar algo novo", "Entender a mim mesmo", "Contribuir com a humanidade"],
  },
]

function SecaoConsciencia() {
  const [answers, setAnswers] = useState<ConscienciaAnswer>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const done = Object.keys(answers).length === QUESTOES.length

  return (
    <div className="border border-solar-border/30 bg-solar-void">
      <div className="px-4 sm:px-8 py-5 sm:py-6 border-b border-solar-border/20">
        <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/60 mb-2">Consciência</p>
        <p className="text-[11px] font-mono text-solar-muted/45 leading-relaxed">
          Algumas perguntas para nos sintonizarmos — seus estudos, suas visões, sua trajetória.
        </p>
      </div>

      {submitted ? (
        <div className="px-8 py-12 flex flex-col items-center gap-4">
          <span className="text-solar-amber/40 text-4xl font-mono">◎</span>
          <p className="text-[11px] font-mono text-solar-muted/55 text-center">
            Respostas registradas. Obrigado por compartilhar.
          </p>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false) }}
            className="text-[9px] font-mono text-solar-muted/35 hover:text-solar-amber transition-solar uppercase tracking-widest"
          >
            Responder novamente
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-solar-border/15">
            {QUESTOES.map((q) => (
              <div key={q.id} className="px-4 sm:px-8 py-5 sm:py-6">
                <p className="text-[8px] font-mono uppercase tracking-widest text-solar-amber/40 mb-1">{q.tema}</p>
                <p className="text-[11px] font-mono text-solar-text/75 mb-4">{q.pergunta}</p>
                <div className="flex flex-wrap gap-2">
                  {q.opcoes.map((opcao) => (
                    <button
                      key={opcao}
                      onClick={() => handleSelect(q.id, opcao)}
                      className={`
                        px-3 py-1.5 text-[9px] font-mono border transition-all
                        ${answers[q.id] === opcao
                          ? "border-solar-amber/60 bg-solar-amber/10 text-solar-amber"
                          : "border-solar-border/30 text-solar-muted/50 hover:border-solar-amber/30 hover:text-solar-muted"}
                      `}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 sm:px-8 py-4 border-t border-solar-border/15 flex items-center justify-between">
            <p className="text-[9px] font-mono text-solar-muted/30">
              {Object.keys(answers).length} / {QUESTOES.length} respondidas
            </p>
            <button
              onClick={() => done && setSubmitted(true)}
              disabled={!done}
              className="px-5 py-2 text-[9px] font-mono uppercase tracking-widest border transition-all disabled:opacity-25 disabled:cursor-not-allowed border-solar-amber/40 text-solar-amber hover:bg-solar-amber/10"
            >
              Registrar →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

type Props = {
  recentItems:   AtlasItemWithTags[]
  discoveryItem: AtlasItemWithTags | null
  areaCounts:    Record<string, number>
  totalItems:    number
  today:         string
  notices:       WorldNotice[]
}

export function DashboardClient({ recentItems, discoveryItem, areaCounts, totalItems, today, notices }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { homeSections, userName } = useSolarStore()

  const vis = (id: HomeSectionId) => homeSections.find((s) => s.id === id)?.visible ?? true

  useGSAP(() => {
    const ctx = gsap.context(() => {
      try {
        // Immediate on mount
        gsap.from("[data-gsap='greeting']", {
          opacity: 0, y: 14, duration: 0.6, delay: 0.15, ease: "power3.out",
        })
        gsap.from("[data-gsap='card']", {
          opacity: 0, x: -14, duration: 0.4, stagger: 0.09, delay: 0.3, ease: "power2.out",
        })

        // Scroll-triggered reveals — gsap.from (não fromTo) para não esconder elementos por padrão
        const scrollReveal = (selector: string) => {
          if (!document.querySelector(selector)) return
          gsap.from(selector, {
            opacity: 0, y: 16, duration: 0.5, ease: "power2.out",
            scrollTrigger: { trigger: selector, start: "top 95%", once: true },
          })
        }

        scrollReveal("[data-gsap='escola']")
        scrollReveal("[data-gsap='hub']")
        scrollReveal("[data-gsap='artes']")
        scrollReveal("[data-gsap='plataforma']")
        scrollReveal("[data-gsap='consciencia']")
        scrollReveal("[data-gsap='recentes']")
        scrollReveal("[data-gsap='rss']")
        scrollReveal("[data-gsap='stats']")
        scrollReveal("[data-gsap='worldboard']")
      } catch (e) {
        console.warn("GSAP animation error:", e)
      }
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const maxCount = Math.max(...Object.values(areaCounts), 1)

  // Render sections in the order defined in homeSections
  const sectionMap: Record<HomeSectionId, React.ReactNode> = {
    monument: null, // rendered in app/page.tsx as hero

    saudacao: vis("saudacao") ? (
      <div key="saudacao" data-gsap="greeting" className="pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 gap-y-1 mb-1">
            <h1 className="font-display text-fluid-3xl leading-none text-solar-text font-semibold tracking-tight">
              {getGreeting()}, {userName}.
            </h1>
            <span className="font-display text-fluid-3xl text-solar-amber/60 leading-none font-semibold tracking-tight">
              Bem-vindo ao Portal Solar.
            </span>
          </div>
          <p className="text-[8px] font-mono text-solar-muted/30 mt-3 capitalize tracking-wide">{today}</p>
        </div>
        <div className="hidden sm:block flex-shrink-0 text-right max-w-[320px] lg:max-w-[372px]">
          <p className="text-[11px] font-mono text-solar-muted/45 leading-relaxed italic">
            O conhecimento que você acumula hoje é o mapa que vai guiar quem você se tornará amanhã.
          </p>
          <p className="font-mono text-solar-muted/25 text-xs tabular-nums mt-2"><LiveClock /></p>
        </div>
      </div>
    ) : null,

    escola: vis("escola") ? <div key="escola" data-gsap="escola"><EscolaMuseu /></div> : null,

    hub: vis("hub") ? <div key="hub" data-gsap="hub"><SecaoHub /></div> : null,

    plataforma: vis("plataforma") ? <div key="plataforma" data-gsap="plataforma"><SecaoPlataforma /></div> : null,

    consciencia: vis("consciencia") ? <div key="consciencia" data-gsap="consciencia"><SecaoConsciencia /></div> : null,

    artes: vis("artes") ? <div key="artes" data-gsap="artes"><BoardArtes /></div> : null,

    recentes: vis("recentes") ? (
      <div key="recentes" data-gsap="recentes" className="grid grid-cols-1 sm:grid-cols-3 border border-solar-border/30 bg-solar-border/10">
        <div className="sm:col-span-2 bg-solar-void p-4 sm:p-8 border-b sm:border-b-0 sm:border-r border-solar-border/20">
          <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70 mb-5">
            Continuar de onde parou
          </p>
          {recentItems.length === 0 ? (
            <div className="flex items-center justify-center h-32 border border-dashed border-solar-border/30">
              <Link href="/atlas/novo" className="text-[10px] font-mono text-solar-muted/60 hover:text-solar-amber transition-solar tracking-widest uppercase">
                Criar primeiro item →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col border border-solar-border/20">
              {recentItems.map((item) => (
                <div key={item.id} data-gsap="card" className="border-b border-solar-border/20 last:border-b-0">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
        {discoveryItem ? (
          <DiscoveryCard item={discoveryItem} />
        ) : (
          <div className="bg-solar-void p-4 sm:p-8">
            <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70 mb-5">Descoberta do Dia</p>
            <p className="text-[10px] font-mono text-solar-muted/35">Adicione itens ao Atlas para ver uma descoberta diária.</p>
          </div>
        )}
      </div>
    ) : null,

    rss: vis("rss") ? <div key="rss" data-gsap="rss"><RSSPanel /></div> : null,

    stats: vis("stats") ? (
      <div key="stats" data-gsap="stats" className="grid grid-cols-1 sm:grid-cols-3 border border-solar-border/30 bg-solar-border/10">
        <div className="sm:col-span-2 bg-solar-void p-4 sm:p-8 border-b sm:border-b-0 sm:border-r border-solar-border/20">
          <div className="flex items-baseline justify-between mb-5">
            <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70">Atlas · Por área</p>
            <span className="font-display text-solar-amber text-xl leading-none">{totalItems}</span>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(areaCounts)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, count]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-solar-text/70">{AREA_LABELS[key] ?? key}</span>
                    <span className="text-[9px] font-mono text-solar-muted/55">{count}</span>
                  </div>
                  <div className="h-px bg-solar-border/30 relative">
                    <div className="absolute left-0 top-0 h-full bg-solar-amber/50 transition-all duration-700" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-solar-void p-4 sm:p-8">
          <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-solar-muted/70 mb-5">Acesso rápido</p>
          <nav className="space-y-2">
            {[
              { href: "/atlas",          label: "Atlas completo" },
              { href: "/portal/vilas",   label: "Vilas" },
              { href: "/portal/cultura", label: "Cultura" },
              { href: "/compass/diario", label: "Diário de hoje" },
              { href: "/compass/notas",  label: "Notas rápidas" },
              { href: "/world",          label: "Quadro Mundial" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="block text-[11px] font-mono text-solar-muted/65 hover:text-solar-amber transition-solar py-0.5">
                → {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    ) : null,

    worldboard: vis("worldboard") ? (
      <div key="worldboard" data-gsap="worldboard">
        <WorldBoard notices={notices} />
      </div>
    ) : null,
  }

  return (
    <div ref={containerRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-6 space-y-px">
      {homeSections.map((s) => sectionMap[s.id])}
    </div>
  )
}
