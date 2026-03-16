"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sun,
  BookOpen,
  Palette,
  Users,
  Library,
  Globe,
  Compass,
  BookMarked,
  Music,
  Heart,
  NotebookPen,
  GraduationCap,
  Mountain,
  Settings,
  StickyNote,
  User,
  Target,
  Map,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  accent?: "amber" | "neon"
}

const PORTAL_ITEMS: NavItem[] = [
  { href: "/",                    label: "Início",         icon: <Sun size={16} />,           exact: true,  accent: "amber" },
  { href: "/atlas",               label: "Atlas",          icon: <Globe size={16} />,          accent: "amber" },
  { href: "/atlas?area=ACADEMIA", label: "Academia",       icon: <GraduationCap size={16} />,  accent: "amber" },
  { href: "/atlas?area=ARTES",    label: "Artes",          icon: <Palette size={16} />,        accent: "amber" },
  { href: "/atlas?area=PESSOAS",  label: "Pessoas",        icon: <Users size={16} />,          accent: "amber" },
  { href: "/atlas?area=OBRAS",    label: "Obras",          icon: <Library size={16} />,        accent: "amber" },
  { href: "/world",               label: "Monumentos",     icon: <Mountain size={16} />,       accent: "amber" },
]

const COMPASS_ITEMS: NavItem[] = [
  { href: "/compass/diario",      label: "Diário",         icon: <NotebookPen size={16} />,    accent: "neon" },
  { href: "/compass/notas",       label: "Notas",          icon: <StickyNote size={16} />,     accent: "neon" },
  { href: "/compass/perfil",      label: "Perfil",         icon: <User size={16} />,           accent: "neon" },
  { href: "/compass/estudos",     label: "Estudos",        icon: <BookOpen size={16} />,       accent: "neon" },
  { href: "/compass/metas",       label: "Metas",          icon: <Target size={16} />,         accent: "neon" },
  { href: "/compass/mapa",        label: "Mapa Interior",  icon: <Map size={16} />,            accent: "neon" },
]

const SYSTEM_ITEMS: NavItem[] = [
  { href: "/settings",            label: "Configurações",  icon: <Settings size={16} /> },
]

type NavButtonProps = {
  item: NavItem
  isActive: boolean
}

function NavButton({ item, isActive }: NavButtonProps) {
  const isNeon  = item.accent === "neon"
  const isAmber = item.accent === "amber" || !item.accent

  const activeColor  = isNeon ? "text-compass-neon" : "text-solar-amber"
  const activeBg     = isNeon ? "bg-compass-neon/10" : "bg-solar-amber/10"
  const hoverColor   = isNeon ? "group-hover:text-compass-neon" : "group-hover:text-solar-amber"
  const tooltipBg    = isNeon ? "bg-[#0D1F0D] border-compass-neon/20 text-compass-neon" : "bg-solar-deep border-solar-border text-solar-text"

  return (
    <Link href={item.href} className="relative group flex items-center justify-center">
      {/* Ícone */}
      <span
        className={`
          w-9 h-9 flex items-center justify-center rounded-md transition-solar
          ${isActive
            ? `${activeColor} ${activeBg}`
            : `text-solar-muted hover:${activeBg} ${hoverColor}`
          }
        `}
      >
        {item.icon}
      </span>

      {/* Indicador ativo */}
      {isActive && (
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full ${isNeon ? "bg-compass-neon" : "bg-solar-amber"}`}
        />
      )}

      {/* Tooltip */}
      <span
        className={`
          pointer-events-none absolute left-12 z-50
          px-2.5 py-1 rounded-md border text-xs font-mono whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-1 group-hover:translate-x-0
          transition-all duration-150
          ${tooltipBg}
          shadow-lg
        `}
      >
        {item.label}
      </span>
    </Link>
  )
}

function Divider() {
  return <div className="mx-auto w-5 h-px bg-solar-border my-2" />
}

export function SidebarNav() {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href.split("?")[0] ?? "")

  return (
    <aside className="w-[60px] shrink-0 fixed top-0 left-0 h-screen bg-solar-deep border-r border-solar-border flex flex-col z-40">
      {/* Logo */}
      <Link
        href="/"
        className="h-[60px] flex items-center justify-center border-b border-solar-border group relative"
      >
        <span className="text-solar-amber text-lg transition-solar group-hover:text-solar-amber-light group-hover:scale-110">
          ☀
        </span>
        {/* Tooltip do logo */}
        <span className="pointer-events-none absolute left-12 z-50 px-2.5 py-1 rounded-md border border-solar-border bg-solar-deep text-solar-text text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 shadow-lg">
          SOLARIS
        </span>
      </Link>

      {/* Portal Solar */}
      <nav className="flex-1 flex flex-col items-center py-3 gap-0.5 overflow-y-auto overflow-x-visible">
        {PORTAL_ITEMS.map((item) => (
          <NavButton key={item.href} item={item} isActive={isActive(item)} />
        ))}

        <Divider />

        {/* Numita Compass */}
        {COMPASS_ITEMS.map((item) => (
          <NavButton key={item.href} item={item} isActive={isActive(item)} />
        ))}

        <Divider />

        {/* Sistema */}
        {SYSTEM_ITEMS.map((item) => (
          <NavButton key={item.href} item={item} isActive={isActive(item)} />
        ))}
      </nav>

      {/* Versão */}
      <div className="h-[60px] flex items-center justify-center border-t border-solar-border">
        <span className="text-[9px] font-mono text-solar-muted/40 rotate-90 tracking-widest">
          v0.1
        </span>
      </div>
    </aside>
  )
}
