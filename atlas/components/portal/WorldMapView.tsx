"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import type { AtlasItemWithTags } from "@/atlas/types"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ── City → coordinate lookup ──────────────────────────────────────────────────

const CITY_COORDS: Record<string, [number, number]> = {
  // Brasil
  "rio de janeiro": [-43.17, -22.9],
  "são paulo":      [-46.63, -23.55],
  "sp":             [-46.63, -23.55],
  "rj":             [-43.17, -22.9],
  "brasília":       [-47.93, -15.78],
  "salvador":       [-38.51, -12.97],
  "fortaleza":      [-38.54, -3.72],
  "recife":         [-34.88, -8.05],
  "porto alegre":   [-51.23, -30.03],
  "belo horizonte": [-43.94, -19.92],
  "manaus":         [-60.02, -3.10],
  "curitiba":       [-49.27, -25.43],
  // Europa
  "paris":          [2.35, 48.85],
  "roma":           [12.49, 41.89],
  "rome":           [12.49, 41.89],
  "london":         [-0.12, 51.5],
  "londres":        [-0.12, 51.5],
  "berlim":         [13.4, 52.52],
  "berlin":         [13.4, 52.52],
  "madrid":         [-3.7, 40.42],
  "barcelona":      [2.17, 41.38],
  "amsterdam":      [4.9, 52.37],
  "vienna":         [16.37, 48.2],
  "viena":          [16.37, 48.2],
  "praga":          [14.42, 50.09],
  "prague":         [14.42, 50.09],
  "atenas":         [23.73, 37.98],
  "athens":         [23.73, 37.98],
  "lisboa":         [-9.14, 38.72],
  "lisbon":         [-9.14, 38.72],
  // Américas
  "new york":       [-74.0, 40.71],
  "nova york":      [-74.0, 40.71],
  "los angeles":    [-118.24, 34.05],
  "chicago":        [-87.63, 41.85],
  "san francisco":  [-122.41, 37.77],
  "washington":     [-77.04, 38.9],
  "mexico city":    [-99.13, 19.43],
  "buenos aires":   [-58.38, -34.6],
  "lima":           [-77.03, -12.04],
  "bogotá":         [-74.07, 4.71],
  "santiago":       [-70.65, -33.46],
  // Ásia / Oriente
  "tokyo":          [139.69, 35.68],
  "tóquio":         [139.69, 35.68],
  "beijing":        [116.39, 39.91],
  "pequim":         [116.39, 39.91],
  "shanghai":       [121.47, 31.23],
  "mumbai":         [72.88, 19.07],
  "delhi":          [77.21, 28.63],
  "dubai":          [55.27, 25.2],
  "istanbul":       [28.95, 41.01],
  "istambul":       [28.95, 41.01],
  "cairo":          [31.24, 30.04],
  // África
  "nairobi":        [36.82, -1.29],
  "lagos":          [3.4, 6.45],
  "accra":          [-0.2, 5.56],
}

function resolveCoords(location: string): [number, number] | null {
  if (!location) return null

  // Try "lat,lng" format
  const parts = location.split(",").map((s) => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0]!) && !isNaN(parts[1]!)) {
    return [parts[1]!, parts[0]!] // [lng, lat]
  }

  // Try city name lookup
  const key = location.toLowerCase().trim()
  return CITY_COORDS[key] ?? null
}

function parseMetadata(raw?: string | null): Record<string, unknown> {
  try { return JSON.parse(raw ?? "{}") } catch { return {} }
}

// ── Area color map ─────────────────────────────────────────────────────────────

const AREA_COLORS: Record<string, string> = {
  ACADEMIA:   "#C8A45A",
  ARTES:      "#E07854",
  COMPUTACAO: "#4A8FA8",
  AULAS:      "#5A8A6A",
  CULTURA:    "#9A6AAA",
  OBRAS:      "#C87850",
  ATLAS:      "#A8B8C8",
  PESSOAS:    "#6B8C9A",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WorldMapView({
  items,
  onItemClick,
}: {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  const markers = items
    .map((item) => {
      const meta     = parseMetadata(item.metadata)
      const location = (meta.location as string) ?? ""
      const coords   = resolveCoords(location)
      return coords ? { item, coords, location } : null
    })
    .filter(Boolean) as { item: AtlasItemWithTags; coords: [number, number]; location: string }[]

  const unmapped = items.length - markers.length

  return (
    <div className="flex flex-col gap-3">
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
                  fill="#1A1A26"
                  stroke="#2A2A3A"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover:   { fill: "#222234", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map(({ item, coords }) => {
            const isHov  = hovered === item.id
            const color  = AREA_COLORS[item.area] ?? "#C8A45A"
            return (
              <Marker
                key={item.id}
                coordinates={coords}
              >
                <circle
                  r={isHov ? 9 : 5}
                  fill={color}
                  fillOpacity={isHov ? 1 : 0.75}
                  stroke="rgb(232, 224, 208)"
                  strokeWidth={1.5}
                  onClick={() => onItemClick(item)}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", transition: "r 0.15s" }}
                />
                {isHov && (
                  <foreignObject x={10} y={-18} width={160} height={50}>
                    <div
                      style={{
                        background:  "rgba(13,13,15,0.92)",
                        border:      "1px solid rgba(200,164,90,0.35)",
                        padding:     "3px 7px",
                        fontFamily:  "IBM Plex Mono, monospace",
                        fontSize:    "9px",
                        color:       "#E8E4DC",
                        whiteSpace:  "nowrap",
                        pointerEvents: "none",
                      }}
                    >
                      {item.title}
                    </div>
                  </foreignObject>
                )}
              </Marker>
            )
          })}
        </ComposableMap>

        {/* Legend */}
        <div className="px-4 py-2 border-t border-solar-border/15 flex items-center flex-wrap gap-3">
          {Object.entries(AREA_COLORS).map(([area, color]) => (
            <div key={area} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[8px] font-mono text-solar-muted/40 uppercase">{area}</span>
            </div>
          ))}
        </div>
      </div>

      {unmapped > 0 && (
        <p className="text-[8px] font-mono text-solar-muted/30 text-right">
          {unmapped} {unmapped === 1 ? "obra sem" : "obras sem"} localização definida — adicione{" "}
          <code className="text-solar-amber/50">location</code> nos metadados
        </p>
      )}
    </div>
  )
}
