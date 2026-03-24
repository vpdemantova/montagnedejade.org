"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useFavorites } from "@/atlas/hooks/useFavorites"
import { useSolarStore, type InterfaceMode } from "@/atlas/lib/store"
import { useState } from "react"
import {
  Home, Globe2, Building2, Drama, Users,
  BookOpen, Plus,
  BookHeart, FileText, Target, GraduationCap, MapPin, User,
  Settings2, LogOut,
  Star,
} from "lucide-react"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type NavItem = {
  key:   string
  label: string
  href:  string
  icon:  React.ReactNode
}

// ── Seções de navegação ───────────────────────────────────────────────────────

const PORTAL_ITEMS: NavItem[] = [
  { key: "home",    label: "Home",       href: "/",               icon: <Home           size={15} strokeWidth={1.5} /> },
  { key: "world",   label: "World",      href: "/world",          icon: <Globe2         size={15} strokeWidth={1.5} /> },
  { key: "vilas",   label: "Vilas",      href: "/portal/vilas",   icon: <Building2      size={15} strokeWidth={1.5} /> },
  { key: "cultura", label: "Cultura",    href: "/portal/cultura", icon: <Drama          size={15} strokeWidth={1.5} /> },
  { key: "social",  label: "Rede Solar", href: "/social",         icon: <Users          size={15} strokeWidth={1.5} /> },
]

const ATLAS_ITEMS: NavItem[] = [
  { key: "atlas",   label: "Atlas",      href: "/atlas",          icon: <BookOpen       size={15} strokeWidth={1.5} /> },
]

const COMPASS_ITEMS: NavItem[] = [
  { key: "diario",  label: "Diário",     href: "/compass/diario", icon: <BookHeart      size={15} strokeWidth={1.5} /> },
  { key: "notas",   label: "Notas",      href: "/compass/notas",  icon: <FileText       size={15} strokeWidth={1.5} /> },
  { key: "metas",   label: "Metas",      href: "/compass/metas",  icon: <Target         size={15} strokeWidth={1.5} /> },
  { key: "estudos", label: "Estudos",    href: "/compass/estudos",icon: <GraduationCap  size={15} strokeWidth={1.5} /> },
  { key: "mapa",    label: "Mapa",       href: "/compass/mapa",   icon: <MapPin         size={15} strokeWidth={1.5} /> },
  { key: "perfil",  label: "Perfil",     href: "/compass/perfil", icon: <User           size={15} strokeWidth={1.5} /> },
]

// ── Modos de interface ────────────────────────────────────────────────────────

const MODES: { id: InterfaceMode; symbol: string; label: string; shortcut: string }[] = [
  { id: "ATLAS",        symbol: "⬡", label: "Atlas",       shortcut: "⌘⇧A" },
  { id: "FOCUS",        symbol: "✍", label: "Foco",        shortcut: "⌘⇧F" },
  { id: "CONTEMPLATION",symbol: "📖",label: "Contemplação", shortcut: "⌘⇧C" },
  { id: "PUBLIC",       symbol: "🌐",label: "Público",     shortcut: "⌘⇧P" },
]

// ── SidebarItem ───────────────────────────────────────────────────────────────

