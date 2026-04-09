"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSolarStore } from "@/atlas/lib/store"
import { BottomNav } from "./BottomNav"
import { SidebarNav } from "./SidebarNav"

// SSR fallback vars for editorial theme (prevents flash before hydration)
const EDITORIAL_FALLBACK: React.CSSProperties = {
  "--c-void":    "252 252 250",
  "--c-deep":    "244 242 238",
  "--c-surface": "232 229 224",
  "--c-border":  "165 160 153",
  "--c-text":    "12 10 8",
  "--c-muted":   "95 90 85",
  "--c-accent":  "12 10 8",
  "--c-teal":    "12 10 8",
} as React.CSSProperties

export function ModeAwareShell({ children }: { children: React.ReactNode }) {
  const { pushVisited, theme } = useSolarStore()
  const pathname = usePathname()

  useEffect(() => { pushVisited(pathname) }, [pathname, pushVisited])

  return (
    <div
      data-theme={theme}
      style={EDITORIAL_FALLBACK}
      className="min-h-screen bg-solar-void text-solar-text"
    >
      <SidebarNav />
      <div className="md:pl-16 lg:pl-52 pb-20 min-h-screen">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
