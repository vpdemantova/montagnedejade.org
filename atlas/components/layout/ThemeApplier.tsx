"use client"

import { useEffect } from "react"
import { useSolarStore } from "@/atlas/lib/store"
import type { CssVar, PatternId } from "@/atlas/lib/store"

const CSS_VARS: CssVar[] = [
  "--c-void", "--c-deep", "--c-surface", "--c-border",
  "--c-text", "--c-muted", "--c-accent", "--c-teal",
]

type PatternVars = { image: string; size: string; pos: string }

const PATTERN_STYLES: Record<PatternId, PatternVars | null> = {
  none:       null,
  grid:       {
    image: "linear-gradient(rgb(var(--c-border)/0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-border)/0.07) 1px, transparent 1px)",
    size:  "32px 32px",
    pos:   "0 0",
  },
  dots:       {
    image: "radial-gradient(circle, rgb(var(--c-border)/0.18) 1px, transparent 1px)",
    size:  "24px 24px",
    pos:   "0 0",
  },
  horizontal: {
    image: "linear-gradient(rgb(var(--c-border)/0.08) 1px, transparent 1px)",
    size:  "100% 28px",
    pos:   "0 0",
  },
  diagonal:   {
    image: "repeating-linear-gradient(45deg, rgb(var(--c-border)/0.06) 0px, rgb(var(--c-border)/0.06) 1px, transparent 1px, transparent 20px)",
    size:  "20px 20px",
    pos:   "0 0",
  },
  grain:      {
    image: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
    size:  "200px 200px",
    pos:   "0 0",
  },
}

export function ThemeApplier() {
  const theme         = useSolarStore((s) => s.theme)
  const customColors  = useSolarStore((s) => s.customColors)
  const customPattern = useSolarStore((s) => s.customPattern)

  // Apply theme preset (only re-runs when theme changes)
  useEffect(() => {
    const root = document.documentElement
    if (theme === "default") {
      root.removeAttribute("data-theme")
    } else {
      root.setAttribute("data-theme", theme)
    }
  }, [theme])

  // Apply/clear custom color overrides (runs when customColors changes)
  // Always syncs all 8 vars so deleted entries are removed from inline style
  useEffect(() => {
    const root = document.documentElement
    CSS_VARS.forEach((v) => {
      const value = customColors[v]
      if (value) {
        root.style.setProperty(v, value)
      } else {
        root.style.removeProperty(v)
      }
    })
  }, [customColors])

  // Apply background pattern
  useEffect(() => {
    const root = document.documentElement
    const vars = PATTERN_STYLES[customPattern]
    if (!vars) {
      root.style.removeProperty("--bg-pattern-image")
      root.style.removeProperty("--bg-pattern-size")
      root.style.removeProperty("--bg-pattern-pos")
    } else {
      root.style.setProperty("--bg-pattern-image", vars.image)
      root.style.setProperty("--bg-pattern-size",  vars.size)
      root.style.setProperty("--bg-pattern-pos",   vars.pos)
    }
  }, [customPattern])

  return null
}