function SidebarItem({ item, isActive, accent = "amber" }: { item: NavItem; isActive: boolean; accent?: "amber" | "teal" }) {
  const activeClass = accent === "teal" ? "text-solar-teal" : "text-solar-amber"

  return (
    <Link
      href={item.href}
      className="relative group flex items-center justify-center w-full h-10"
    >
      {isActive && (
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full ${accent === "teal" ? "bg-solar-teal" : "bg-solar-amber"}`}
        />
      )}
      <span
        className={`
          flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-150
          ${isActive
            ? `${activeClass} bg-solar-surface/60`
            : "text-solar-muted/40 hover:text-solar-muted/80 group-hover:bg-solar-surface/30"
          }
        `}
      >
        {item.icon}
      </span>
      {/* Tooltip */}
      <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
        {item.label}
      </span>
    </Link>
  )
}

// ── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-solar-muted/25 px-1 mt-1 mb-0.5 select-none">
      {label}
    </span>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-8 border-t border-solar-border/15 my-1 mx-auto flex-shrink-0" />
}

// ── Componente principal ──────────────────────────────────────────────────────

export function SidebarNav() {
  const pathname          = usePathname()
  const { favorites }     = useFavorites()
  const { mode, setMode } = useSolarStore()
  const [modeOpen, setModeOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const currentMode = MODES.find((m) => m.id === mode)!

  return (
    <aside className="
      hidden md:flex
      fixed top-0 left-0 h-screen w-[60px] z-40
      flex-col items-center
      bg-solar-deep border-r border-solar-border/20
    ">

      {/* Logo */}
      <Link
        href="/"
        className="relative group flex items-center justify-center w-full h-[52px] border-b border-solar-border/20 flex-shrink-0"
      >
        <span className="text-solar-amber/60 group-hover:text-solar-amber transition-colors text-lg leading-none select-none">☀</span>
        <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
          Portal Solar
        </span>
      </Link>

      {/* ── PORTAL ── */}
      <div className="flex flex-col items-center w-full pt-2">
        <SectionLabel label="Portal" />
        {PORTAL_ITEMS.map((item) => (
          <SidebarItem key={item.key} item={item} isActive={isActive(item.href)} accent="amber" />
        ))}
      </div>

      <Divider />

      {/* ── ATLAS ── */}
      <div className="flex flex-col items-center w-full">
        <SectionLabel label="Atlas" />
        {ATLAS_ITEMS.map((item) => (
          <SidebarItem key={item.key} item={item} isActive={isActive(item.href)} accent="amber" />
        ))}
      </div>

      {/* ── Criar item ── */}
      <Link
        href="/atlas/novo"
        className="relative group flex items-center justify-center w-full h-9"
        title="Novo item"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-150 text-solar-muted/30 hover:text-solar-amber/80 group-hover:bg-solar-surface/30">
          <Plus size={15} strokeWidth={1.5} />
        </span>
        <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
          Novo item
        </span>
      </Link>

      <Divider />

      {/* ── COMPASS ── */}
      <div className="flex flex-col items-center w-full">
        <SectionLabel label="Compass" />
        {COMPASS_ITEMS.map((item) => (
          <SidebarItem key={item.key} item={item} isActive={isActive(item.href)} accent="teal" />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Favoritos ── */}
      {favorites.slice(0, 3).map((fav) => (
        <Link
          key={fav.id}
          href={`/atlas/${fav.slug ?? fav.id}`}
          className="relative group flex items-center justify-center w-full h-8"
        >
          <Star size={10} strokeWidth={1.5} className="text-solar-amber/25 group-hover:text-solar-amber/60 transition-colors" />
          <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap max-w-[160px] truncate opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
            {fav.title}
          </span>
        </Link>
      ))}

      <Divider />

      {/* ── ModeSwitch compacto ── */}
      <div className="relative group flex flex-col items-center w-full">
        <button
          onClick={() => setModeOpen((v) => !v)}
          className="relative flex items-center justify-center w-full h-9 group/btn"
          title={`Modo: ${currentMode.label}`}
        >
          <span className="text-sm leading-none text-solar-muted/40 group-hover/btn:text-solar-muted/80 transition-colors">
            {currentMode.symbol}
          </span>
          <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
            Modo: {currentMode.label}
          </span>
        </button>

        {/* Dropdown de modos — abre para a direita */}
        {modeOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setModeOpen(false)} />
            <div className="absolute left-[52px] bottom-0 z-[100] bg-solar-deep border border-solar-border/40 shadow-xl py-1 min-w-[160px]">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setModeOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left ${
                    mode === m.id ? "text-solar-amber" : "text-solar-muted/60 hover:text-solar-text"
                  }`}
                >
                  <span className="text-sm w-5 text-center">{m.symbol}</span>
                  <span className="text-[10px] font-mono flex-1">{m.label}</span>
                  <span className="text-[8px] font-mono text-solar-muted/30">{m.shortcut}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Settings ── */}
      <Link
        href="/settings"
        className="relative group flex items-center justify-center w-full h-9"
      >
        <Settings2
          size={14}
          strokeWidth={1.5}
          className={`transition-colors ${pathname === "/settings" ? "text-solar-amber" : "text-solar-muted/30 group-hover:text-solar-muted/70"}`}
        />
        <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
          Configurações
        </span>
      </Link>

      {/* ── Logout ── */}
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" })
          window.location.href = "/login"
        }}
        className="relative group flex items-center justify-center w-full h-9 mb-2"
      >
        <LogOut
          size={14}
          strokeWidth={1.5}
          className="text-solar-muted/25 group-hover:text-solar-muted/60 transition-colors"
        />
        <span className="absolute left-[52px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-solar-deep border border-solar-border/40 text-[9px] font-mono text-solar-text/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[100] shadow-lg">
          Sair
        </span>
      </button>

    </aside>
  )
}
