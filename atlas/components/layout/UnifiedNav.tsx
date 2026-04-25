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
export const NAV_PAD             = 64
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
  { label: "Cultura",  href: "/portal/cultura", desc: "Portal editorial e cultural" },
  { label: "Social",   href: "/social",          desc: "Rede de conexões"            },
  { label: "Vilas",    href: "/portal/vilas",    desc: "Comunidades temáticas"       },
  { label: "Mundo",    href: "/world",            desc: "Exploração mundial"          },
  { label: "Display",  href: "/display",          desc: "Curadoria visual"            },
]

const COL_ATLAS: NavLink[] = [
  { label: "Acervo",    href: "/",            desc: "Todo o conhecimento"   },
  { label: "Hub",       href: "/hub",          desc: "Centro de recursos"    },
  { label: "Grafo",     href: "/atlas/grafo",  desc: "Mapa de relações"      },
  { label: "Novo item", href: "/atlas/novo",   desc: "Adicionar ao acervo"  },
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

            {/* Quadro */}
            <Link
              href="/compass/quadro"
              className="flex-1 flex items-center justify-center transition-colors duration-150"
              style={{
                borderRight:     `1px solid ${DIV_CLR}`,
                color:           isOn("/compass/quadro", pathname) ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.65)",
                backgroundColor: isOn("/compass/quadro", pathname) ? "rgb(var(--c-text))" : "transparent",
              }}
            >
              <span className="font-mono uppercase tracking-[0.22em]" style={{ fontSize: "7px" }}>Quadro</span>
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

                    {/* Ações rápidas */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.28, duration: 0.22 } }}
                      className="flex items-center gap-3 mt-6"
                    >
                      {[
                        { icon: <Search size={12} strokeWidth={1.5} />, label: "Buscar", fn: () => { triggerSearch(); setOpen(false) } },
                        { icon: <Plus   size={12} strokeWidth={1.5} />, label: "Novo",   fn: () => { openQuickCapture("nota"); setOpen(false) } },
                      ].map(({ icon, label, fn }) => (
                        <button
                          key={label}
                          onClick={fn}
                          aria-label={label}
                          className="flex items-center gap-1.5 hover:opacity-60 transition-opacity"
                          style={{
                            height: "26px", padding: "0 10px",
                            border: `1px solid ${DIV_CLR}`,
                            color: "rgb(var(--c-text) / 0.7)",
                          }}
                        >
                          {icon}
                          <span className="font-mono text-[7px] uppercase tracking-[0.2em]">{label}</span>
                        </button>
                      ))}
                    </motion.div>
                  </div>

                  {/* COL 3 — Academia + Modo */}
                  <div className="flex flex-col pt-6 pb-6 px-6 gap-6">
                    <div>
                      <ColHead n="03" label="Academia" delay={0.16} />
                      <NavCol links={COL_ACADEMIA} pathname={pathname} colDelay={0.19} onClose={() => setOpen(false)} />
                    </div>

                    <div>
                      <ColHead n="04" label="Modo" delay={0.24} />
                      <div className="flex flex-col gap-1">
                        {MODES.map((m, i) => (
                          <div key={m.id} style={{ overflow: "hidden" }}>
                            <Reveal delay={0.27 + i * 0.04}>
                              <button
                                onClick={() => { setMode(m.id); setOpen(false) }}
                                className="flex flex-col gap-0.5 py-2 w-full text-left"
                                style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}
                              >
                                <span className="font-display leading-tight" style={{ fontSize: "1.0rem", color: mode === m.id ? "rgb(var(--c-accent))" : "rgb(var(--c-text) / 0.8)", fontWeight: mode === m.id ? 600 : 400 }}>
                                  {m.label}
                                </span>
                                <span className="font-mono uppercase tracking-widest" style={{ fontSize: "6.5px", color: "rgb(var(--c-muted) / 0.75)" }}>
                                  {m.desc}
                                </span>
                              </button>
                            </Reveal>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Strip inferior — sistema ────────────────────────── */}
              <div
                className="flex-shrink-0 flex items-center justify-between px-7 py-3"
                style={{ borderTop: `1px solid ${DIV_CLR}` }}
              >
                <div className="flex items-center gap-4">
                  <Link href="/atlas/novo" onClick={() => setOpen(false)} className="font-mono text-[7.5px] uppercase tracking-[0.18em] hover:opacity-60 transition-opacity" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
                    + Atlas
                  </Link>
                  {[{ label: "Config", href: "/settings" }, { label: "Sobre", href: "/sobre" }].map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-mono text-[7.5px] uppercase tracking-[0.18em] hover:opacity-60 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.75)" }}>
                      {l.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="font-mono text-[7.5px] uppercase tracking-[0.18em] hover:opacity-60 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.75)" }}>
                    Sair
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[7px] uppercase tracking-[0.2em]" style={{ color: "rgb(var(--c-muted) / 0.7)" }}>{currentMode.label}</span>
                  <span style={{ width: 1, height: 10, background: DIV_CLR }} />
                  <LiveClock />
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
