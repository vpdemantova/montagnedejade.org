"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSolarStore, type InterfaceMode } from "@/atlas/lib/store"
import { useState } from "react"
import {
  Home, Globe2, Drama, Users,
  BookOpen, BookHeart, FileText, Target, GraduationCap, MapPin,
  Settings2, LogOut, Sun, ChevronRight, Search, Plus, Info,
} from "lucide-react"
import { openQuickCapture } from "@/atlas/components/ui/QuickCapture"

type NavItem = {
  key:   string
  label: string
  href:  string
  icon:  React.ReactNode
}

const PORTAL_ITEMS: NavItem[] = [
  { key: "home",    label: "Home",       href: "/",               icon: <Home         size={14} strokeWidth={1.5} /> },
  { key: "world",   label: "Mundo",      href: "/world",          icon: <Globe2       size={14} strokeWidth={1.5} /> },
  { key: "cultura", label: "Cultura",    href: "/portal/cultura", icon: <Drama        size={14} strokeWidth={1.5} /> },
  { key: "social",  label: "Rede",       href: "/social",         icon: <Users        size={14} strokeWidth={1.5} /> },
]

const ATLAS_ITEMS: NavItem[] = [
  { key: "atlas",   label: "Atlas",      href: "/atlas",          icon: <BookOpen     size={14} strokeWidth={1.5} /> },
]

const COMPASS_ITEMS: NavItem[] = [
  { key: "diario",  label: "Diário",     href: "/compass/diario", icon: <BookHeart    size={14} strokeWidth={1.5} /> },
  { key: "notas",   label: "Notas",      href: "/compass/notas",  icon: <FileText     size={14} strokeWidth={1.5} /> },
  { key: "metas",   label: "Metas",      href: "/compass/metas",  icon: <Target       size={14} strokeWidth={1.5} /> },
  { key: "estudos", label: "Estudos",    href: "/compass/estudos",icon: <GraduationCap size={14} strokeWidth={1.5} /> },
  { key: "mapa",    label: "Mapa",       href: "/compass/mapa",   icon: <MapPin       size={14} strokeWidth={1.5} /> },
]

const MODES: { id: InterfaceMode; label: string }[] = [
  { id: "ATLAS",         label: "Atlas"        },
  { id: "FOCUS",         label: "Foco"         },
  { id: "CONTEMPLATION", label: "Contemplação" },
  { id: "PUBLIC",        label: "Público"      },
]

// ── Nav item ─────────────────────────────────────────────────────────────────

