"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import { SolarMonument } from "@/atlas/components/3d/SolarMonument"
import type { GlobeItem } from "./GlobeView"

const GlobeView = dynamic(
  () => import("./GlobeView").then((m) => m.GlobeView),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full flex items-center justify-center bg-[#07090e]"
        style={{ height: "60vh" }}
      >
        <div className="w-8 h-8 border border-solar-amber/20 rounded-full animate-pulse" />
      </div>
    ),
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

type WorldView = "constelacao" | "globo" | "mapa"

type Props = {
  items:      GlobeItem[]
  showStats?: boolean
  showCTA?:  boolean
}

// ── Area geographic anchors for 2D map ────────────────────────────────────────

const AREA_ANCHORS_2D: Record<string, { lon: number; lat: number; color: string; label: string }> = {
  ACADEMIA:   { lat: -22.9,  lon: -43.17,  color: "#C8A45A", label: "Academia" },
  ARTES:      { lat:  48.85, lon:   2.35,  color: "#E07854", label: "Artes" },
  CULTURA:    { lat: -23.55, lon: -46.63,  color: "#9A6AAA", label: "Cultura" },
  OBRAS:      { lat:  41.89, lon:  12.49,  color: "#A0B0C0", label: "Obras" },
  PESSOAS:    { lat:  51.5,  lon:  -0.12,  color: "#E8D080", label: "Pessoas" },
  COMPUTACAO: { lat:  37.77, lon: -122.41, color: "#4A8FA8", label: "Computação" },
  AULAS:      { lat:  52.52, lon:  13.4,   color: "#5A8A6A", label: "Aulas" },
  ATLAS:      { lat:  35.69, lon: 139.69,  color: "#C8A45A", label: "Atlas" },
}

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ── 2D Map view ────────────────────────────────────────────────────────────────

function MapView2D({ items }: { items: GlobeItem[] }) {
  const areaCount: Record<string, number> = {}
  for (const item of items) {
    areaCount[item.area] = (areaCount[item.area] ?? 0) + 1
  }

  return (
    <div
      className="w-full bg-[#07090e] border-b border-solar-border/10 overflow-hidden"
      style={{ height: "60vh", minHeight: 460 }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        style={{ width: "100%", height: "100%" }}
        projectionConfig={{ scale: 140 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#111820"
                stroke="#1a2a3a"
                strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover:   { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {Object.entries(AREA_ANCHORS_2D).map(([area, anchor]) => {
          const count = areaCount[area] ?? 0
          if (count === 0) return null
          const r = 4 + Math.sqrt(count) * 2.5
          return (
            <Marker key={area} coordinates={[anchor.lon, anchor.lat]}>
              <circle
                r={r}
                fill={anchor.color}
                fillOpacity={0.22}
                stroke={anchor.color}
                strokeWidth={1.2}
                strokeOpacity={0.7}
              />
              <circle r={3.5} fill={anchor.color} fillOpacity={0.9} />
              <text
                y={-r - 4}
                textAnchor="middle"
                fontSize={7}
                fill={anchor.color}
                fontFamily="IBM Plex Mono, monospace"
                letterSpacing="0.08em"
                style={{ textTransform: "uppercase" }}
              >
                {anchor.label}
              </text>
              <text
                y={-r - 14}
                textAnchor="middle"
                fontSize={9}
                fill="#ffffff"
                fontFamily="IBM Plex Mono, monospace"
                opacity={0.5}
              >
                {count}
              </text>
            </Marker>
          )
        })}
      </ComposableMap>
    </div>
  )
}

// ── Main WorldHero ─────────────────────────────────────────────────────────────

const VIEW_LABELS: Record<WorldView, string> = {
  constelacao: "Constelação",
  globo:       "Globo 3D",
  mapa:        "Mapa 2D",
}

export function WorldHero({ items, showStats, showCTA }: Props) {
  const [view, setView] = useState<WorldView>("constelacao")

  return (
    <div className="relative">
      {/* ── View toggle bar ── */}
      <div className="absolute top-4 right-5 z-30 flex items-center gap-px bg-solar-void/80 border border-solar-border/25 backdrop-blur-sm">
        {(["constelacao", "globo", "mapa"] as WorldView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`
              px-3 py-1.5 text-[8px] font-mono uppercase tracking-widest transition-all
              ${view === v
                ? "bg-solar-amber/15 text-solar-amber border-b border-solar-amber/40"
                : "text-solar-muted/45 hover:text-solar-muted"}
            `}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {/* ── Views ── */}
      {view === "constelacao" && (
        <SolarMonument variant="home" showStats={showStats} showCTA={showCTA} />
      )}
      {view === "globo" && (
        <div className="relative">
          <GlobeView items={items} />
          {/* HUD */}
          <div className="absolute bottom-4 left-5 pointer-events-none">
            <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/30">
              Portal Solar · {items.length} itens no Atlas
            </p>
          </div>
          <div className="absolute bottom-4 right-5 pointer-events-none">
            <p className="text-[7px] font-mono text-solar-muted/20 uppercase tracking-widest">
              Arraste · scroll zoom
            </p>
          </div>
        </div>
      )}
      {view === "mapa" && (
        <div className="relative">
          <MapView2D items={items} />
          <div className="absolute bottom-4 left-5 pointer-events-none">
            <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/30">
              Portal Solar · distribuição geográfica
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
