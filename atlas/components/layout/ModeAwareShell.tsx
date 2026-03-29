"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSolarStore } from "@/atlas/lib/store"
import { BottomNav } from "./BottomNav"

// Tema único: Papel & Tinta — claro, quente, contrastante
const PAPER_VARS: React.CSSProperties = {
  "--c-void":       "250 246 238",
  "--c-deep":       "242 236 224",
  "--c-surface":    "230 222 206",
  "--c-border":     "180 160 120",
  "--c-text":       "22 16 6",
  "--c-muted":      "90 68 40",
  "--c-accent":     "120 60 25",
  "--c-accent-lt":  "160 90 42",
  "--c-teal":       "40 110 70",
  "--c-teal-lt":    "55 135 88",
} as React.CSSProperties

export function ModeAwareShell({ children }: { children: React.ReactNode }) {
  const { pushVisited } = useSolarStore()
  const pathname = usePathname()

  useEffect(() => { pushVisited(pathname) }, [pathname, pushVisited])

  return (
    <div
      style={{
        ...PAPER_VARS,
        background: "rgb(var(--c-void))",
        color:      "rgb(var(--c-text))",
        minHeight:  "100vh",
      }}
    >
      <div data-mode-shell className="pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
