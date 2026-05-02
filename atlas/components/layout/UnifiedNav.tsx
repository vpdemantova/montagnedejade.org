"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus } from "lucide-react"
import { useSolarStore, type InterfaceMode } from "@/atlas/lib/store"
import { openQuickCapture } from "@/atlas/components/ui/QuickCapture"
import { NAV } from "@/portal.config"

// ── Constants ─────────────────────────────────────────────────────────────────

export const PILL_H              = 38
export const PILL_W              = "min(640px, calc(100vw - 24px))"
export const NAV_PAD             = "var(--page-pad)"
export const DIV_CLR             = "rgb(var(--c-border) / 0.18)"
export const BAR_BG              = "rgb(var(--c-deep) / 0.96)"
export const BAR_BORDER          = `1px solid rgb(var(--c-border) / 0.2)`
export const SECTION_STYLE: React.CSSProperties = {
  border:    "1px solid rgb(var(--c-border) / 0.28)",
  boxShadow: "0 8px 40px rgb(0 0 0 / 0.14), 0 1px 0 rgb(var(--c-void) / 0.5)",
}

// ── Data ──────────────────────────────────────────────────────────────────────

type NavLink = { label: string; href: string; desc?: string }

const MODES: { id: InterfaceMode; label: string; desc: string }[] = [
  { id: "ATLAS",         label: "Atlas",        desc: "Exploração completa" },
  { id: "FOCUS",         label: "Foco",         desc: "Editor limpo"        },
  { id: "CONTEMPLATION", label: "Contemplação", desc: "Leitura imersiva"    },
  { id: "PUBLIC",        label: "Público",      desc: "Vista de visitante"  },
]

const COL_CULTURA: NavLink[] = [
  { label: "Cultura",    href: "/portal/cultura",   desc: "Portal editorial e cultural" },
  { label: "Social",     href: "/social",            desc: "Rede de conexões"            },
  { label: "Eventos",    href: "/social/eventos",    desc: "Encontros presenciais"       },
  { label: "Mensagens",  href: "/social/mensagens",  desc: "DMs e grupos"                },
  { label: "Vilas",      href: "/portal/vilas",      desc: "Comunidades temáticas"       },
  { label: "Mundo",      href: "/world",              desc: "Exploração mundial"          },
  { label: "Display",    href: "/display",            desc: "Curadoria visual"            },
]

const COL_ATLAS: NavLink[] = [
  { label: "Acervo",          href: "/",                          desc: "Todo o conhecimento"      },
  { label: "Hub",             href: "/hub",                       desc: "Centro de recursos"       },
  { label: "Grafo",           href: "/atlas/grafo",               desc: "Mapa de relações"         },
  { label: "Tabela Periódica",href: "/atlas/tabela-periodica",    desc: "118 elementos interativos"},
  { label: "Novo item",       href: "/atlas/novo",                desc: "Adicionar ao acervo"      },
]

const COL_ACADEMIA: NavLink[] = [
  { label: "Academia",  href: "/academia",  desc: "Aprendizado e formação"  },
  { label: "Monumento", href: "/monument",  desc: "Obra tridimensional 3D"  },
]

// ── Active helpers ────────────────────────────────────────────────────────────

function isOn(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function isAtlasActive(pathname: string) {
  return pathname === "/" || pathname.startsWith("/atlas")
}

// ── Shared pill styles ────────────────────────────────────────────────────────

export const PILL_STYLE = {
  height:     `${PILL_H}px`,
  width:      PILL_W,
  background: "rgb(var(--c-deep))",
  border:     "1px solid rgb(var(--c-border) / 0.28)",
  boxShadow:  "0 8px 40px rgb(0 0 0 / 0.14), 0 1px 0 rgb(var(--c-void) / 0.5)",
} as const

// ── NavCell — célula lateral (py curto = tamanho do texto, borda própria) ─────

function NavCell({
  href,
  label,
  pathname,
  atlasRoot = false,
}: {
  href:       string
  label:      string
  pathname:   string
  atlasRoot?: boolean
}) {
  const on = atlasRoot ? isAtlasActive(pathname) : isOn(href, pathname)
  return (
    <Link
      href={href}
      className="h-full flex flex-col items-center justify-center select-none transition-colors duration-150 px-5"
      style={{
        ...SECTION_STYLE,
        backgroundColor: on ? "rgb(var(--c-text))" : "rgb(var(--c-deep))",
        color:           on ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.72)",
      }}
    >
      {NAV.SHOW_NAV_LABELS && (
        <span className="font-mono uppercase tracking-[0.22em] whitespace-nowrap" style={{ fontSize: "8px" }}>
          {label}
        </span>
      )}
    </Link>
  )
}

