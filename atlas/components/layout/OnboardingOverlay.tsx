"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSolarStore } from "@/atlas/lib/store"

const STORAGE_KEY = "solaris-onboarded"

const STEPS = [
  {
    symbol:  "◈",
    title:   "Bem-vindo ao Portal Solar",
    body:    "Um ecossistema local-first de gestão de conhecimento. Tudo que você registra aqui fica na sua máquina.",
    cta:     "Continuar",
  },
  {
    symbol:  "⬡",
    title:   "O Atlas",
    body:    "Seu acervo central. Livros, pessoas, conceitos, obras, partituras. Cada item vive em uma área e pode ter relações com outros.",
    cta:     "Continuar",
  },
  {
    symbol:  "◑",
    title:   "Numita Compass",
    body:    "Seu espaço pessoal. Diário com editor rico, tracker de estudos, metas e o Mapa Interior — uma constelação dos seus temas.",
    cta:     "Continuar",
  },
  {
    symbol:  "✍",
    title:   "Modos de Interface",
    body:    "Alterne entre Atlas (exploração), Foco (escrita), Contemplação (leitura imersiva) e Público (visão de visitante) com ⌘⇧A/F/C/P.",
    cta:     "Continuar",
  },
  {
    symbol:  "⊕",
    title:   "Tudo pronto",
    body:    "Comece adicionando seu primeiro item no Atlas, ou escreva no Diário de hoje.",
    cta:     "Entrar no Portal Solar",
  },
]

export function OnboardingOverlay() {
  const [show,   setShow]   = useState(false)
  const [step,   setStep]   = useState(0)
  const router              = useRouter()
  const setMode             = useSolarStore((s) => s.setMode)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setShow(true)
  }, [])

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      localStorage.setItem(STORAGE_KEY, "1")
      setShow(false)
      setMode("ATLAS")
      router.push("/atlas")
    }
  }

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, "1")
    setShow(false)
  }

  const current = STEPS[step]!

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-solar-void/95 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 max-w-md w-full mx-6"
          >
            <div className="border border-solar-border/40 bg-solar-deep/90 p-10">
              {/* Symbol */}
              <div className="text-4xl text-solar-amber mb-6 text-center">
                {current.symbol}
              </div>

              {/* Title */}
              <h2 className="font-display text-[28px] leading-tight text-solar-text text-center mb-4 tracking-tight">
                {current.title}
              </h2>

              {/* Body */}
              <p className="text-[12px] font-mono text-solar-muted/70 text-center leading-relaxed mb-8">
                {current.body}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className="transition-all duration-300"
                    style={{
                      width:            i === step ? 16 : 4,
                      height:           4,
                      background:       i === step ? "#C8A45A" : "rgba(200,164,90,0.2)",
                      borderRadius:     2,
                    }}
                  />
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={next}
                className="
                  w-full py-3 border border-solar-amber/50
                  text-[11px] font-mono uppercase tracking-[0.2em]
                  text-solar-amber hover:bg-solar-amber/10
                  transition-all duration-200
                "
              >
                {current.cta}
              </button>

              {/* Skip */}
              {step < STEPS.length - 1 && (
                <button
                  onClick={skip}
                  className="w-full mt-3 text-[9px] font-mono text-solar-muted/30 hover:text-solar-muted/60 transition-colors uppercase tracking-widest"
                >
                  Pular introdução
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