function NavRow({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`
        relative flex items-center gap-3 py-2.5 pl-4 pr-2
        text-[11px] font-mono transition-colors duration-150
        ${isActive
          ? "text-solar-text border-l-2 border-solar-accent -ml-px pl-[15px] bg-solar-surface/30"
          : "text-solar-text/50 hover:text-solar-text hover:bg-solar-surface/20 border-l-2 border-transparent -ml-px pl-[15px]"
        }
      `}
    >
      <span className="flex-shrink-0 opacity-70">{item.icon}</span>
      <span className="hidden lg:block truncate">{item.label}</span>
    </Link>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-5 pb-1">
      <ChevronRight size={8} className="text-solar-muted/30 hidden lg:block" />
      <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-solar-muted/35 hidden lg:block select-none">
        {label}
      </span>
      <div className="lg:hidden w-5 border-t border-solar-border/20 mx-auto mt-1" />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SidebarNav() {
  const pathname          = usePathname()
  const { mode, setMode } = useSolarStore()
  const [modeOpen, setModeOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const currentMode = MODES.find((m) => m.id === mode)?.label ?? "Atlas"

  return (
    <aside className="
      hidden md:flex
      fixed top-0 left-0 h-screen z-40
      flex-col
      w-16 lg:w-52
      bg-solar-void border-r border-solar-border/30
      overflow-hidden
    ">

      {/* Logo / wordmark */}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-4 h-[52px] border-b border-solar-border/20 flex-shrink-0 group"
      >
        <Sun size={14} strokeWidth={1.5} className="text-solar-accent/70 group-hover:text-solar-accent transition-colors flex-shrink-0" />
        <span className="hidden lg:block text-[11px] font-mono uppercase tracking-[0.15em] text-solar-text/70 group-hover:text-solar-text transition-colors">
          Portal Solar
        </span>
      </Link>

      {/* Search + Quick capture */}
      <div className="border-b border-solar-border/20 flex-shrink-0">
        <button
          onClick={() => {
            // Trigger global search — dispatch ⌘K
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-mono text-solar-text/35 hover:text-solar-text/60 hover:bg-solar-surface/20 transition-colors border-b border-solar-border/10"
        >
          <Search size={12} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="hidden lg:block flex-1 text-left">Buscar</span>
          <kbd className="hidden lg:block text-[7px] text-solar-muted/25 border border-solar-border/20 px-1 py-0.5 font-mono">⌘K</kbd>
        </button>
        <button
          onClick={() => openQuickCapture("nota")}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-mono text-solar-text/35 hover:text-solar-text/60 hover:bg-solar-surface/20 transition-colors"
        >
          <Plus size={12} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="hidden lg:block flex-1 text-left">Capturar</span>
          <kbd className="hidden lg:block text-[7px] text-solar-muted/25 border border-solar-border/20 px-1 py-0.5 font-mono">⌘N</kbd>
        </button>
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* PORTAL */}
        <SectionLabel label="Portal" />
        {PORTAL_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} isActive={isActive(item.href)} />
        ))}

        {/* ATLAS */}
        <SectionLabel label="Atlas" />
        {ATLAS_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} isActive={isActive(item.href)} />
        ))}

        {/* COMPASS */}
        <SectionLabel label="Compass" />
        {COMPASS_ITEMS.map((item) => (
          <NavRow key={item.key} item={item} isActive={isActive(item.href)} />
        ))}

      </div>

      {/* Bottom actions */}
      <div className="border-t border-solar-border/20 py-2 flex-shrink-0">

        {/* Mode picker */}
        <div className="relative">
          <button
            onClick={() => setModeOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono text-solar-text/50 hover:text-solar-text hover:bg-solar-surface/20 transition-colors"
          >
            <span className="flex-shrink-0 w-[14px] h-[14px] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-solar-accent/60" />
            </span>
            <span className="hidden lg:block">Modo</span>
          </button>

          {modeOpen && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setModeOpen(false)} />
              <div className="absolute left-full bottom-0 z-[100] bg-solar-void border border-solar-border/40 shadow-xl py-1 min-w-[140px] lg:left-0 lg:bottom-full">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setModeOpen(false) }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-[10px] font-mono transition-colors text-left ${
                      mode === m.id ? "text-solar-text" : "text-solar-text/40 hover:text-solar-text"
                    }`}
                  >
                    {mode === m.id && <span className="w-1 h-1 rounded-full bg-solar-accent flex-shrink-0" />}
                    {mode !== m.id && <span className="w-1 h-1 flex-shrink-0" />}
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sobre / Como foi feito */}
        <Link
          href="/sobre"
          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono transition-colors ${
            pathname === "/sobre"
              ? "text-solar-text border-l-2 border-solar-accent -ml-px pl-[15px]"
              : "text-solar-text/50 hover:text-solar-text hover:bg-solar-surface/20 border-l-2 border-transparent -ml-px pl-[15px]"
          }`}
        >
          <Info size={14} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="hidden lg:block">Sobre</span>
        </Link>

        {/* Settings */}
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono transition-colors ${
            pathname === "/settings"
              ? "text-solar-text border-l-2 border-solar-accent -ml-px pl-[15px]"
              : "text-solar-text/50 hover:text-solar-text hover:bg-solar-surface/20 border-l-2 border-transparent -ml-px pl-[15px]"
          }`}
        >
          <Settings2 size={14} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="hidden lg:block">Config</span>
        </Link>

        {/* Logout */}
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" })
            window.location.href = "/login"
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-mono text-solar-text/40 hover:text-solar-text hover:bg-solar-surface/20 transition-colors border-l-2 border-transparent -ml-px pl-[15px]"
        >
          <LogOut size={14} strokeWidth={1.5} className="flex-shrink-0" />
          <span className="hidden lg:block">Sair</span>
        </button>

      </div>
    </aside>
  )
}
