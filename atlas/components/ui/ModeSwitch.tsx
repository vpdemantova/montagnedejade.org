"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSolarStore, type InterfaceMode } from "@/atlas/lib/store"

// ── Mode definitions ──────────────────────────────────────────────────────────

const MODES: {
  id:       InterfaceMode
  symbol:   string
  label:    string
  hint:     string
  shortcut: string
  color:    string
}[] = [
  {
    id:       "FOCUS",
    symbol:   "✍",
    label:    "Foco",
    hint:     "Editor limpo e centralizado",
    shortcut: "⌘⇧F",
    color:    "text-solar-text/70",
  },
  {
    id:       "CONTEMPLATION",
    symbol:   "📖",
    label:    "Contemplação",
    hint:     "Leitura imersiva com tipografia ampliada",
    shortcut: "⌘⇧C",
    color:    "text-[#C8A45A]",
  },
  {
    id:       "ATLAS",
    symbol:   "⬡",
    label:    "Atlas",
    hint:     "Interface completa de exploração",
    shortcut: "⌘⇧A",
    color:    "text-solar-amber",
  },
  {
    id:       "PUBLIC",
    symbol:   "🌐",
    label:    "Público",
    hint:     "Visão de visitante — sem ferramentas",
    shortcut: "⌘⇧P",
    color:    "text-[#4A6C7C]",
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

export function ModeSwitch() {
  const { mode, setMode } = useSolarStore()
  const [hovered, setHovered] = useState<InterfaceMode | null>(null)
  const [expanded, setExpanded] = useState(false)

  const current = MODES.find((m) => m.id === mode)!

  return (
    <div className="fixed bottom-24 right-5 z-[60] flex flex-col items-end gap-2">

      {/* Mode buttons — appear when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="flex flex-col items-end gap-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            {MODES.map((m, i) => (
              <motion.div
                key={m.id}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.04, duration: 0.15 }}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {hovered === m.id && (
                    <motion.div
                      className="bg-solar-deep border border-solar-border/40 px-3 py-1.5 shadow-lg"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.12 }}
                    >
                      <p className="text-[9px] font-mono text-solar-text/80 whitespace-nowrap">{m.hint}</p>
                      <p className="text-[7px] font-mono text-solar-muted/40 mt-0.5">{m.shortcut}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mode button */}
                <button
                  onClick={() => { setMode(m.id); setExpanded(false) }}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    w-9 h-9 flex items-center justify-center border transition-all duration-200
                    ${mode === m.id
                      ? "bg-solar-surface border-solar-amber/50 shadow-[0_0_12px_rgba(200,164,90,0.2)]"
                      : "bg-solar-deep/80 border-solar-border/30 hover:border-solar-border/60"}
                  `}
                >
                  <span className={`text-base leading-none ${mode === m.id ? m.color : "text-solar-muted/50"}`}>
                    {m.symbol}
                  </span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button — shows current mode */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`
          w-9 h-9 flex items-center justify-center border transition-all duration-200
          bg-solar-deep/90 backdrop-blur-sm
          ${expanded
            ? "border-solar-amber/50 text-solar-amber"
            : "border-solar-border/40 text-solar-muted/50 hover:border-solar-border/70 hover:text-solar-muted"}
        `}
        title={`Modo: ${current.label}`}
      >
        <span className="text-sm leading-none">{current.symbol}</span>
      </button>

      {/* Active mode label */}
      <AnimatePresence>
        {!expanded && (
          <motion.p
            className="text-[7px] font-mono uppercase tracking-widest text-solar-muted/30 text-right"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {current.label}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
