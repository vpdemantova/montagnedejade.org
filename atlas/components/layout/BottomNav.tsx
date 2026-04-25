"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { useSolarStore } from "@/atlas/lib/store"
import { openQuickCapture } from "@/atlas/components/ui/QuickCapture"
import { PILL_H, NAV_PAD, DIV_CLR, SECTION_STYLE } from "./UnifiedNav"
import { NAV } from "@/portal.config"

function isOn(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function SideLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const on = isOn(href, pathname)
  return (
    <div style={{ flex: 1 }}>
      <Link
        href={href}
        className="h-full flex flex-col items-center justify-center px-5 select-none transition-colors duration-150"
        style={{
          ...SECTION_STYLE,
          backgroundColor: on ? "rgb(var(--c-text))" : "rgb(var(--c-deep))",
          color:           on ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.72)",
        }}
      >
        {NAV.SHOW_NAV_LABELS && (
          <span className="font-mono uppercase tracking-[0.2em] whitespace-nowrap" style={{ fontSize: "8px" }}>
            {label}
          </span>
        )}
      </Link>
    </div>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const { mode } = useSolarStore()

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50"
      style={{ height: `${PILL_H}px` }}
      aria-label="Menu pessoal"
    >
      <div className="h-full flex items-stretch" style={{ paddingLeft: NAV_PAD, paddingRight: NAV_PAD }}>

        {/* Esquerda: Perfil — bloco completo */}
        <SideLink href="/compass/perfil" label="Perfil" pathname={pathname} />

        {/* Centro — + · Display · 🔍 na horizontal */}
        <div
          className="flex-1 flex flex-row items-stretch overflow-hidden"
          style={{ ...SECTION_STYLE, backgroundColor: "rgb(var(--c-deep))" }}
        >
          {/* + Nova nota */}
          <button
            onClick={() => openQuickCapture("nota")}
            aria-label="Novo"
            className="flex-1 flex items-center justify-center transition-opacity duration-200 hover:opacity-50"
            style={{ borderRight: `1px solid ${DIV_CLR}`, color: "rgb(var(--c-accent))" }}
          >
            <Plus size={15} strokeWidth={1.4} />
          </button>

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

          {/* Buscar */}
          <button
            onClick={triggerSearch}
            aria-label="Buscar"
            className="flex-1 flex items-center justify-center transition-opacity duration-200 hover:opacity-50"
            style={{ color: "rgb(var(--c-text) / 0.65)" }}
          >
            <Search size={13} strokeWidth={1.4} />
          </button>
        </div>

        {/* Direita: Work — bloco completo */}
        <SideLink href="/compass/estudos" label="Work" pathname={pathname} />

      </div>

      {mode !== "ATLAS" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-1" style={{ pointerEvents: "none" }}>
          <span className="font-mono text-[6px] uppercase tracking-[0.35em]" style={{ color: "rgb(var(--c-accent) / 0.45)" }}>
            {mode.toLowerCase()}
          </span>
        </div>
      )}
    </nav>
  )
}
