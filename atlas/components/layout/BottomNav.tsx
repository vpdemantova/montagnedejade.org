"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Home, BookOpen, Globe2, Plus, BookHeart, Search, AlignJustify,
  Drama, Users, FileText, Target, GraduationCap, MapPin, UserCircle,
  Settings2, LogOut, Info, Landmark, GitBranch, Pencil, Eye,
  Layers, Satellite, Music, StickyNote, X, type LucideIcon,
} from "lucide-react"
import { useSolarStore, type InterfaceMode } from "@/atlas/lib/store"
import { openQuickCapture } from "@/atlas/components/ui/QuickCapture"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type NavItem = {
  href:  string
  label: string
  icon:  LucideIcon
}

// ── Itens da barra principal ──────────────────────────────────────────────────

const BAR_LEFT: NavItem[] = [
  { href: "/",               label: "Hub",    icon: Home     },
  { href: "/atlas",          label: "Atlas",  icon: BookOpen },
  { href: "/world",          label: "Mundo",  icon: Globe2   },
]

const BAR_RIGHT: NavItem[] = [
  { href: "/compass/diario", label: "Diário", icon: BookHeart },
]

// ── Itens do drawer ───────────────────────────────────────────────────────────

type DrawerSection = {
  label: string
  items: NavItem[]
}

const DRAWER_NAV: DrawerSection[] = [
  {
    label: "Portal Solar",
    items: [
      { href: "/",               label: "Hub",       icon: Home      },
      { href: "/world",          label: "Mundo",     icon: Globe2    },
      { href: "/portal/vilas",   label: "Vilas",     icon: MapPin    },
      { href: "/portal/cultura", label: "Cultura",   icon: Drama     },
      { href: "/social",         label: "Social",    icon: Users     },
      { href: "/monument",       label: "Monumento", icon: Landmark  },
    ],
  },
  {
    label: "Atlas",
    items: [
      { href: "/atlas",          label: "Atlas",     icon: BookOpen  },
      { href: "/atlas/novo",     label: "Novo item", icon: Plus      },
      { href: "/atlas/grafo",    label: "Grafo",     icon: GitBranch },
    ],
  },
  {
    label: "Compass",
    items: [
      { href: "/compass/diario",  label: "Diário",   icon: BookHeart     },
      { href: "/compass/notas",   label: "Notas",    icon: StickyNote    },
      { href: "/compass/metas",   label: "Metas",    icon: Target        },
      { href: "/compass/estudos", label: "Estudos",  icon: GraduationCap },
      { href: "/compass/mapa",    label: "Mapa",     icon: MapPin        },
      { href: "/compass/perfil",  label: "Perfil",   icon: UserCircle    },
    ],
  },
]

// ── Modos de interface ────────────────────────────────────────────────────────

type ModeOption = {
  id:     InterfaceMode
  label:  string
  icon:   LucideIcon
  hint:   string
}

const MODES: ModeOption[] = [
  { id: "FOCUS",         label: "Foco",        icon: Pencil,    hint: "Editor limpo"              },
  { id: "CONTEMPLATION", label: "Contemplação", icon: Eye,       hint: "Leitura imersiva"          },
  { id: "ATLAS",         label: "Atlas",        icon: Layers,    hint: "Exploração completa"       },
  { id: "PUBLIC",        label: "Público",      icon: Satellite, hint: "Visão de visitante"        },
]

// ── Barra principal — item ────────────────────────────────────────────────────

function BarItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      title={item.label}
      aria-label={item.label}
      className={`
        relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-full transition-colors
        ${active ? "text-solar-accent" : "text-solar-muted/45 hover:text-solar-text/70"}
      `}
    >
      {active && (
        <span
          className="absolute inset-x-2 top-0 h-px"
          style={{ background: "rgb(var(--c-accent) / 0.6)" }}
        />
      )}
      <Icon size={16} strokeWidth={1.5} />
      <span className="text-[8px] font-mono uppercase tracking-wider leading-none hidden sm:block">
        {item.label}
      </span>
    </Link>
  )
}

// ── Drawer — item de navegação ────────────────────────────────────────────────

