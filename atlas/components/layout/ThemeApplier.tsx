"use client"

import { useEffect } from "react"
import { useSolarStore } from "@/atlas/lib/store"

export function ThemeApplier() {
  const theme        = useSolarStore((s) => s.theme)
  const customColors = useSolarStore((s) => s.customColors)

  useEffect(() => {
    // Apply theme via data-theme attribute on <html>
    document.documentElement.setAttribute("data-theme", theme)

    // Apply / remove custom color overrides as inline CSS vars
    const vars = [
      "--c-void", "--c-deep", "--c-surface", "--c-border",
      "--c-text", "--c-muted", "--c-accent", "--c-teal",
    ] as const

    vars.forEach((v) => {
      const val = customColors[v]
      if (val) {
        document.documentElement.style.setProperty(v, val)
      } else {
        document.documentElement.style.removeProperty(v)
      }
    })
  }, [theme, customColors])

  return null
}
