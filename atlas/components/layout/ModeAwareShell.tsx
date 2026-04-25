"use client"

import { useSolarStore } from "@/atlas/lib/store"
import { NAV } from "@/portal.config"
import { UnifiedNav, NAV_PAD } from "./UnifiedNav"
import { BottomNav } from "./BottomNav"
import { Breadcrumb } from "./Breadcrumb"

// SSR fallback vars for pergaminho theme (prevents flash before hydration)
const PERGAMINHO_FALLBACK: React.CSSProperties = {
  "--c-void":    "248 243 230",
  "--c-deep":    "238 230 212",
  "--c-surface": "224 214 194",
  "--c-border":  "42 30 12",
  "--c-text":    "8 5 2",
  "--c-muted":   "62 46 24",
  "--c-accent":  "118 72 14",
  "--c-teal":    "38 90 58",
} as React.CSSProperties

export function ModeAwareShell({ children }: { children: React.ReactNode }) {
  const { theme } = useSolarStore()

  return (
    <div
      data-theme={theme}
      data-hide-headers={!NAV.SHOW_PAGE_HEADERS ? "true" : undefined}
      style={PERGAMINHO_FALLBACK}
      className="min-h-screen bg-solar-void text-solar-text"
    >
      <UnifiedNav />
      {NAV.SHOW_BREADCRUMB && <Breadcrumb />}
      <BottomNav />
      {/*
        top:  nav(38) + breadcrumb(28) + gap(4) = 70px
        bot:  nav(38) = 38px
      */}
      <div className="pt-[70px] pb-[38px] min-h-screen" style={{ paddingLeft: NAV_PAD, paddingRight: NAV_PAD }}>
        {children}
      </div>
    </div>
  )
}