function DrawerNavItem({
  item,
  active,
  onClose,
}: {
  item:    NavItem
  active:  boolean
  onClose: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`
        flex flex-col items-center gap-2 py-4 rounded transition-colors
        ${active
          ? "text-solar-accent bg-solar-surface/30"
          : "text-solar-muted/60 hover:text-solar-text hover:bg-solar-surface/20"
        }
      `}
    >
      <Icon size={18} strokeWidth={1.5} />
      <span className="text-[9px] font-mono uppercase tracking-widest leading-none">
        {item.label}
      </span>
    </Link>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function BottomNav() {
  const pathname            = usePathname()
  const [open, setOpen]     = useState(false)
  const { mode, setMode }   = useSolarStore()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const currentMode = MODES.find((m) => m.id === mode)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  const triggerSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
    )
  }

  return (
    <>
      {/* ── Drawer ───────────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgb(var(--c-void) / 0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[min(640px,calc(100vw-24px))] overflow-hidden"
            style={{
              background: "rgb(var(--c-deep) / 0.98)",
              border:     "1px solid rgb(var(--c-border) / 0.4)",
              boxShadow:  "0 -8px 48px rgb(0 0 0 / 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Topo — busca + captura */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-solar-border/15">
              <button
                onClick={() => { triggerSearch(); setOpen(false) }}
                className="flex-1 flex items-center gap-2 px-3 py-2 text-[11px] font-mono text-solar-muted/40 hover:text-solar-text/70 transition-colors border border-solar-border/20 hover:border-solar-border/40"
              >
                <Search size={11} strokeWidth={1.5} />
                <span>Buscar</span>
                <kbd className="ml-auto text-[8px] text-solar-muted/25 border border-solar-border/20 px-1 font-mono">⌘K</kbd>
              </button>
              <button
                onClick={() => { openQuickCapture("nota"); setOpen(false) }}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono text-solar-muted/40 hover:text-solar-text/70 transition-colors border border-solar-border/20 hover:border-solar-border/40"
              >
                <FileText size={11} strokeWidth={1.5} />
                <span>Capturar</span>
                <kbd className="ml-1 text-[8px] text-solar-muted/25 border border-solar-border/20 px-1 font-mono">⌘N</kbd>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 text-solar-muted/40 hover:text-solar-text transition-colors"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Seções de navegação */}
            {DRAWER_NAV.map((section) => (
              <div key={section.label}>
                <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-solar-muted/30 px-5 pt-4 pb-1">
                  {section.label}
                </p>
                <div
                  className="grid border-t border-solar-border/10"
                  style={{ gridTemplateColumns: `repeat(${Math.min(section.items.length, 6)}, 1fr)` }}
                >
                  {section.items.map((item) => (
                    <DrawerNavItem
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onClose={() => setOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Modo de interface */}
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-solar-muted/30 px-5 pt-4 pb-1">
                Modo
              </p>
              <div className="grid grid-cols-4 border-t border-solar-border/10">
                {MODES.map((m) => {
                  const Icon    = m.icon
                  const active  = mode === m.id
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMode(m.id); setOpen(false) }}
                      title={m.hint}
                      className={`
                        flex flex-col items-center gap-2 py-4 transition-colors
                        ${active
                          ? "text-solar-accent bg-solar-surface/30"
                          : "text-solar-muted/50 hover:text-solar-text hover:bg-solar-surface/20"
                        }
                      `}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                      <span className="text-[9px] font-mono uppercase tracking-widest leading-none">
                        {m.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sistema */}
            <div className="flex items-center border-t border-solar-border/20 px-2 py-2 gap-1">
              <Link
                href="/sobre"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono text-solar-muted/50 hover:text-solar-text transition-colors flex-1 justify-center"
              >
                <Info size={13} strokeWidth={1.5} />
                <span>Sobre</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono text-solar-muted/50 hover:text-solar-text transition-colors flex-1 justify-center"
              >
                <Settings2 size={13} strokeWidth={1.5} />
                <span>Config</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono text-solar-muted/40 hover:text-solar-text transition-colors flex-1 justify-center"
              >
                <LogOut size={13} strokeWidth={1.5} />
                <span>Sair</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Barra de navegação ────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
        style={{ width: "calc(100vw - 24px)", maxWidth: "720px" }}
      >
        <div
          className="flex items-stretch h-12 overflow-hidden"
          style={{
            background: "rgb(var(--c-deep))",
            border:     "1px solid rgb(var(--c-border) / 0.35)",
            boxShadow:  "0 4px 32px rgb(0 0 0 / 0.2)",
          }}
        >
          {/* Esquerda — Portal + Atlas + Mundo */}
          {BAR_LEFT.map((item) => (
            <BarItem key={item.href} item={item} active={isActive(item.href)} />
          ))}

          {/* Divisor */}
          <span className="w-px bg-solar-border/20 self-stretch my-3 flex-shrink-0" />

          {/* Ação central — Criar novo */}
          <Link
            href="/atlas/novo"
            title="Novo item"
            aria-label="Criar novo item"
            className="flex flex-col items-center justify-center gap-1 w-14 flex-shrink-0 transition-colors"
            style={{ color: "rgb(var(--c-accent) / 0.85)" }}
          >
            <Plus size={18} strokeWidth={1.5} />
            <span className="text-[8px] font-mono uppercase tracking-wider leading-none hidden sm:block">
              Novo
            </span>
          </Link>

          {/* Divisor */}
          <span className="w-px bg-solar-border/20 self-stretch my-3 flex-shrink-0" />

          {/* Direita — Compass */}
          {BAR_RIGHT.map((item) => (
            <BarItem key={item.href} item={item} active={isActive(item.href)} />
          ))}

          {/* Busca */}
          <button
            onClick={triggerSearch}
            title="Buscar (⌘K)"
            aria-label="Buscar"
            className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 h-full text-solar-muted/45 hover:text-solar-text/70 transition-colors"
          >
            <Search size={16} strokeWidth={1.5} />
            <span className="text-[8px] font-mono uppercase tracking-wider leading-none hidden sm:block">
              Buscar
            </span>
          </button>

          {/* Divisor */}
          <span className="w-px bg-solar-border/20 self-stretch my-3 flex-shrink-0" />

          {/* Menu / Drawer */}
          <button
            onClick={() => setOpen((v) => !v)}
            title="Menu"
            aria-label="Menu completo"
            className={`
              flex flex-col items-center justify-center gap-1 w-14 flex-shrink-0 transition-colors
              ${open ? "text-solar-accent" : "text-solar-muted/50 hover:text-solar-text"}
            `}
          >
            <AlignJustify size={16} strokeWidth={1.5} />
            {currentMode && (
              <span
                className="text-[7px] font-mono uppercase tracking-wider leading-none hidden sm:block"
                style={{ color: open ? "rgb(var(--c-accent) / 0.8)" : "rgb(var(--c-accent) / 0.4)" }}
              >
                {currentMode.label}
              </span>
            )}
          </button>

        </div>
      </nav>
    </>
  )
}
