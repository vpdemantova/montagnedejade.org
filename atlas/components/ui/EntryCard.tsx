"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { RotatingCube } from "./RotatingCube"

const DURATION = 24
const RADIUS   = 30
const CIRC     = 2 * Math.PI * RADIUS

const QUESTIONS = [
  {
    n:    "01",
    text: "Porque existem guerras — e como elas poderiam acabar?",
    sub:  "Conflito, poder, escassez e a natureza humana.",
    slug: "guerras-e-paz",
  },
  {
    n:    "02",
    text: "Porque temos conflitos com outros humanos?",
    sub:  "Identidade, medo, desejo e a busca por pertencimento.",
    slug: "conflitos-humanos",
  },
  {
    n:    "03",
    text: "Como passar os dias de forma integral, expressando suas únicas ações e vontades?",
    sub:  "Presença, criação e a arte de existir com intenção.",
    slug: "vida-integral",
  },
  {
    n:    "04",
    text: "Como reduzir a tortura de animais e diminuir o sofrimento em toda a Terra?",
    sub:  "Empatia inter-espécies, sistemas alimentares e ações de paz.",
    slug: "sofrimento-e-paz-animal",
  },
]

export function EntryCard() {
  const router   = useRouter()
  const pathname = usePathname()

  const [open,    setOpen]    = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [hovering,setHovering]= useState(false)
  // "ler" = false (timer rodando) | "reading" (timer pausado) | "closing" (voltando ao timer)
  const [readMode, setReadMode] = useState<"off" | "on">("off")

  const rafRef        = useRef<number>(0)
  const startRef      = useRef<number>(0)
  const pausedElapsed = useRef<number>(0)
  const pausedRef     = useRef<boolean>(false)

  useEffect(() => {
    if (pathname?.startsWith("/convite")) return

    const show = () => {
      setElapsed(0)
      pausedElapsed.current = 0
      pausedRef.current     = false
      setHovering(false)
      setReadMode("off")
      setOpen(true)
    }

    window.addEventListener("portal:show-entry-card", show)

    if (typeof window !== "undefined" && !sessionStorage.getItem("ps-entry")) {
      const t = setTimeout(() => setOpen(true), 500)
      return () => { clearTimeout(t); window.removeEventListener("portal:show-entry-card", show) }
    }

    return () => window.removeEventListener("portal:show-entry-card", show)
  }, [pathname])

  // Destino padrão: /academia (entry card é a porta de entrada da Academia)
  const close = useCallback((dest = "/academia") => {
    sessionStorage.setItem("ps-entry", "1")
    cancelAnimationFrame(rafRef.current)
    setOpen(false)
    setTimeout(() => router.push(dest), 320)
  }, [router])

  useEffect(() => {
    if (!open) return
    // Se em modo leitura, não toca o timer
    if (readMode === "on") return

    startRef.current = performance.now() - pausedElapsed.current * 1000

    const tick = (now: number) => {
      if (!pausedRef.current) {
        const s = (now - startRef.current) / 1000
        pausedElapsed.current = s
        setElapsed(s)
        if (s >= DURATION) { close("/academia"); return }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [open, close, readMode])

  const handleHoverEnter = () => {
    if (readMode === "on") return
    pausedRef.current = true
    setHovering(true)
  }

  const handleHoverLeave = () => {
    if (readMode === "on") return
    startRef.current  = performance.now() - pausedElapsed.current * 1000
    pausedRef.current = false
    setHovering(false)
  }

  // Botão "Ler" — pausa timer definitivamente
  const handleReadToggle = () => {
    if (readMode === "off") {
      // Pausa timer
      cancelAnimationFrame(rafRef.current)
      pausedRef.current = true
      setReadMode("on")
      setHovering(false)
    } else {
      // Fecha o card
      close("/academia")
    }
  }

  const progress = Math.min(elapsed / DURATION, 1)
  const dashOff  = CIRC * (1 - progress)

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[400]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              background:           "rgb(var(--c-void) / 0.75)",
              backdropFilter:       "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
            onClick={() => close("/academia")}
          />

          {/* Wrapper centrado */}
          <div className="fixed inset-0 z-[401] flex items-center justify-center pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full"
              style={{ maxWidth: "min(560px, calc(100vw - 32px))" }}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Card */}
              <div style={{
                background:   "rgb(var(--c-void))",
                border:       "1px solid rgb(var(--c-border) / 0.35)",
                borderRadius: "12px",
                boxShadow:    "0 32px 80px rgb(0 0 0 / 0.22), 0 4px 16px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(var(--c-border) / 0.08)",
                overflow:     "hidden",
              }}>

                {/* ── Header: cubo + título ── */}
                <div className="flex items-center gap-3 px-8 pt-7 pb-5"
                  style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}>
                  <RotatingCube size={36} />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-mono text-[6px] uppercase tracking-[0.4em]"
                        style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
                        Portal Solar
                      </p>
                      <span className="font-mono text-[6px]" style={{ color: "rgb(var(--c-muted) / 0.2)" }}>·</span>
                      <p className="font-mono text-[6px] uppercase tracking-[0.4em]"
                        style={{ color: "rgb(var(--c-muted) / 0.28)" }}>
                        Bússola de Numita
                      </p>
                    </div>
                    <p className="font-display leading-none"
                      style={{ fontSize: "1rem", letterSpacing: "-0.02em", color: "rgb(var(--c-text) / 0.7)" }}>
                      Questões do mundo
                    </p>
                  </div>
                </div>

                {/* ── Questões (clicáveis) ── */}
                <div className="px-8 pt-6 pb-6 space-y-5">
                  {QUESTIONS.map((q) => (
                    <Link
                      key={q.n}
                      href={`/academia/topico/${q.slug}`}
                      onClick={() => close(`/academia/topico/${q.slug}`)}
                      className="block group"
                    >
                      <p className="font-mono text-[6.5px] uppercase tracking-[0.35em] mb-1"
                        style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
                        {q.n}
                      </p>
                      <p className="font-display leading-snug mb-0.5 group-hover:opacity-100 transition-opacity duration-150"
                        style={{ fontSize: "1.05rem", letterSpacing: "-0.012em", color: "rgb(var(--c-text) / 0.9)" }}>
                        {q.text}
                        <span className="inline-block ml-2 opacity-0 group-hover:opacity-40 transition-opacity duration-150"
                          style={{ fontSize: "0.7rem" }}>→</span>
                      </p>
                      <p className="font-mono text-[7.5px]"
                        style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
                        {q.sub}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* ── Bússola de Numita ── */}
                <Link
                  href="/compass"
                  onClick={() => close("/compass")}
                  className="flex items-center justify-between px-8 py-3.5 group hover:opacity-80 transition-opacity"
                  style={{ borderTop: "1px solid rgb(var(--c-border) / 0.1)", background: "rgb(var(--c-deep) / 0.25)" }}
                >
                  <div>
                    <p className="font-mono text-[6px] uppercase tracking-[0.35em] mb-0.5"
                      style={{ color: "rgb(var(--c-muted) / 0.35)" }}>
                      Parte integrante
                    </p>
                    <p className="font-display"
                      style={{ fontSize: "0.82rem", letterSpacing: "-0.01em", color: "rgb(var(--c-text) / 0.65)" }}>
                      Bússola de Numita
                      <span className="font-mono text-[7px] ml-2"
                        style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
                        caderno pessoal de aprendizado
                      </span>
                    </p>
                  </div>
                  <span className="font-mono text-[9px] opacity-0 group-hover:opacity-40 transition-opacity"
                    style={{ color: "rgb(var(--c-text))" }}>→</span>
                </Link>

                {/* ── Links de seção ── */}
                <div
                  className="flex items-stretch"
                  style={{
                    borderTop:    "1px solid rgb(var(--c-border) / 0.14)",
                    borderBottom: "1px solid rgb(var(--c-border) / 0.14)",
                    background:   "rgb(var(--c-deep) / 0.5)",
                  }}>

                  <Link
                    href="/portal/cultura"
                    onClick={() => close("/portal/cultura")}
                    className="flex-1 px-7 py-4 group flex flex-col gap-0.5 hover:bg-solar-surface/30 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[7.5px] uppercase tracking-[0.28em]"
                        style={{ color: "rgb(var(--c-accent) / 0.9)" }}>Cultura</span>
                      <span style={{ color: "rgb(var(--c-accent) / 0.5)", fontSize: 10 }}>→</span>
                    </div>
                    <p className="font-mono text-[7px] leading-relaxed"
                      style={{ color: "rgb(var(--c-muted) / 0.65)" }}>
                      Notícias e referências do mundo atual.
                    </p>
                  </Link>

                  <Link
                    href="/academia"
                    onClick={() => close("/academia")}
                    className="flex-1 px-7 py-4 group flex flex-col gap-0.5 hover:bg-solar-surface/30 transition-colors duration-150"
                    style={{ borderLeft: "1px solid rgb(var(--c-border) / 0.14)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[7.5px] uppercase tracking-[0.28em]"
                        style={{ color: "rgb(var(--c-teal) / 0.9)" }}>Academia</span>
                      <span style={{ color: "rgb(var(--c-teal) / 0.5)", fontSize: 10 }}>→</span>
                    </div>
                    <p className="font-mono text-[7px] leading-relaxed"
                      style={{ color: "rgb(var(--c-muted) / 0.65)" }}>
                      História, realidade e ensinamentos do planeta.
                    </p>
                  </Link>

                </div>

                {/* ── Footer: timer ring + botão LER ── */}
                <div className="flex items-center justify-between px-8 py-5">

                  {/* Botão LER / FECHAR */}
                  <button
                    onClick={handleReadToggle}
                    className="relative overflow-hidden font-mono text-[7px] uppercase tracking-[0.3em] px-4 py-2 border transition-all duration-300"
                    style={{
                      borderColor: readMode === "on"
                        ? "rgb(var(--c-accent) / 0.5)"
                        : "rgb(var(--c-border) / 0.3)",
                      background: readMode === "on"
                        ? "rgb(var(--c-accent) / 0.08)"
                        : "transparent",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {readMode === "off" ? (
                        <motion.span
                          key="ler"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25 }}
                          style={{ color: "rgb(var(--c-muted) / 0.55)", display: "block" }}
                        >
                          ler
                        </motion.span>
                      ) : (
                        <motion.span
                          key="fechar"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          style={{ color: "rgb(var(--c-accent))", display: "block" }}
                        >
                          fechar
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Anel timer (oculto em modo leitura) */}
                  <motion.div
                    animate={{ opacity: readMode === "on" ? 0 : 1, scale: readMode === "on" ? 0.85 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => close("/academia")}
                      onMouseEnter={handleHoverEnter}
                      onMouseLeave={handleHoverLeave}
                      aria-label="Fechar"
                      className="relative flex items-center justify-center transition-opacity duration-150"
                      style={{ opacity: readMode === "on" ? 0 : hovering ? 0.9 : 1, pointerEvents: readMode === "on" ? "none" : "auto" }}
                    >
                      <svg
                        width={RADIUS * 2 + 16}
                        height={RADIUS * 2 + 16}
                        style={{ transform: "rotate(-90deg)" }}
                      >
                        <circle
                          cx={RADIUS + 8} cy={RADIUS + 8} r={RADIUS}
                          fill="none"
                          stroke="rgb(var(--c-border) / 0.22)"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={RADIUS + 8} cy={RADIUS + 8} r={RADIUS}
                          fill="none"
                          stroke={hovering ? "rgb(var(--c-accent) / 0.4)" : "rgb(var(--c-muted) / 0.45)"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeDasharray={CIRC}
                          strokeDashoffset={dashOff}
                          style={{ transition: "stroke 0.2s" }}
                        />
                      </svg>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          style={{
                            fontSize:   "24px",
                            lineHeight: 1,
                            fontWeight: 200,
                            color:      hovering ? "rgb(var(--c-accent) / 0.7)" : "rgb(var(--c-text) / 0.5)",
                            transition: "color 0.15s, transform 0.2s",
                            transform:  hovering ? "rotate(45deg)" : "rotate(0deg)",
                            display:    "block",
                          }}
                        >
                          {hovering ? "+" : "−"}
                        </span>
                      </div>
                    </button>
                  </motion.div>

                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
