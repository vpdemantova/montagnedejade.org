"use client"

import { useEffect, useState, useCallback } from "react"

const ENERGY = [
  { value: 1, label: "Exausto",    color: "#E05C5C" },
  { value: 2, label: "Pesado",     color: "#A07060" },
  { value: 3, label: "Equilibrado",color: "#8A8678" },
  { value: 4, label: "Energizado", color: "#C8A45A" },
  { value: 5, label: "Pleno",      color: "#39FF14" },
]

type JournalMeta = {
  date:      string
  energy:    number
  intention: string | null
  mood:      string | null
}

export function JournalMetaBar({ date }: { date: string }) {
  const [meta,       setMeta]       = useState<JournalMeta | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [intention,  setIntention]  = useState("")
  const [mood,       setMood]       = useState("")
  const [energy,     setEnergy]     = useState(3)

  useEffect(() => {
    fetch(`/api/compass/journal?date=${date}`)
      .then((r) => r.ok ? r.json() as Promise<JournalMeta | null> : null)
      .then((data) => {
        if (data) {
          setMeta(data)
          setEnergy(data.energy)
          setIntention(data.intention ?? "")
          setMood(data.mood ?? "")
        }
      })
      .catch(() => {})
  }, [date])

  const save = useCallback(async (patch: Partial<{ energy: number; intention: string; mood: string }>) => {
    setSaving(true)
    try {
      await fetch("/api/compass/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...patch }),
      })
    } finally {
      setSaving(false)
    }
  }, [date])

  const handleEnergy = (v: number) => {
    setEnergy(v)
    void save({ energy: v, intention, mood })
  }

  const handleIntentionBlur = () => {
    void save({ energy, intention, mood })
  }

  const handleMoodBlur = () => {
    void save({ energy, intention, mood })
  }

  const current = ENERGY.find((e) => e.value === energy) ?? ENERGY[2]!

  return (
    <div className="border-b border-compass-neon/10 bg-compass-neon/3 px-4 sm:px-12 py-4">
      <div className="max-w-4xl mx-auto flex flex-wrap items-start gap-8">

        {/* Energy selector */}
        <div className="flex-shrink-0">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-2">Energia</p>
          <div className="flex items-center gap-1.5">
            {ENERGY.map((e) => (
              <button
                key={e.value}
                onClick={() => handleEnergy(e.value)}
                title={e.label}
                className={`
                  w-6 h-6 rounded-full border-2 transition-all duration-150 relative group
                  ${energy === e.value ? "scale-110 border-opacity-100" : "border-opacity-30 opacity-50 hover:opacity-75"}
                `}
                style={{
                  borderColor: e.color,
                  background:  energy === e.value ? e.color + "33" : "transparent",
                }}
              >
                <span
                  className="absolute -top-7 left-1/2 -translate-x-1/2 text-[7px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ color: e.color }}
                >
                  {e.label}
                </span>
              </button>
            ))}
            <span className="text-[9px] font-mono ml-1" style={{ color: current.color }}>
              {current.label}
            </span>
          </div>
        </div>

        {/* Intention */}
        <div className="flex-1 min-w-[160px]">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-2">Intenção do dia</p>
          <input
            type="text"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            onBlur={handleIntentionBlur}
            placeholder="O que quero realizar hoje…"
            className="w-full bg-transparent border-b border-solar-border/20 focus:border-compass-neon/40 outline-none text-[11px] font-mono text-solar-text/80 placeholder:text-solar-muted/25 py-0.5 transition-colors"
          />
        </div>

        {/* Mood */}
        <div className="flex-1 min-w-[120px]">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-2">Humor</p>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            onBlur={handleMoodBlur}
            placeholder="Como estou me sentindo…"
            className="w-full bg-transparent border-b border-solar-border/20 focus:border-compass-neon/40 outline-none text-[11px] font-mono text-solar-text/80 placeholder:text-solar-muted/25 py-0.5 transition-colors"
          />
        </div>

        {saving && (
          <div className="flex-shrink-0 self-end pb-0.5">
            <span className="text-[8px] font-mono text-compass-neon/40 animate-pulse">salvando…</span>
          </div>
        )}
      </div>
    </div>
  )
}
