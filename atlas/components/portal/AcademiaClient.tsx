"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import type { AtlasItemWithTags } from "@/atlas/types"

// ── Seções da Academia ────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "boas-vindas",   label: "⊹ Boas-Vindas",       short: "Início"      },
  { id: "manifestos",    label: "▸ Manifestos",         short: "Manifestos"  },
  { id: "problemas",     label: "◈ Problemas",          short: "Problemas"   },
  { id: "herancas",      label: "◉ Heranças & Honra",   short: "Heranças"    },
  { id: "contemplacoes", label: "◌ Contemplações",      short: "Contemp."    },
  { id: "estrutura",     label: "⬡ Estrutura",          short: "Estrutura"   },
  { id: "motor",         label: "// Motor",             short: "Motor"       },
  { id: "grade",         label: "▣ Grade dos Saberes",  short: "Saberes"     },
  { id: "livros",        label: "◫ Livros & Curadoria", short: "Livros"      },
  { id: "trilhas",       label: "◇ Trilhas",            short: "Trilhas"     },
  { id: "studio",        label: "◈ Studio",             short: "Studio"      },
]

// ── Subsecções da Grade dos Saberes ──────────────────────────────────────────

const GRADE_ITEMS = [
  {
    id:       "sobre-o-mundo",
    title:    "Sobre o Mundo",
    subtitle: "Academy Lessons",
    symbol:   "◎",
    desc:     "Aulas sobre a realidade — história, ciências, geopolítica, ecologia e o estado da humanidade hoje.",
    color:    "#C8A45A",
    href:     "/academia/topico/guerras-e-paz",
    links: [
      { label: "Guerras e Paz",        href: "/academia/topico/guerras-e-paz"           },
      { label: "Conflitos Humanos",    href: "/academia/topico/conflitos-humanos"        },
      { label: "Vida Integral",        href: "/academia/topico/vida-integral"            },
      { label: "Sofrimento e Paz",     href: "/academia/topico/sofrimento-e-paz-animal"  },
    ],
  },
  {
    id:       "manifestar",
    title:    "Manifestar",
    subtitle: "Guides of Expression",
    symbol:   "▸",
    desc:     "Guias de expressão — como escrever, criar, registrar e tornar sua voz e visão presentes no mundo.",
    color:    "#9B59B6",
    href:     "/compass/notas",
    links: [
      { label: "Notas & Ideias",  href: "/compass/notas"      },
      { label: "Workspace",       href: "/workspace"           },
      { label: "Blog público",    href: "/blog"                },
      { label: "Diário",          href: "/compass/diario"      },
    ],
  },
  {
    id:       "estudar-basico",
    title:    "Estudar o Básico",
    subtitle: "Foundations of Destiny",
    symbol:   "⬡",
    desc:     "Fundamentos do destino — as bases de conhecimento que todo ser humano deveria dominar para viver plenamente.",
    color:    "#4A90D9",
    href:     "/",
    links: [
      { label: "Tabela Periódica",  href: "/atlas/tabela-periodica" },
      { label: "Eras Históricas",   href: "/?area=HISTORIA"         },
      { label: "Mitologias",        href: "/?area=HISTORIA"         },
      { label: "Atlas do Saber",    href: "/"                       },
    ],
  },
]

// ── Questões (Problemas) ──────────────────────────────────────────────────────

const QUESTIONS = [
  { n: "01", q: "Porque existem guerras — e como elas poderiam acabar?",           slug: "guerras-e-paz",           sub: "Conflito, poder, escassez e a natureza humana."              },
  { n: "02", q: "Porque temos conflitos com outros humanos?",                        slug: "conflitos-humanos",       sub: "Identidade, medo, desejo e a busca por pertencimento."       },
  { n: "03", q: "Como passar os dias de forma integral e plena?",                    slug: "vida-integral",           sub: "Presença, criação e a arte de existir com intenção."         },
  { n: "04", q: "Como reduzir o sofrimento de animais e humanos na Terra?",          slug: "sofrimento-e-paz-animal", sub: "Empatia inter-espécies, sistemas alimentares e ações de paz."},
]

// ── Helper ────────────────────────────────────────────────────────────────────

