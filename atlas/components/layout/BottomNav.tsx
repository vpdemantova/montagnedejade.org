"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useSolarStore, type InterfaceMode } from "@/atlas/lib/store"
import { Plus, LogOut } from "lucide-react"

// ── Seções de navegação ───────────────────────────────────────────────────────

type NavSection = "GERAL" | "PORTAL" | "NUMITA"

const NAV_SECTIONS: { id: NavSection; label: string }[] = [
  { id: "GERAL",  label: "Geral"  },
  { id: "PORTAL", label: "Portal" },
  { id: "NUMITA", label: "Numita" },
]

type NavItem = { href: string; label: string }

const GERAL_CORE: NavItem[] = [
  { href: "/",       label: "Hub"    },
  { href: "/atlas",  label: "Atlas"  },
  { href: "/social", label: "Social" },
]
const GERAL_LEFT: NavItem[] = [
  { href: "/world",          label: "World"   },
  { href: "/portal/vilas",   label: "Vilas"   },
  { href: "/portal/cultura", label: "Cultura" },
]
const GERAL_RIGHT: NavItem[] = [
  { href: "/compass/diario",  label: "Diário"  },
  { href: "/compass/notas",   label: "Notas"   },
  { href: "/compass/metas",   label: "Metas"   },
  { href: "/compass/estudos", label: "Estudos" },
]

const PORTAL_ITEMS: NavItem[] = [
  { href: "/",               label: "Hub"     },
  { href: "/world",          label: "World"   },
  { href: "/portal/vilas",   label: "Vilas"   },
  { href: "/portal/cultura", label: "Cultura" },
  { href: "/social",         label: "Social"  },
  { href: "/atlas",          label: "Atlas"   },
]

const NUMITA_ITEMS: NavItem[] = [
  { href: "/compass/diario",  label: "Diário"  },
  { href: "/compass/notas",   label: "Notas"   },
  { href: "/compass/metas",   label: "Metas"   },
  { href: "/compass/estudos", label: "Estudos" },
  { href: "/compass/mapa",    label: "Mapa"    },
  { href: "/compass/perfil",  label: "Perfil"  },
]

// ── Drawer ────────────────────────────────────────────────────────────────────

const ALL_NAV = [
  { href: "/",               label: "Hub",     section: "Portal Solar"   },
  { href: "/world",          label: "World",   section: "Portal Solar"   },
  { href: "/portal/vilas",   label: "Vilas",   section: "Portal Solar"   },
  { href: "/portal/cultura", label: "Cultura", section: "Portal Solar"   },
  { href: "/social",         label: "Social",  section: "Portal Solar"   },
  { href: "/atlas",          label: "Atlas",   section: "Atlas"          },
  { href: "/atlas/novo",     label: "Novo",    section: "Atlas"          },
  { href: "/compass/diario", label: "Diário",  section: "Numita Compass" },
  { href: "/compass/notas",  label: "Notas",   section: "Numita Compass" },
  { href: "/compass/metas",  label: "Metas",   section: "Numita Compass" },
  { href: "/compass/estudos",label: "Estudos", section: "Numita Compass" },
  { href: "/compass/mapa",   label: "Mapa",    section: "Numita Compass" },
  { href: "/compass/perfil", label: "Perfil",  section: "Numita Compass" },
  { href: "/settings",       label: "Config",  section: "Sistema"        },
]

const DRAWER_SECTIONS = ["Portal Solar", "Atlas", "Numita Compass", "Sistema"]

const MODES: { id: InterfaceMode; label: string }[] = [
  { id: "ATLAS",         label: "Atlas"        },
  { id: "FOCUS",         label: "Foco"         },
  { id: "CONTEMPLATION", label: "Contemplação"  },
  { id: "PUBLIC",        label: "Público"      },
]

// ── NavTab ────────────────────────────────────────────────────────────────────

