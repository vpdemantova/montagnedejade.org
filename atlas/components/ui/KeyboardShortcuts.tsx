"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { openQuickCapture } from "./QuickCapture"

/**
 * Global keyboard shortcut handler.
 * Registers all app-wide keyboard shortcuts in one place.
 *
 * Shortcuts:
 *   ⌘N  → Quick Capture (nota)
 *   ⌘J  → Quick Capture (diário)
 *   ⌘⇧N → Nova nota completa
 *   ⌘G  → Ir para Atlas
 *   ⌘⇧G → Ir para Compass Diário
 */
export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey

      // Skip if inside an input/textarea/contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return

      if (!meta) return

      switch (e.key) {
        case "n":
          if (e.shiftKey) {
            // ⌘⇧N → Full new item page
            e.preventDefault()
            router.push("/atlas/novo")
          } else {
            // ⌘N → Quick capture nota
            e.preventDefault()
            openQuickCapture("nota")
          }
          break

        case "j":
          // ⌘J → Quick capture diário
          e.preventDefault()
          openQuickCapture("diario")
          break

        case "i":
          // ⌘I → Quick capture ideia
          if (!e.shiftKey) {
            e.preventDefault()
            openQuickCapture("ideia")
          }
          break

        case "g":
          if (e.shiftKey) {
            // ⌘⇧G → Diário
            e.preventDefault()
            router.push("/compass/diario")
          } else {
            // ⌘G → Atlas
            e.preventDefault()
            router.push("/atlas")
          }
          break

        case ",":
          // ⌘, → Configurações (padrão macOS)
          e.preventDefault()
          router.push("/settings")
          break
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [router])

  return null
}
