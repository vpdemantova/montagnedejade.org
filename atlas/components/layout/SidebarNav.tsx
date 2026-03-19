"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useFavorites } from "@/atlas/hooks/useFavorites"

// ── Ícones SVG ────────────────────────────────────────────────────────────────

function IcoVilas() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <polygon points="10,0.5 18.5,5 18.5,15 10,19.5 1.5,15 1.5,5" />
    </svg>
  )
}
function IcoCultura() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <rect x="1" y="1" width="8" height="8" />
      <rect x="11" y="1" width="8" height="8" />
      <rect x="1" y="11" width="8" height="8" />
      <rect x="11" y="11" width="8" height="8" />
    </svg>
  )
}
function IcoAtlas() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <polygon points="4,5 16,5 10,17" />
      <circle cx="4"  cy="5"  r="3.5" />
      <circle cx="16" cy="5"  r="3.5" />
      <circle cx="10" cy="17" r="3.5" />
    </svg>
  )
}
function IcoDiario() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.5 A8.5 8.5 0 1 0 10 18.5 Z" />
    </svg>
  )
}
function IcoPerfil() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 1a9 9 0 100 18A9 9 0 0010 1zm0 4a5 5 0 110 10A5 5 0 0110 5z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  )
}
function IcoNotas() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <polygon points="10,1 19.5,18.5 0.5,18.5" />
    </svg>
  )
}
function IcoEstudos() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1L1 6l9 5 9-5-9-5zm0 2.3L16.5 6 10 8.7 3.5 6 10 3.3z"/>
      <path d="M1 13.5l9 5 9-5v-2l-9 5-9-5v2z"/>
      <path d="M1 9.5l9 5 9-5v-2l-9 5-9-5v2z"/>
    </svg>
  )
}
function IcoMetas() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="9" fillOpacity="0" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="5.5" fillOpacity="0" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="2" />
    </svg>
  )
}
function IcoMapa() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2C7.24 2 5 4.24 5 7c0 4.25 5 11 5 11s5-6.75 5-11c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S9.17 5.5 10 5.5 11.5 6.17 11.5 7 10.83 8.5 10 8.5z"/>
    </svg>
  )
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type NavItem = {
  key:       string
  label:     string
  href:      string
  icon:      React.ReactNode
  isCompass: boolean
}

// ── Dados de navegação ────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { key: "vilas",   label: "Vilas",         href: "/portal/vilas",   icon: <IcoVilas />,   isCompass: false },
  { key: "cultura", label: "Cultura",       href: "/portal/cultura", icon: <IcoCultura />, isCompass: false },
  { key: "atlas",   label: "Atlas",         href: "/atlas",          icon: <IcoAtlas />,   isCompass: false },
  { key: "diario",  label: "Diário",        href: "/compass/diario", icon: <IcoDiario />,  isCompass: true  },
  { key: "notas",   label: "Notas",         href: "/compass/notas",  icon: <IcoNotas />,   isCompass: true  },
  { key: "estudos", label: "Estudos",       href: "/compass/estudos",icon: <IcoEstudos />, isCompass: true  },
  { key: "metas",   label: "Metas",         href: "/compass/metas",  icon: <IcoMetas />,   isCompass: true  },
  { key: "mapa",    label: "Mapa Interior", href: "/compass/mapa",   icon: <IcoMapa />,    isCompass: true  },
  { key: "perfil",  label: "Perfil",        href: "/compass/perfil", icon: <IcoPerfil />,  isCompass: true  },
]

// ── SidebarItem ───────────────────────────────────────────────────────────────

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const amber = "text-solar-amber"
  const neon  = "text-compass-neon-dim"
  const accentColor = item.isCompass ? neon : amber

  return (
    <Link
      href={item.href}
      className="relative group flex items-center justify-center w-full h-10"
    >
      {/* Active indicator */}
      {isActive && (
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r-full ${item.isCompass ? "bg-compass-neon-dim" : "bg-solar-amber"}`}
        />
      )}

      {/* Icon */}
      <span
        className={`
          flex items-center justify-center w-8 h-8 rounded-sm transition-all duration-150
          ${isActive
            ? `${accentColor} bg-solar-surface/60`
            : "text-solar-muted/50 hover:text-solar-muted group-hover:bg-solar-surface/30"
          }
        `}
      >
        {item.icon}
      </span>

      {/* Tooltip */}
      <span
        className="
          absolute left-[52px] top-1/2 -translate-y-1/2
          px-2.5 py-1 bg-solar-deep border border-solar-border/40
          text-[9px] font-mono text-solar-text/80 whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 z-[100]
          shadow-lg
        "
      >
        {item.label}
      </span>
    </Link>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function SidebarNav() {
  const pathname  = usePathname()
  const { favorites } = useFavorites()

  return (
    <aside className="
      hidden md:flex
      fixed top-0 left-0 h-screen w-[60px] z-40
      flex-col items-center
      bg-solar-deep border-r border-solar-border/20
    ">

      {/* Logo mark */}
      <Link
        href="/"
        className="flex items-center justify-center w-full h-[52px] border-b border-solar-border/20 flex-shrink-0 group relative"
      >
        <span className="text-solar-amber/70 group-hover:text-solar-amber transition-colors text-base leading-none">
          ☀
        </span>
        <span className="
          absolute left-[52px] top-1/2 -translate-y-1/2
          px-2.5 py-1 bg-solar-deep border border-solar-border/40
          text-[9px] font-mono text-solar-text/80 whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 z-[100] shadow-lg
        ">
          Portal Solar
        </span>
      </Link>

      {/* Portal Solar items */}
      <nav className="flex flex-col items-center w-full pt-2">
        {NAV_ITEMS.filter((i) => !i.isCompass).map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            isActive={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="w-8 border-t border-solar-border/20 my-2 flex-shrink-0" />

      {/* Compass items */}
      <nav className="flex flex-col items-center w-full">
        {NAV_ITEMS.filter((i) => i.isCompass).map((item) => (
          <SidebarItem
            key={item.key}
            item={item}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Favorites */}
      {favorites.slice(0, 5).map((fav) => (
        <Link
          key={fav.id}
          href={`/atlas/${fav.slug ?? fav.id}`}
          className="relative group flex items-center justify-center w-full h-9"
        >
          <span className="text-[8px] text-solar-amber/30 group-hover:text-solar-amber/60 transition-colors">★</span>
          <span className="
            absolute left-[52px] top-1/2 -translate-y-1/2
            px-2.5 py-1 bg-solar-deep border border-solar-border/40
            text-[9px] font-mono text-solar-text/80 whitespace-nowrap max-w-[160px] truncate
            opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-150 z-[100] shadow-lg
          ">
            {fav.title}
          </span>
        </Link>
      ))}

      {/* Bottom padding */}
      <div className="h-4 flex-shrink-0" />
    </aside>
  )
}