function NavTab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center justify-center flex-1 min-w-0 transition-all duration-200 px-2
        ${active ? "text-solar-accent" : "text-solar-muted/45 hover:text-solar-text/70"}`}
    >
      {active && (
        <span
          className="absolute inset-x-2 top-0 h-px"
          style={{ background: "rgb(var(--c-accent) / 0.6)" }}
        />
      )}
      <span className="text-[11px] font-mono uppercase tracking-wide leading-none whitespace-nowrap">
        {item.label}
      </span>
    </Link>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname          = usePathname()
  const router            = useRouter()
  const { mode, setMode } = useSolarStore()
  const [open, setOpen]   = useState(false)
  const [navSection, setNavSection] = useState<NavSection>("GERAL")

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const cycleSection = () => {
    const idx  = NAV_SECTIONS.findIndex((s) => s.id === navSection)
    const next = NAV_SECTIONS[(idx + 1) % NAV_SECTIONS.length]
    setNavSection(next.id)
  }

  const handleLogout = async () => {
    setOpen(false)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <>
      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-solar-void/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-28 left-1/2 -translate-x-1/2 w-[min(580px,calc(100vw-24px))] overflow-hidden"
            style={{
              background: "rgb(var(--c-deep) / 0.97)",
              border: "1px solid rgb(var(--c-border) / 0.4)",
              boxShadow: "0 -8px 40px rgb(0 0 0 / 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {DRAWER_SECTIONS.map((section) => {
              const items = ALL_NAV.filter((i) => i.section === section)
              return (
                <div key={section}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 px-6 pt-5 pb-2">
                    {section}
                  </p>
                  <div className="grid grid-cols-4 border-t border-solar-border/10 sm:grid-cols-5">
                    {items.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center justify-center py-5 transition-colors border-b border-solar-border/10
                            ${active ? "text-solar-accent" : "text-solar-muted/60 hover:text-solar-text"}`}
                        >
                          <span className="text-[11px] font-mono uppercase tracking-wide">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Mode switcher */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 px-6 pt-5 pb-2">
                Modo
              </p>
              <div className="grid grid-cols-4 border-t border-solar-border/10">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setOpen(false) }}
                    className={`flex items-center justify-center py-5 transition-colors border-b border-solar-border/10
                      ${mode === m.id ? "text-solar-accent" : "text-solar-muted/50 hover:text-solar-text"}`}
                  >
                    <span className="text-[11px] font-mono uppercase tracking-wide">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 text-[11px] font-mono uppercase tracking-wider text-solar-muted/40 hover:text-solar-muted/80 transition-colors border-t border-solar-border/15"
            >
              <LogOut size={14} strokeWidth={1.5} />
              Sair da conta
            </button>
          </div>
        </div>
      )}

      {/* ── Barra de navegação ───────────────────────────────────────────── */}
      <nav
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
        style={{ width: "calc(100vw - 24px)" }}
      >
        <div
          className="flex items-stretch h-12 overflow-hidden"
          style={{
            background: "rgb(var(--c-deep) / 0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgb(var(--c-border) / 0.35)",
            boxShadow: "0 8px 32px rgb(0 0 0 / 0.5)",
          }}
        >
          {/* Itens — variam conforme seção */}
          {navSection === "GERAL" && (
            <>
              <div className="hidden md:flex flex-1 min-w-0">
                {GERAL_LEFT.map((item) => (
                  <NavTab key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
              <div className="hidden md:block w-px bg-solar-border/20 self-stretch my-3 flex-shrink-0" />
              {GERAL_CORE.map((item) => (
                <NavTab key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </>
          )}

          {navSection === "PORTAL" && PORTAL_ITEMS.map((item) => (
            <NavTab key={item.href} item={item} active={isActive(item.href)} />
          ))}

          {navSection === "NUMITA" && NUMITA_ITEMS.map((item) => (
            <NavTab key={item.href} item={item} active={isActive(item.href)} />
          ))}

          {/* Botão criar */}
          <Link
            href="/atlas/novo"
            className="flex items-center justify-center w-16 flex-shrink-0 transition-all duration-200"
            style={{
              color: "rgb(var(--c-accent) / 0.8)",
              borderLeft: "1px solid rgb(var(--c-border) / 0.2)",
              borderRight: "1px solid rgb(var(--c-border) / 0.2)",
            }}
          >
            <Plus size={22} strokeWidth={1.5} />
          </Link>

          {/* Desktop extra direita — só no Geral */}
          {navSection === "GERAL" && (
            <>
              <div className="hidden md:flex flex-1 min-w-0">
                {GERAL_RIGHT.map((item) => (
                  <NavTab key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
              <div className="hidden md:block w-px bg-solar-border/20 self-stretch my-3 flex-shrink-0" />
            </>
          )}

          {/* Configuração */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center justify-center w-14 flex-shrink-0 transition-colors
              ${open ? "text-solar-accent" : "text-solar-muted/70 hover:text-solar-text"}`}
            title="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="8"  x2="18" y2="8"  />
              <line x1="4" y1="14" x2="18" y2="14" />
            </svg>
          </button>

          {/* Seção — cicla entre Geral / Portal / Numita */}
          <button
            onClick={cycleSection}
            className="flex items-center justify-center w-14 flex-shrink-0 transition-colors text-solar-muted/50 hover:text-solar-text"
            title={`Seção: ${NAV_SECTIONS.find((s) => s.id === navSection)?.label}`}
            style={{ borderLeft: "1px solid rgb(var(--c-border) / 0.2)" }}
          >
            <span className="text-[8px] font-mono uppercase tracking-widest leading-none" style={{ color: "rgb(var(--c-accent) / 0.6)" }}>
              {NAV_SECTIONS.find((s) => s.id === navSection)?.label}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
