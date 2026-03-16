"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sun,
  Globe,
  NotebookPen,
  Library,
  Compass,
  Search,
  Settings,
} from "lucide-react"
import { useState } from "react"

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  section?: "portal" | "compass" | "system"
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",          label: "Início",   icon: <Sun size={15} />,        exact: true, section: "portal"  },
  { href: "/atlas",     label: "Atlas",    icon: <Globe size={15} />,       section: "portal"  },
  { href: "/world",     label: "Mundo",    icon: <Library size={15} />,     section: "portal"  },
  { href: "/compass/diario", label: "Diário",  icon: <NotebookPen size={15} />, section: "compass" },
  { href: "/compass/notas",  label: "Notas",   icon: <Compass size={15} />,     section: "compass" },
  { href: "/settings",  label: "Config",   icon: <Settings size={15} />,    section: "system"  },
]

export function BottomNav() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href.split("?")[0] ?? "")

  const isCompassSection = pathname.startsWith("/compass")

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav
        className="
          flex items-center gap-1
          bg-solar-deep/90 backdrop-blur-md
          border border-solar-border/60
          rounded-full px-2 py-2
          shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        "
        aria-label="Navegação principal"
      >
        {NAV_ITEMS.map((item, i) => {
          const active = isActive(item)
          const isNeon = item.section === "compass"

          // Separador entre Portal e Compass
          const showSep = i > 0 && item.section !== NAV_ITEMS[i - 1]?.section

          return (
            <span key={item.href} className="flex items-center">
              {showSep && (
                <span className="w-px h-4 bg-solar-border/40 mx-1" />
              )}
              <Link
                href={item.href}
                className="relative group flex items-center justify-center"
              >
                <span
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-full
                    transition-all duration-200
                    ${active
                      ? isNeon
                        ? "bg-compass-neon/10 text-compass-neon"
                        : "bg-solar-amber/10 text-solar-amber"
                      : "text-solar-muted/50 hover:text-solar-muted hover:bg-solar-surface/50"
                    }
                  `}
                >
                  {item.icon}
                </span>

                {/* Indicador de ativo */}
                {active && (
                  <span
                    className={`
                      absolute -bottom-0.5 left-1/2 -translate-x-1/2
                      w-1 h-1 rounded-full
                      ${isNeon ? "bg-compass-neon" : "bg-solar-amber"}
                    `}
                  />
                )}

                {/* Tooltip */}
                <span
                  className="
                    pointer-events-none absolute -top-9
                    left-1/2 -translate-x-1/2
                    px-2 py-1 rounded-md
                    bg-solar-deep border border-solar-border/60
                    text-[10px] font-mono text-solar-muted whitespace-nowrap
                    opacity-0 group-hover:opacity-100
                    -translate-y-1 group-hover:translate-y-0
                    transition-all duration-150
                    shadow-lg
                  "
                >
                  {item.label}
                </span>
              </Link>
            </span>
          )
        })}
      </nav>
    </div>
  )
}