function parseMetadata(raw?: string | null): Record<string, unknown> {
  try { return JSON.parse(raw ?? "{}") } catch { return {} }
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AcademiaClient({
  books,
  paths = [],
}: {
  books: AtlasItemWithTags[]
  paths?: AtlasItemWithTags[]
}) {
  const [activeSection, setActiveSection] = useState("boas-vindas")
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())
  const navRef = useRef<HTMLDivElement>(null)
  const isScrollingTo = useRef(false)

  // IntersectionObserver — atualiza seção ativa ao rolar
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    NAV_SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current.get(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry?.isIntersecting && !isScrollingTo.current) {
            setActiveSection(id)
          }
        },
        { rootMargin: "-40% 0px -55% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  // Scroll suave para seção + destaque no nav
  const scrollTo = useCallback((id: string) => {
    const el = sectionRefs.current.get(id)
    if (!el) return
    isScrollingTo.current = true
    setActiveSection(id)
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setTimeout(() => { isScrollingTo.current = false }, 800)

    // Centraliza o item ativo no nav horizontal
    const navEl = navRef.current
    if (navEl) {
      const btn = navEl.querySelector(`[data-nav="${id}"]`) as HTMLElement | null
      if (btn) {
        const left = btn.offsetLeft - navEl.offsetWidth / 2 + btn.offsetWidth / 2
        navEl.scrollTo({ left, behavior: "smooth" })
      }
    }
  }, [])

  const setSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el)
  }, [])

  return (
    <div>
      {/* ══ MENU DINÂMICO — sticky ════════════════════════════════════════════ */}
      <div
        ref={navRef}
        className="sticky top-[38px] z-40 flex gap-0 overflow-x-auto scrollbar-hide"
        style={{
          background:   "rgb(var(--c-deep) / 0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgb(var(--c-border) / 0.18)",
        }}
      >
        {NAV_SECTIONS.map(({ id, label, short }) => (
          <button
            key={id}
            data-nav={id}
            onClick={() => scrollTo(id)}
            className="flex-shrink-0 font-mono uppercase tracking-[0.22em] px-4 py-2.5 transition-all duration-150 border-b-2 whitespace-nowrap"
            style={{
              fontSize:    "7px",
              borderBottomColor: activeSection === id
                ? "rgb(var(--c-accent))"
                : "transparent",
              color: activeSection === id
                ? "rgb(var(--c-accent))"
                : "rgb(var(--c-muted) / 0.45)",
              background: activeSection === id
                ? "rgb(var(--c-accent) / 0.04)"
                : "transparent",
            }}
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        ))}
      </div>

      {/* ══ SEÇÃO: BOAS-VINDAS ════════════════════════════════════════════════ */}
      <section
        ref={setSectionRef("boas-vindas")}
        id="boas-vindas"
        className="page-wide py-16"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.35)" }}>
          ⊹ Academia · Boas-Vindas
        </p>
        <h2 className="font-display font-bold leading-none mb-6"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", letterSpacing: "-0.03em", color: "rgb(var(--c-text)/0.92)" }}>
          Boas-Vindas
        </h2>
        <p className="font-mono text-[10px] max-w-xl leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
          A Academia é a seção de aprendizado, contemplação e ensinamentos do Portal Solar.
          Aqui vivem as grandes questões, os manifestos, as obras e as pessoas que moldaram
          o pensamento humano — e as ferramentas para você criar o seu próprio.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "▸ Explorar Manifestos", id: "manifestos"    },
            { label: "◈ Ver Problemas",       id: "problemas"     },
            { label: "▣ Grade dos Saberes",   id: "grade"         },
            { label: "◫ Livros & Curadoria",  id: "livros"        },
          ].map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)}
              className="font-mono text-[7.5px] uppercase tracking-[0.22em] px-3 py-2 border transition-all hover:border-solar-border/50"
              style={{ borderColor: "rgb(var(--c-border)/0.25)", color: "rgb(var(--c-text)/0.55)" }}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ══ SEÇÃO: MANIFESTOS ════════════════════════════════════════════════ */}
      <section
        ref={setSectionRef("manifestos")}
        id="manifestos"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-accent) / 0.5)" }}>
          ▸ Manifestos
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Manifestos
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          Declarações de princípio, visões de mundo e comprometimentos com uma vida mais consciente e intencional.
          Esta seção está sendo construída — em breve os primeiros manifestos.
        </p>

        {/* Placeholder manifesto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          {[
            { title: "Manifesto da Presença",     desc: "Sobre viver com atenção plena e intenção."                  },
            { title: "Manifesto da Criação",      desc: "Sobre o ato de criar como forma de existir."               },
            { title: "Manifesto da Paz",          desc: "Sobre ações concretas para reduzir o sofrimento no mundo."  },
            { title: "Manifesto do Conhecimento", desc: "Sobre estudar como prática de libertação."                  },
          ].map(({ title, desc }) => (
            <div key={title}
              className="p-5 border border-solar-border/20 hover:border-solar-border/40 transition-colors cursor-default">
              <p className="font-display text-[14px] mb-1"
                style={{ color: "rgb(var(--c-text)/0.8)", letterSpacing: "-0.01em" }}>
                {title}
              </p>
              <p className="font-mono text-[8px] leading-relaxed"
                style={{ color: "rgb(var(--c-muted)/0.5)" }}>
                {desc}
              </p>
              <p className="font-mono text-[7px] mt-3 uppercase tracking-widest"
                style={{ color: "rgb(var(--c-muted)/0.25)" }}>
                Em desenvolvimento →
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SEÇÃO: PROBLEMAS ═════════════════════════════════════════════════ */}
      <section
        ref={setSectionRef("problemas")}
        id="problemas"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-accent) / 0.5)" }}>
          ◈ Problemas
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Grandes Questões & Problemas do Mundo
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          As questões fundamentais que desafiam a humanidade — sem respostas fáceis, com espaço para pensar junto.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUESTIONS.map(({ n, q, slug, sub }) => (
            <Link key={n} href={`/academia/topico/${slug}`}
              className="group flex items-start gap-3 p-5 border border-solar-border/15 hover:border-solar-accent/30 hover:bg-solar-surface/15 transition-all">
              <span className="font-mono text-[8px] tabular-nums flex-shrink-0 mt-0.5"
                style={{ color: "rgb(var(--c-accent)/0.35)" }}>{n}</span>
              <div>
                <p className="font-display text-[14px] leading-snug mb-1 group-hover:opacity-90 transition-opacity"
                  style={{ color: "rgb(var(--c-text)/0.8)", letterSpacing: "-0.01em" }}>
                  {q}
                </p>
                <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted)/0.45)" }}>{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ SEÇÃO: HERANÇAS E HONRA ══════════════════════════════════════════ */}
      <section
        ref={setSectionRef("herancas")}
        id="herancas"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          ◉ Heranças & Honra
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Heranças & Honra
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          O que recebemos de quem veio antes — as tradições, conhecimentos, obras e legados que merecem ser preservados,
          honrados e transmitidos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { symbol: "◉", label: "Mestres & Professores",   desc: "Quem ensinou a humanidade"        },
            { symbol: "▣", label: "Obras Fundamentais",      desc: "Criações que resistiram ao tempo"  },
            { symbol: "◈", label: "Tradições Vivas",         desc: "Práticas que atravessam gerações"  },
          ].map(({ symbol, label, desc }) => (
            <div key={label} className="p-5 border border-solar-border/15 hover:border-solar-border/35 transition-colors">
              <span className="text-2xl mb-3 block" style={{ color: "rgb(var(--c-accent)/0.5)" }}>{symbol}</span>
              <p className="font-display text-[14px] mb-1" style={{ color: "rgb(var(--c-text)/0.78)", letterSpacing: "-0.01em" }}>{label}</p>
              <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted)/0.45)" }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link href="/?area=PESSOAS" className="font-mono text-[8px] uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ color: "rgb(var(--c-accent)/0.6)" }}>
            ▸ Ver Pessoas & Autores no Atlas →
          </Link>
        </div>
      </section>

      {/* ══ SEÇÃO: CONTEMPLAÇÕES ═════════════════════════════════════════════ */}
      <section
        ref={setSectionRef("contemplacoes")}
        id="contemplacoes"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          ◌ Contemplações
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Contemplações
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-10"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          Espaço para silêncio, reflexão e presença. Textos, perguntas e práticas para desacelerar e observar.
        </p>

        {/* Citação contemplativa */}
        <blockquote className="max-w-lg border-l-2 border-solar-accent/30 pl-6 py-2 mb-8">
          <p className="font-display text-lg leading-relaxed mb-3"
            style={{ color: "rgb(var(--c-text)/0.7)", letterSpacing: "-0.01em" }}>
            "Conhece-te a ti mesmo."
          </p>
          <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted)/0.4)" }}>
            — Inscrição no Oráculo de Delfos
          </p>
        </blockquote>

        <div className="flex gap-3">
          <Link href="/compass/diario" className="btn btn-ghost btn-sm">◌ Abrir Diário</Link>
          <Link href="/compass/mapa"   className="btn btn-ghost btn-sm">◎ Mapa Interior</Link>
        </div>
      </section>

      {/* ══ SEÇÃO: ESTRUTURA ═════════════════════════════════════════════════ */}
      <section
        ref={setSectionRef("estrutura")}
        id="estrutura"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          ⬡ Sobre a Estrutura
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Como refazer, aprimorar e sustentar
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          Sobre as estruturas do conhecimento, das comunidades e das plataformas — como surgem, como evoluem,
          como são mantidas e como podem ser transformadas. Esta seção vive em desenvolvimento contínuo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
          {[
            { title: "Sistemas de Organização",  desc: "Como estruturar conhecimento de forma durável"   },
            { title: "Comunidades e Redes",      desc: "Como pessoas se reúnem em torno de propósitos"   },
            { title: "Plataformas & Ferramentas",desc: "Como a tecnologia serve (ou não) o aprendizado"  },
            { title: "Sustentabilidade",         desc: "Como manter vivo o que vale a pena preservar"    },
          ].map(({ title, desc }) => (
            <div key={title} className="p-4 border border-solar-border/15 transition-colors">
              <p className="font-display text-[13px] mb-1" style={{ color: "rgb(var(--c-text)/0.75)", letterSpacing: "-0.01em" }}>{title}</p>
              <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted)/0.45)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SEÇÃO: MOTOR DA PLATAFORMA ═══════════════════════════════════════ */}
      <section
        ref={setSectionRef("motor")}
        id="motor"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          // Motor da Plataforma
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Motor da Plataforma
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          O que move o Portal Solar — os princípios técnicos, filosóficos e humanos por trás de cada decisão.
          Como o sistema funciona, o que ele prioriza e para onde caminha.
        </p>

        <div className="flex flex-col gap-3 max-w-xl">
          {[
            { label: "Local-first",         desc: "Seus dados são seus — sempre exportáveis, nunca presos."         },
            { label: "Conhecimento aberto", desc: "A enciclopédia é pública, o pessoal é privado."                  },
            { label: "Espaço de criação",   desc: "Ferramentas para pensar, escrever e organizar — não consumir."   },
            { label: "Comunidade real",     desc: "Conexões através de interesses genuínos, não algoritmos."        },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-4 py-3 border-b border-solar-border/12 last:border-0">
              <span className="font-mono text-[7px] uppercase tracking-widest px-2 py-1 flex-shrink-0 mt-0.5"
                style={{ border: "1px solid rgb(var(--c-accent)/0.25)", color: "rgb(var(--c-accent)/0.7)" }}>
                {label}
              </span>
              <p className="font-mono text-[9px] leading-relaxed" style={{ color: "rgb(var(--c-muted)/0.55)" }}>{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/sobre"    className="btn btn-ghost btn-sm">◈ Sobre o projeto</Link>
          <Link href="/settings?tab=dados" className="btn btn-ghost btn-sm">◫ Seus dados</Link>
        </div>
      </section>

      {/* ══ SEÇÃO PRINCIPAL: GRADE DOS SABERES ═══════════════════════════════ */}
      <section
        ref={setSectionRef("grade")}
        id="grade"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-accent) / 0.55)" }}>
          ▣ Seção Principal
        </p>
        <h2 className="font-display font-bold leading-none mb-2"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.025em", color: "rgb(var(--c-text)/0.92)" }}>
          Grade dos Saberes
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-10"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          Os três caminhos estruturais do aprendizado no Portal Solar.
          Cada caminho é uma porta para um modo diferente de se relacionar com o conhecimento.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GRADE_ITEMS.map((item) => (
            <div key={item.id}
              className="flex flex-col border border-solar-border/20 hover:border-solar-border/40 transition-all group"
              style={{ borderTop: `3px solid ${item.color}40` }}
            >
              {/* Header */}
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl" style={{ color: item.color }}>{item.symbol}</span>
                  <div>
                    <p className="font-display text-lg font-bold leading-none mb-0.5"
                      style={{ color: "rgb(var(--c-text)/0.9)", letterSpacing: "-0.015em" }}>
                      {item.title}
                    </p>
                    <p className="font-mono text-[7px] uppercase tracking-[0.25em]"
                      style={{ color: item.color + "99" }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <p className="font-mono text-[9px] leading-relaxed mb-6"
                  style={{ color: "rgb(var(--c-muted)/0.55)" }}>
                  {item.desc}
                </p>

                {/* Links internos */}
                <div className="flex flex-col gap-1.5">
                  {item.links.map(({ label, href }) => (
                    <Link key={label} href={href}
                      className="flex items-center gap-2 font-mono text-[8px] hover:opacity-80 transition-opacity group/link">
                      <span className="opacity-30 group-hover/link:opacity-60 transition-opacity" style={{ color: item.color }}>→</span>
                      <span style={{ color: "rgb(var(--c-text)/0.6)" }}>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <Link href={item.href}
                className="flex items-center justify-between px-6 py-3 transition-colors hover:opacity-80"
                style={{ borderTop: `1px solid ${item.color}15`, background: `${item.color}06` }}>
                <span className="font-mono text-[7.5px] uppercase tracking-widest"
                  style={{ color: item.color + "bb" }}>
                  Explorar
                </span>
                <span style={{ color: item.color + "80", fontSize: 10 }}>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SEÇÃO: STUDIO ════════════════════════════════════════════════════ */}
      <section
        ref={setSectionRef("studio")}
        id="studio"
        className="page-wide py-14"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          ◈ Studio · Gerenciamento da Plataforma
        </p>
        <h2 className="font-display text-2xl font-bold mb-4"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.88)" }}>
          Studio
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          Centro de gestão e criação — onde conteúdos nascem, são organizados, exportados e mantidos.
          Conecta o Atlas, o Workspace e o blog em um único painel de controle.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mb-8">
          {[
            { symbol: "⬡", label: "Atlas — Acervo",        desc: "Gerencie todos os itens do conhecimento.",  href: "/"           },
            { symbol: "▸", label: "Workspace",             desc: "Escreva páginas, notas e ensaios.",          href: "/workspace"  },
            { symbol: "◎", label: "Blog Público",          desc: "Publique e gerencie seus posts.",            href: "/blog"       },
            { symbol: "◫", label: "Exportação & Backup",   desc: "Faça backup de todos os seus dados.",        href: "/settings"   },
            { symbol: "◉", label: "Atelier de Interfaces", desc: "24 direções visuais para o site.",           href: "/atelier"    },
            { symbol: "→", label: "Seed do Atlas",         desc: "Adicione dados enciclopédicos ao acervo.",   href: "/atlas/seed" },
          ].map(({ symbol, label, desc, href }) => (
            <Link key={label} href={href}
              className="flex items-start gap-3 p-4 border border-solar-border/15 hover:border-solar-border/40 hover:bg-solar-surface/15 transition-all group">
              <span className="text-lg flex-shrink-0 mt-0.5" style={{ color: "rgb(var(--c-accent)/0.5)" }}>{symbol}</span>
              <div>
                <p className="font-display text-[13px] mb-0.5 group-hover:opacity-90 transition-opacity"
                  style={{ color: "rgb(var(--c-text)/0.8)", letterSpacing: "-0.01em" }}>{label}</p>
                <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted)/0.45)" }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ SEÇÃO SECUNDÁRIA: LIVROS & CURADORIA ═════════════════════════════ */}
      <section
        ref={setSectionRef("livros")}
        id="livros"
        className="page-wide py-14"
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          ◫ Seção Secundária · Dialoga com o Atlas
        </p>
        <h2 className="font-display font-bold leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", letterSpacing: "-0.025em", color: "rgb(var(--c-text)/0.88)" }}>
          Livros & Curadoria
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          A biblioteca viva do Portal Solar — livros, referências e assuntos curados diretamente do Atlas.
          Cada item aqui é um portal para um universo de conexões.
        </p>

        {/* Livros do Atlas */}
        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
              {books.slice(0, 8).map((book) => {
                const meta   = parseMetadata(book.metadata)
                const author = meta.author as string | undefined
                const year   = meta.year as number | undefined
                return (
                  <Link key={book.id} href={`/atlas/${book.slug ?? book.id}`}
                    className="group flex flex-col p-4 border border-solar-border/20 hover:border-solar-border/45 hover:bg-solar-surface/15 transition-all">
                    <p className="font-display text-[13px] leading-snug mb-2 group-hover:opacity-90 transition-opacity line-clamp-2"
                      style={{ color: "rgb(var(--c-text)/0.8)", letterSpacing: "-0.01em" }}>
                      {book.title}
                    </p>
                    {author && (
                      <p className="font-mono text-[7.5px] mt-auto" style={{ color: "rgb(var(--c-muted)/0.45)" }}>
                        {author}{year ? ` · ${year}` : ""}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>

            <Link href="/?area=BIBLIOTECA"
              className="font-mono text-[8px] uppercase tracking-widest hover:opacity-70 transition-opacity"
              style={{ color: "rgb(var(--c-accent)/0.6)" }}>
              ▸ Ver toda a Biblioteca no Atlas →
            </Link>
          </>
        ) : (
          <div className="py-12 text-center border border-solar-border/15">
            <p className="font-mono text-[9px] text-solar-muted/35 mb-3">A biblioteca está esperando por livros.</p>
            <Link href="/atlas/seed" className="font-mono text-[8px] uppercase tracking-widest text-solar-accent/50 hover:text-solar-accent transition-colors">
              Executar seed do Atlas →
            </Link>
          </div>
        )}

        {/* Curadoria por assuntos */}
        <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgb(var(--c-border)/0.12)" }}>
          <p className="font-mono text-[7px] uppercase tracking-[0.35em] mb-5"
            style={{ color: "rgb(var(--c-muted)/0.35)" }}>
            // Curadoria & Assuntos
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "◈ Filosofia",    href: "/?area=FILOSOFIA" },
              { label: "⬡ Ciências",     href: "/?area=CIENCIAS"  },
              { label: "▸ História",     href: "/?area=HISTORIA"  },
              { label: "◎ Mitologias",   href: "/?area=HISTORIA"  },
              { label: "◉ Pessoas",      href: "/?area=PESSOAS"   },
              { label: "// Música",      href: "/?area=MUSICA"    },
              { label: "→ Cosmos",       href: "/?area=COSMOS"    },
              { label: "◫ Natureza",     href: "/?area=NATUREZA"  },
            ].map(({ label, href }) => (
              <Link key={label} href={href}
                className="font-mono text-[7.5px] uppercase tracking-widest px-3 py-1.5 border border-solar-border/20 hover:border-solar-border/45 hover:bg-solar-surface/15 transition-all"
                style={{ color: "rgb(var(--c-text)/0.5)" }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SEÇÃO SECUNDÁRIA: TRILHAS ═════════════════════════════════════════ */}
      <section
        ref={setSectionRef("trilhas")}
        id="trilhas"
        className="page-wide py-14"
      >
        <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-4"
          style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
          ◇ Seção Secundária · Sequências curadas pelo conteúdo
        </p>
        <h2 className="font-display font-bold leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", letterSpacing: "-0.025em", color: "rgb(var(--c-text)/0.88)" }}>
          Trilhas
        </h2>
        <p className="font-mono text-[9.5px] max-w-lg leading-relaxed mb-8"
          style={{ color: "rgb(var(--c-muted)/0.55)" }}>
          Passo a passo curados pela Academia — sequências ordenadas de itens que cruzam Mente,
          Manifestação, Fundamentos, Expressão e o Atlas.
        </p>

        {paths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {paths.map((path) => (
              <Link key={path.id} href={`/academia/${path.slug ?? path.id}`}
                className="group flex flex-col p-4 border border-solar-border/20 hover:border-solar-border/45 hover:bg-solar-surface/15 transition-all">
                <p className="font-display text-[13px] leading-snug mb-2 group-hover:opacity-90 transition-opacity"
                  style={{ color: "rgb(var(--c-text)/0.8)", letterSpacing: "-0.01em" }}>
                  {path.title}
                </p>
                <p className="font-mono text-[7.5px] mt-auto" style={{ color: "rgb(var(--c-muted)/0.45)" }}>
                  Ver trilha →
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-solar-border/15">
            <p className="font-mono text-[9px] text-solar-muted/35">Nenhuma trilha curada ainda.</p>
          </div>
        )}
      </section>
    </div>
  )
}
