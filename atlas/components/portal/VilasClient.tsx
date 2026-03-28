"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Link from "next/link"

// ── Vilas definition ───────────────────────────────────────────────────────────

const VILAS = [
  {
    area:        "ACADEMIA",
    label:       "Academia",
    description: "Física, Biologia, Literatura, Gramática, Linguística, História, Geografia.",
    defaultView: "INDEX",
    symbol:      "◉",
    color:       "text-solar-amber",
    border:      "border-solar-amber/30",
    hover:       "hover:border-solar-amber/60 hover:bg-solar-amber/5",
    bar:         "bg-solar-amber",
  },
  {
    area:        "ARTES",
    label:       "Artes",
    description: "Música — composição e teoria. Crafts — lutheria e artes manuais.",
    defaultView: "SHELVES",
    symbol:      "♩",
    color:       "text-[#4A7C6F]",
    border:      "border-[#4A7C6F]/30",
    hover:       "hover:border-[#4A7C6F]/60 hover:bg-[#4A7C6F]/5",
    bar:         "bg-[#4A7C6F]",
  },
  {
    area:        "COMPUTACAO",
    label:       "Computação",
    description: "Desenvolvimento e código criativo.",
    defaultView: "LIST",
    symbol:      "⌨",
    color:       "text-[#4A5C7C]",
    border:      "border-[#4A5C7C]/30",
    hover:       "hover:border-[#4A5C7C]/60 hover:bg-[#4A5C7C]/5",
    bar:         "bg-[#4A5C7C]",
  },
  {
    area:        "AULAS",
    label:       "Aulas",
    description: "Autores-guia: Proust, Dostoiévski, Thomas Mann, Júlio Verne. Aulas conceituais sobre literatura e conhecimento.",
    defaultView: "CURSOS",
    symbol:      "▶",
    color:       "text-[#5C7C4A]",
    border:      "border-[#5C7C4A]/30",
    hover:       "hover:border-[#5C7C4A]/60 hover:bg-[#5C7C4A]/5",
    bar:         "bg-[#5C7C4A]",
  },
] as const

// ── Component ──────────────────────────────────────────────────────────────────

export function VilasClient({
  counts,
  lastByArea,
}: {
  counts:     Record<string, number>
  lastByArea: Record<string, string | null>
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(
      ".vila-card",
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.1, delay: 0.1 }
    )
    gsap.fromTo(
      ".vila-header",
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 md:px-12">
          <p className="vila-header text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/70 mb-3">
            Portal Solar · Vilas
          </p>
          <h1 className="vila-header font-display text-[28px] sm:text-[36px] md:text-[44px] leading-none text-solar-text font-semibold tracking-tight">
            Vilas do Conhecimento
          </h1>
          <p className="vila-header text-[11px] font-mono text-solar-muted/50 mt-3 max-w-xl">
            Quatro domínios de saber organizados como vilas — cada uma com sua lógica e identidade.
          </p>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {VILAS.map((vila) => {
            const count = counts[vila.area] ?? 0
            const last  = lastByArea[vila.area]

            return (
              <Link
                key={vila.area}
                href={`/portal/vilas/${vila.area.toLowerCase()}?view=${vila.defaultView}`}
                className={`vila-card group block border ${vila.border} ${vila.hover} p-8 transition-all duration-300 opacity-0`}
              >
                {/* Top bar */}
                <div className={`h-px w-full ${vila.bar} mb-8 opacity-40 group-hover:opacity-80 transition-opacity`} />

                {/* Symbol + area */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50 mb-2">
                      Vila
                    </p>
                    <h2 className={`font-display text-[28px] leading-none font-semibold ${vila.color}`}>
                      {vila.label}
                    </h2>
                  </div>
                  <span className={`text-4xl ${vila.color} opacity-30 group-hover:opacity-60 transition-opacity font-mono`}>
                    {vila.symbol}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] font-mono text-solar-muted/55 leading-relaxed mb-8">
                  {vila.description}
                </p>

                {/* Footer stats */}
                <div className="flex items-end justify-between border-t border-solar-border/20 pt-4">
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/35 mb-1">
                      Itens
                    </p>
                    <p className={`text-[22px] font-mono font-bold ${vila.color} leading-none`}>
                      {count}
                    </p>
                  </div>
                  {last && (
                    <div className="text-right max-w-[60%]">
                      <p className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/30 mb-1">
                        Último adicionado
                      </p>
                      <p className="text-[9px] font-mono text-solar-muted/50 truncate">
                        {last}
                      </p>
                    </div>
                  )}
                </div>

                {/* View hint */}
                <p className="text-[8px] font-mono uppercase tracking-widest text-solar-muted/30 group-hover:text-solar-muted/60 transition-colors mt-4">
                  View padrão: {vila.defaultView} →
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
