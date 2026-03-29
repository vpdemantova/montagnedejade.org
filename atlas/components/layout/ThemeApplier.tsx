"use client"

import { useEffect } from "react"

// Garante que nenhum data-theme antigo (salvo no localStorage) sobrescreva o tema papel
export function ThemeApplier() {
  useEffect(() => {
    document.documentElement.removeAttribute("data-theme")
    // Remove quaisquer CSS vars customizadas salvas anteriormente
    const vars = [
      "--c-void", "--c-deep", "--c-surface", "--c-border",
      "--c-text", "--c-muted", "--c-accent", "--c-teal",
    ]
    vars.forEach((v) => document.documentElement.style.removeProperty(v))
  }, [])

  return null
}
