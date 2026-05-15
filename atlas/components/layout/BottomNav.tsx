"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { useSolarStore } from "@/atlas/lib/store"
import { openQuickCapture } from "@/atlas/components/ui/QuickCapture"
import { PILL_H, DIV_CLR, SECTION_STYLE } from "./UnifiedNav"
import { NAV } from "@/portal.config"

function isOn(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function BottomNav() {
  const pathname = usePathname()
  const { mode } = useSolarStore()

  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))
  }

  const cellBase = "flex items-center justify-center h-full select-none transition-colors duration-150"

  const activeStyle = (href: string) => ({
    backgroundColor: isOn(href, pathname) ? "rgb(var(--c-text))" : "rgb(var(--c-deep))",
    color:           isOn(href, pathname) ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.68)",
  })

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50"
      style={{
        height:     `${PILL_H}px`,
        background: "rgb(var(--c-deep))",
        borderTop:  `1px solid ${DIV_CLR}`,
        boxShadow:  "0 -4px 20px rgb(0 0 0 / 0.1)",
      }}
      aria-label="Menu pessoal"
    >
      {/* 5 células — ponta a ponta, sem padding lateral */}
      <div className="h-full flex items-stretch w-full">

        {/* Work */}
        <Link href="/compass/estudos"
          className={`flex-1 ${cellBase} flex-shrink-0`}
          style={{ ...activeStyle("/compass/estudos"), borderRight: `1px solid ${DIV_CLR}` }}>
          {NAV.SHOW_NAV_LABELS && (
            <span className="font-mono uppercase tracking-[0.2em] whitespace-nowrap" style={{ fontSize: "8px" }}>
              ▸ Work
            </span>
          )}
        </Link>

        {/* + Nova nota (centro-1) */}
        <button
          onClick={() => openQuickCapture("nota")}
          aria-label="Nova nota"
          className={`flex-1 ${cellBase}`}
          style={{ borderRight: `1px solid ${DIV_CLR}`, color: "rgb(var(--c-accent))", background: "rgb(var(--c-deep))" }}>
          <Plus size={15} strokeWidth={1.5} />
        </button>

        {/* Quadro (centro-2) */}
        <Link href="/compass/quadro"
          className={`flex-1 ${cellBase}`}
          style={{ ...activeStyle("/compass/quadro"), borderRight: `1px solid ${DIV_CLR}` }}>
          <span className="font-mono uppercase tracking-[0.22em]" style={{ fontSize: "8px" }}>◈</span>
        </Link>

        {/* Buscar (centro-3) */}
        <button
          onClick={triggerSearch}
          aria-label="Buscar"
          className={`flex-1 ${cellBase}`}
          style={{ borderRight: `1px solid ${DIV_CLR}`, color: "rgb(var(--c-text) / 0.65)", background: "rgb(var(--c-deep))" }}>
          <Search size={13} strokeWidth={1.4} />
        </button>

        {/* Perfil */}
        <Link href="/compass/perfil"
          className={`flex-1 ${cellBase} flex-shrink-0`}
          style={activeStyle("/compass/perfil")}>
          {NAV.SHOW_NAV_LABELS && (
            <span className="font-mono uppercase tracking-[0.2em] whitespace-nowrap" style={{ fontSize: "8px" }}>
              ◉ Perfil
            </span>
          )}
        </Link>

      </div>

      {/* Indicador de modo */}
      {mode !== "ATLAS" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-1"
          style={{ pointerEvents: "none" }}>
          <span className="font-mono text-[6px] uppercase tracking-[0.35em]"
            style={{ color: "rgb(var(--c-accent) / 0.45)" }}>
            {mode.toLowerCase()}
          </span>
        </div>
      )}
    </nav>
  )
}
