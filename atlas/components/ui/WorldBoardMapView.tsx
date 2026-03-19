"use client"

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import type { WorldNotice } from "@/atlas/types"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Map WorldNotice.area → approximate coords for demo
// In production these would come from metadata.location parsed as lat/lng
const AREA_COORDS: Record<string, [number, number]> = {
  ACADEMIA:   [-43.17, -22.9],   // Rio de Janeiro
  ARTES:      [2.35, 48.85],     // Paris
  CULTURA:    [-46.63, -23.55],  // São Paulo
  OBRAS:      [12.49, 41.89],    // Roma
  PESSOAS:    [-0.12, 51.5],     // Londres
  COMPUTACAO: [-122.41, 37.77],  // San Francisco
  AULAS:      [13.4, 52.52],     // Berlim
  ATLAS:      [0, 20],           // Centro
}

const TYPE_COLORS: Record<string, string> = {
  OBRA:       "#C8A45A",
  AVISO:      "#E05C5C",
  EVENTO:     "#4A6C7C",
  DESCOBERTA: "#7CFC6A",
  HOMENAGEM:  "#8A8678",
  CITACAO:    "#4A4A6A",
}

export function WorldBoardMapView({
  notices,
  onSelect,
}: {
  notices:  WorldNotice[]
  onSelect: (n: WorldNotice) => void
}) {
  const withCoords = notices.map((n) => ({
    notice: n,
    coords: AREA_COORDS[n.area] ?? ([Math.random() * 360 - 180, Math.random() * 120 - 60] as [number, number]),
  }))

  return (
    <div className="border border-solar-border/15 bg-solar-deep/20 overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "500px" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: unknown[] }) =>
            geographies.map((geo) => (
              <Geography
                key={(geo as { rsmKey: string }).rsmKey}
                geography={geo}
                fill="#1C1C26"
                stroke="#2A2A3A"
                strokeWidth={0.5}
                style={{
                  default:  { outline: "none" },
                  hover:    { fill: "#22222E", outline: "none" },
                  pressed:  { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {withCoords.map(({ notice, coords }) => (
          <Marker key={notice.id} coordinates={coords}>
            <circle
              r={notice.isPinned ? 7 : 4}
              fill={TYPE_COLORS[notice.type] ?? "#4A4A5A"}
              fillOpacity={0.85}
              stroke="#0D0D0F"
              strokeWidth={1}
              onClick={() => onSelect(notice)}
              style={{ cursor: "pointer" }}
            />
            <title>{notice.title}</title>
          </Marker>
        ))}
      </ComposableMap>

      <div className="px-4 py-2 border-t border-solar-border/15 flex flex-wrap gap-3">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[8px] font-mono text-solar-muted/40 uppercase">{type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
