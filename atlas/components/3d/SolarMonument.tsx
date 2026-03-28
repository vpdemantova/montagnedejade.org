"use client"

import dynamic     from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import useSWR      from "swr"
import { useRouter } from "next/navigation"
import { useSolarStore } from "@/atlas/lib/store"
import { ThreeDErrorBoundary } from "./ThreeDErrorBoundary"
import type { MonumentData, MonumentItem } from "./MonumentScene"

// SSR-safe R3F import
const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
)

const MonumentScene = dynamic(
  () => import("./MonumentScene").then((m) => m.MonumentScene),
  { ssr: false }
)

// ── Fetcher ───────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ── Size variants ─────────────────────────────────────────────────────────────

export type MonumentVariant = "home" | "monument" | "public" | "panel"

const VARIANT_STYLES: Record<MonumentVariant, string> = {
  home:     "w-full h-[60vh] min-h-[400px]",
  monument: "w-full h-screen",
  public:   "w-full h-[80vh] min-h-[500px]",
  panel:    "w-[300px] h-[300px]",
}

// ── Phase label ───────────────────────────────────────────────────────────────

function PhaseLabel({ total }: { total: number }) {
  const phase = total <= 50 ? 1 : total <= 200 ? 2 : 3
  const labels = ["", "Coluna de Luz", "Constelação Viva", "Arquitetura Navegável"]
  const label  = labels[phase]!

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
      <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-solar-muted/40">
        Fase {phase} · {label}
      </p>
      <p className="text-[7px] font-mono text-solar-muted/20">
        {total} {total === 1 ? "obra" : "obras"} no acervo
      </p>
    </div>
  )
}

// ── Enter Atlas CTA ───────────────────────────────────────────────────────────

function EnterAtlasCTA({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bottom-10 right-10 pointer-events-auto">
      <button
        onClick={onClick}
        className="
          px-5 py-2.5 border border-solar-amber/50
          text-[10px] font-mono uppercase tracking-[0.2em]
          text-solar-amber hover:bg-solar-amber/10
          transition-all duration-300
          backdrop-blur-sm bg-solar-deep/40
        "
      >
        Entrar no Atlas →
      </button>
    </div>
  )
}

// ── Stats overlay ─────────────────────────────────────────────────────────────

function StatsOverlay({ data }: { data: MonumentData }) {
  const areas = Object.entries(data.totalByArea)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const AREA_COLORS: Record<string, string> = {
    ACADEMIA:   "#C8A45A",
    ARTES:      "#E07854",
    COMPUTACAO: "#4A8FA8",
    AULAS:      "#5A8A6A",
    CULTURA:    "#9A6AAA",
    ATLAS:      "#A8B8C8",
  }

  return (
    <div className="absolute top-6 left-6 pointer-events-none">
      <div className="flex flex-col gap-1">
        {areas.map(([area, count]) => (
          <div key={area} className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: AREA_COLORS[area] ?? "#C8A45A" }}
            />
            <span className="text-[8px] font-mono text-solar-muted/40 uppercase tracking-wider">
              {area}
            </span>
            <span className="text-[8px] font-mono text-solar-muted/25">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function MonumentSkeleton({ className }: { className: string }) {
  return (
    <div className={`${className} bg-solar-void flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border border-solar-amber/20 animate-pulse" />
        <p className="text-[9px] font-mono text-solar-muted/30 uppercase tracking-widest">
          Carregando monumento...
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SolarMonument({
  variant = "home",
  showStats = false,
  showCTA   = false,
}: {
  variant?:   MonumentVariant
  showStats?: boolean
  showCTA?:   boolean
}) {
  const router   = useRouter()
  const setMode  = useSolarStore((s) => s.setMode)
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile,  setIsMobile]  = useState(false)

  // Check mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Pause SWR when tab hidden
  useEffect(() => {
    const onVisibility = () => setIsVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const { data, isLoading } = useSWR<MonumentData>(
    "/api/monument-data",
    fetcher,
    {
      refreshInterval:    isVisible ? 60_000 : 0,
      revalidateOnFocus:  false,
      dedupingInterval:   30_000,
    }
  )

  const handleItemClick = (item: MonumentItem) => {
    router.push(`/atlas/${item.slug ?? item.id}`)
  }

  const handleEnterAtlas = () => {
    setMode("ATLAS")
    router.push("/atlas")
  }

  const containerClass = `relative overflow-hidden ${VARIANT_STYLES[variant]}`

  if (isLoading || !data) {
    return <MonumentSkeleton className={containerClass} />
  }

  return (
    <div className={containerClass}>
      <ThreeDErrorBoundary fallback={<MonumentSkeleton className="w-full h-full" />}>
        <Canvas
          camera={{ position: [0, 8, 22], fov: 55 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, isMobile ? 1.5 : 2]}
        >
          <MonumentScene
            data={data}
            isMobile={isMobile}
            onItemClick={handleItemClick}
            onEnterAtlas={handleEnterAtlas}
          />
        </Canvas>
      </ThreeDErrorBoundary>

      {/* Overlay UI */}
      {showStats && <StatsOverlay data={data} />}
      <PhaseLabel total={data.total} />
      {showCTA && <EnterAtlasCTA onClick={handleEnterAtlas} />}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(13,13,15,0.7) 100%)",
        }}
      />
    </div>
  )
}