// ── Overlay helpers ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden" style={{ lineHeight: "1.1" }}>
      <motion.span
        className="block"
        initial={{ y: "108%", opacity: 0.5 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function ColHead({ n, label, delay = 0 }: { n: string; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-2 mb-4 pb-3"
      style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.18)" }}
    >
      <span className="font-mono text-[7px] tabular-nums" style={{ color: "rgb(var(--c-accent) / 0.8)" }}>{n}</span>
      <span className="font-mono text-[8px] uppercase tracking-[0.3em]" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{label}</span>
    </motion.div>
  )
}

function NavCol({ links, pathname, colDelay, onClose }: {
  links: NavLink[]; pathname: string; colDelay: number; onClose: () => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const anyHovered = hovered !== null
  return (
    <nav onMouseLeave={() => setHovered(null)} className="flex flex-col">
      {links.map((l, i) => {
        const on     = isOn(l.href, pathname)
        const dimmed = anyHovered && hovered !== l.href && !on
        return (
          <Reveal key={l.href} delay={colDelay + i * 0.05}>
            <Link
              href={l.href}
              onClick={onClose}
              onMouseEnter={() => setHovered(l.href)}
              className="flex flex-col gap-0.5 py-2 select-none"
              style={{
                borderBottom: "1px solid rgb(var(--c-border) / 0.1)",
                opacity: dimmed ? 0.3 : 1,
                transition: "opacity 0.18s ease",
              }}
            >
              <span
                className="font-display leading-tight"
                style={{
                  fontSize: "1.0rem",
                  letterSpacing: "-0.01em",
                  color: on ? "rgb(var(--c-accent))" : "rgb(var(--c-text) / 0.85)",
                  fontWeight: on ? 600 : 400,
                }}
              >
                {l.label}
              </span>
              {l.desc && (
                <span
                  className="font-mono uppercase tracking-widest"
                  style={{ fontSize: "6.5px", color: "rgb(var(--c-muted) / 0.75)" }}
                >
                  {l.desc}
                </span>
              )}
            </Link>
          </Reveal>
        )
      })}
    </nav>
  )
}


function LiveClock() {
  const [time, setTime] = useState<string>("")
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  if (!time) return null
  return (
    <span className="font-mono text-[7px] tabular-nums tracking-[0.2em]" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>
      {time}
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function UnifiedNav() {
  const pathname = usePathname()
  const { mode, setMode, pushVisited } = useSolarStore()
  const [open, setOpen] = useState(false)

  useEffect(() => { pushVisited(pathname) }, [pathname, pushVisited])
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const triggerSearch = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))
  }, [])

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }, [])

  const currentMode = MODES.find((m) => m.id === mode) ?? MODES[0]!

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          PILL — 3 células: [Cultura] [Centro vertical] [Academia]
          Centro: Display (top) / Atlas (mid) / ≡≡ (bottom)
      ══════════════════════════════════════════════════════ */}
      <header
        role="banner"
        className="fixed top-0 inset-x-0 z-50"
        style={{ height: `${PILL_H}px` }}
      >
        <div className="h-full flex items-stretch" style={{ paddingLeft: NAV_PAD, paddingRight: NAV_PAD }}>

          {/* Esquerda — Cultura: bloco completo */}
          <div style={{ flex: 1 }}>
            <NavCell href="/portal/cultura" label="Cultura" pathname={pathname} />
          </div>

          {/* Centro — Atlas · Quadro · ≡ na horizontal */}
          <div
            className="flex-1 flex flex-row items-stretch overflow-hidden"
            style={{ ...SECTION_STYLE, backgroundColor: "rgb(var(--c-deep))" }}
          >
            {/* Atlas */}
            <Link
              href="/"
              className="flex-1 flex items-center justify-center transition-colors duration-150"
              style={{
                borderRight:     `1px solid ${DIV_CLR}`,
                color:           isAtlasActive(pathname) ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.68)",
                backgroundColor: isAtlasActive(pathname) ? "rgb(var(--c-text))" : "transparent",
              }}
            >
              <span className="font-mono uppercase tracking-[0.22em]" style={{ fontSize: "8px" }}>Atlas</span>
            </Link>

            {/* Display */}
            <Link
              href="/display"
              className="flex-1 flex items-center justify-center transition-colors duration-150"
              style={{
                borderRight:     `1px solid ${DIV_CLR}`,
                color:           isOn("/display", pathname) ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.65)",
                backgroundColor: isOn("/display", pathname) ? "rgb(var(--c-text))" : "transparent",
              }}
            >
              <span className="font-mono uppercase tracking-[0.22em]" style={{ fontSize: "7px" }}>Display</span>
            </Link>

            {/* Menu geral */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fechar menu" : "Menu"}
              aria-expanded={open}
              aria-controls="nav-overlay"
              className="flex-1 flex items-center justify-center transition-colors duration-150"
              style={{
                color:           open ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.65)",
                backgroundColor: open ? "rgb(var(--c-text))" : "transparent",
              }}
            >
              <span className="flex flex-col gap-[5px] w-[14px]">
                <motion.span
                  animate={open ? { rotate: 45, y: 3 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block h-px w-full" style={{ background: "currentColor" }}
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -3 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block h-px w-full" style={{ background: "currentColor" }}
                />
              </span>
            </button>
          </div>

          {/* Direita — Academia: bloco completo */}
          <div style={{ flex: 1 }}>
            <NavCell href="/academia" label="Academia" pathname={pathname} />
          </div>

        </div>
      </header>

      {/* ══════════════════════════════════════════════════════
          CARD — entre o pill superior e o inferior
          Mesma largura dos pills, posicionado no meio da tela
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — clique fora para fechar */}
            <motion.div
              className="fixed inset-0 z-[45]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ background: "rgb(var(--c-void) / 0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
              onClick={() => setOpen(false)}
            />

            {/* Card — mesma largura e alinhamento do nav */}
            <div
              className="fixed z-[46]"
              style={{
                left:   NAV_PAD,
                right:  NAV_PAD,
                top:    `${PILL_H}px`,
                bottom: `${PILL_H}px`,
              }}
            >
            <motion.div
              id="nav-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
              className="flex flex-col overflow-hidden h-full"
              style={{
                background: "rgb(var(--c-deep))",
                border:     "1px solid rgb(var(--c-border) / 0.28)",
                boxShadow:  "0 20px 60px rgb(0 0 0 / 0.18)",
              }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ── Conteúdo scrollável ─────────────────────────────── */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 h-full">

                  {/* COL 1 — Cultura */}
                  <div
                    className="flex flex-col pt-6 pb-6 px-6"
                    style={{ borderRight: `1px solid ${DIV_CLR}` }}
                  >
                    <ColHead n="01" label="Cultura" delay={0.04} />
                    <NavCol links={COL_CULTURA} pathname={pathname} colDelay={0.07} onClose={() => setOpen(false)} />
                  </div>

                  {/* COL 2 — Atlas */}
                  <div
                    className="flex flex-col pt-6 pb-6 px-6"
                    style={{ borderRight: `1px solid ${DIV_CLR}` }}
                  >
                    <ColHead n="02" label="Atlas" delay={0.1} />
                    <NavCol links={COL_ATLAS} pathname={pathname} colDelay={0.13} onClose={() => setOpen(false)} />
                  </div>

                  {/* COL 3 — Academia */}
                  <div className="flex flex-col pt-6 pb-6 px-6">
                    <ColHead n="03" label="Academia" delay={0.16} />
                    <NavCol links={COL_ACADEMIA} pathname={pathname} colDelay={0.19} onClose={() => setOpen(false)} />
                  </div>

                </div>
              </div>

              {/* ── Strip 1 — Ações pessoais (destacado) ─────────────── */}
              <div
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 flex-wrap"
                style={{ borderTop: `1px solid ${DIV_CLR}`, background: "rgb(var(--c-surface) / 0.15)" }}
              >
                {/* Perfil */}
                <Link
                  href="/compass/perfil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 font-mono text-[8px] uppercase tracking-[0.18em] hover:opacity-75 transition-opacity"
                  style={{ border: `1px solid rgb(var(--c-accent) / 0.35)`, color: "rgb(var(--c-accent))" }}
                >
                  Perfil
                </Link>

                {/* Separador */}
                <span style={{ width: 1, height: 18, background: DIV_CLR, flexShrink: 0 }} />

                {/* Links de sistema */}
                {[
                  { label: "Configurações", href: "/settings"   },
                  { label: "Sobre",         href: "/sobre"       },
                  { label: "+ Atlas",       href: "/atlas/novo"  },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2 font-mono text-[8px] uppercase tracking-[0.18em] hover:opacity-75 transition-opacity"
                    style={{ border: `1px solid ${DIV_CLR}`, color: "rgb(var(--c-text) / 0.78)" }}
                  >
                    {l.label}
                  </Link>
                ))}

                {/* Sair */}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 font-mono text-[8px] uppercase tracking-[0.18em] hover:opacity-75 transition-opacity ml-auto"
                  style={{ border: `1px solid ${DIV_CLR}`, color: "rgb(var(--c-muted) / 0.65)" }}
                >
                  Sair
                </button>

                <LiveClock />
              </div>

              {/* ── Strip 2 — Modo de interface ──────────────────────── */}
              <div
                className="flex-shrink-0 flex items-center gap-1 px-6 py-2"
                style={{ borderTop: `1px solid ${DIV_CLR}` }}
              >
                <span className="font-mono text-[7px] uppercase tracking-[0.3em] mr-3 flex-shrink-0" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
                  Modo
                </span>
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setOpen(false) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[7.5px] uppercase tracking-[0.15em] transition-all"
                    style={{
                      border:          `1px solid ${mode === m.id ? "rgb(var(--c-accent) / 0.45)" : DIV_CLR}`,
                      backgroundColor: mode === m.id ? "rgb(var(--c-accent) / 0.08)" : "transparent",
                      color:           mode === m.id ? "rgb(var(--c-accent))" : "rgb(var(--c-text) / 0.65)",
                    }}
                  >
                    {m.label}
                    <span className="hidden sm:inline font-mono text-[6px] uppercase tracking-widest" style={{ color: mode === m.id ? "rgb(var(--c-accent) / 0.6)" : "rgb(var(--c-muted) / 0.4)" }}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
