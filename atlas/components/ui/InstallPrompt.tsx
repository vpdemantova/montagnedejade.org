"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FOUNDER } from "@/portal.config"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/**
 * WelcomeBar — barra de boas-vindas fixa no rodapé.
 *
 * Mostra sempre (primeira visita / sessão nova) com 3 ações:
 *   1. ◎ Apresentação   → reabre o EntryCard (card inicial do Portal Solar)
 *   2. ◉ Convite        → página /convite/{FOUNDER.USERNAME} com o convite do fundador
 *   3. ⊹ Instalar       → prompt de instalação PWA (só aparece quando o browser suporta)
 *
 * Dispensado com × → sessionStorage "ps-welcome-dismissed"
 */
export function InstallPrompt() {
  const [prompt,     setPrompt]     = useState<BeforeInstallPromptEvent | null>(null)
  const [visible,    setVisible]    = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("ps-welcome-dismissed")) return
    setVisible(true)

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const openEntryCard = () => {
    sessionStorage.removeItem("ps-entry")
    window.dispatchEvent(new CustomEvent("portal:show-entry-card"))
  }

  const install = async () => {
    if (!prompt) return
    setInstalling(true)
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") dismiss()
    setInstalling(false)
    setPrompt(null)
  }

  const dismiss = () => {
    sessionStorage.setItem("ps-welcome-dismissed", "1")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-[38px] left-0 right-0 z-[300] flex justify-center px-3 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="pointer-events-auto flex items-center gap-2 px-3 py-2 w-full max-w-xl"
        style={{
          background: "rgb(var(--c-deep) / 0.97)",
          border:     "1px solid rgb(var(--c-border) / 0.22)",
          boxShadow:  "0 -2px 0 rgb(var(--c-accent) / 0.12), 0 8px 40px rgb(0 0 0 / 0.35)",
        }}
      >
        {/* Sol */}
        <span
          className="text-base flex-shrink-0"
          style={{ color: "rgb(var(--c-accent))" }}
          aria-hidden
        >
          ☀
        </span>

        {/* Ações */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide">

          {/* 1. Abrir EntryCard */}
          <button
            onClick={openEntryCard}
            title="Ver apresentação do Portal Solar"
            className="flex-shrink-0 font-mono text-[7px] uppercase tracking-[0.2em] px-2.5 py-1.5 border transition-all hover:border-solar-border/50 hover:text-solar-text/80"
            style={{
              borderColor: "rgb(var(--c-border) / 0.22)",
              color:       "rgb(var(--c-text) / 0.58)",
            }}
          >
            ◎ Apresentação
          </button>

          {/* 2. Convite do Fundador */}
          <Link
            href={`/convite/${FOUNDER.USERNAME}`}
            title={`Convite de @${FOUNDER.USERNAME} — fundador do Portal Solar`}
            className="flex-shrink-0 font-mono text-[7px] uppercase tracking-[0.2em] px-2.5 py-1.5 border transition-all hover:border-solar-border/50 hover:text-solar-text/80"
            style={{
              borderColor: "rgb(var(--c-border) / 0.22)",
              color:       "rgb(var(--c-text) / 0.58)",
            }}
          >
            ◉ Convite
          </Link>

          {/* 3. Instalar (condicional — browser suporta PWA) */}
          {prompt && (
            <button
              onClick={() => void install()}
              disabled={installing}
              title="Instalar Portal Solar como app"
              className="flex-shrink-0 font-mono text-[7px] uppercase tracking-[0.2em] px-2.5 py-1.5 transition-opacity disabled:opacity-50"
              style={{
                background: "rgb(var(--c-accent))",
                color:      "rgb(var(--c-void))",
              }}
            >
              {installing ? "…" : "⊹ Instalar"}
            </button>
          )}
        </div>

        {/* Dispensar */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 font-mono text-[13px] hover:opacity-50 transition-opacity"
          style={{ color: "rgb(var(--c-muted) / 0.35)" }}
          aria-label="Fechar barra de boas-vindas"
        >
          ×
        </button>
      </div>
    </div>
  )
}
