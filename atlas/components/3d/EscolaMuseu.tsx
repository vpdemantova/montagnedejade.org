"use client"

import { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Link from "next/link"
import { EscolaScene, CAMERA_PRESETS } from "./EscolaScene"
import type { PresetKey } from "./EscolaScene"

type ArtesItem = { id: string; metadata?: string | null }

const FALLBACK_COLORS = [
  "#C8A45A","#E07854","#4A8FA8","#6E56CF","#5A8A6A",
  "#9A6AAA","#39FF14","#E8D080","#FF6090","#60C0A0",
  "#3A7AC8","#D87040","#8050A0","#50A870","#C04060","#A0B0C0",
  "#D0A830","#7090D0","#A05050","#70B090",
]

function extractColor(metadata?: string | null): string | null {
  if (!metadata) return null
  try {
    const m = JSON.parse(metadata) as Record<string, unknown>
    return (m.accentColor ?? m.color ?? null) as string | null
  } catch { return null }
}

const PRESET_ORDER: PresetKey[] = [
  "livre","fachada","topo","interior","jardim","galeria","campo","lateral","angular"
]

export function EscolaMuseu() {
  const [colors, setColors] = useState<string[]>(FALLBACK_COLORS)
  const [preset, setPreset] = useState<PresetKey>("livre")
  const [isDia, setIsDia] = useState(false)

  useEffect(() => {
    fetch("/api/atlas?area=ARTES&limit=20")
      .then((r) => r.json() as Promise<ArtesItem[]>)
      .then((items) => {
        const extracted = items
          .map((it) => extractColor(it.metadata))
          .filter(Boolean) as string[]
        if (extracted.length >= 4) setColors([...extracted, ...FALLBACK_COLORS].slice(0, 20))
      })
      .catch(() => {})
  }, [])

  return (
    <div
      className="relative w-full border border-solar-border/20 overflow-hidden"
      style={{ height: "72vh", minHeight: 500 }}
    >
      <Canvas
        camera={{ position: [20, 12, 22], fov: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        shadows
        performance={{ min: 0.5 }}
      >
        <EscolaScene paintingColors={colors} preset={preset} isDia={isDia} />
      </Canvas>

      {/* ── Camera preset bar ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-solar-void/80 border border-solar-border/30 px-2 py-1.5 backdrop-blur-sm">
        {PRESET_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={`
              px-2.5 py-1 text-[8px] font-mono uppercase tracking-widest transition-all
              ${preset === key
                ? "bg-solar-amber/20 text-solar-amber border border-solar-amber/40"
                : "text-solar-muted/45 hover:text-solar-muted border border-transparent"}
            `}
          >
            {CAMERA_PRESETS[key].label}
          </button>
        ))}

        {/* Day/night divider + toggle */}
        <div className="w-px h-4 bg-solar-border/30 mx-1" />
        <button
          onClick={() => setIsDia((v) => !v)}
          className={`
            px-2.5 py-1 text-[8px] font-mono uppercase tracking-widest transition-all
            ${isDia
              ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40"
              : "text-solar-muted/45 hover:text-solar-muted border border-transparent"}
          `}
        >
          {isDia ? "☀ Dia" : "☽ Noite"}
        </button>
      </div>

      {/* ── HUD info ── */}
      <div className="absolute top-16 left-5 pointer-events-none">
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/35">
          Portal Solar · Escola das Artes
        </p>
      </div>

      <div className="absolute bottom-5 right-5 pointer-events-none">
        <p className="text-[7px] font-mono text-solar-muted/25 uppercase tracking-widest">
          Arraste · scroll zoom
        </p>
      </div>

      <div className="absolute bottom-5 left-5">
        <Link
          href="/portal/cultura"
          className="text-[9px] font-mono uppercase tracking-widest text-solar-amber/60 hover:text-solar-amber transition-solar border border-solar-amber/20 px-3 py-1.5 hover:bg-solar-amber/5"
        >
          Entrar na Cultura →
        </Link>
      </div>
    </div>
  )
}
