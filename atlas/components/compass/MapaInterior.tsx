"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"

// ── Types ─────────────────────────────────────────────────────────────────────

type ThemeNode = {
  id:       string
  label:    string
  count:    number
  group:    "tag" | "area" | "person" | "value"
  color:    string
}

type ThemeLink = {
  source: string
  target: string
  strength: number
}

type GraphData = {
  nodes: ThemeNode[]
  links: ThemeLink[]
}

type CompassItem = {
  id:       string
  title:    string
  area:     string
  tags:     { id: string; name: string }[]
}

// ── Color by group ────────────────────────────────────────────────────────────

const GROUP_COLORS: Record<string, string> = {
  tag:    "#39FF14",   // compass-neon
  area:   "#C8A45A",   // solar-amber
  person: "#E07854",
  value:  "#9A6AAA",
}

// Personal values seed — shown as initial anchors
const PERSONAL_VALUES = [
  "Criatividade", "Profundidade", "Conexão", "Beleza", "Liberdade",
]

// ── Build graph from Compass items ───────────────────────────────────────────

function buildGraph(items: CompassItem[]): GraphData {
  const tagCount  = new Map<string, number>()
  const areaCount = new Map<string, number>()
  const coTags    = new Map<string, number>() // "tagA|tagB" → count

  items.forEach((item) => {
    areaCount.set(item.area, (areaCount.get(item.area) ?? 0) + 1)
    item.tags.forEach((t) => {
      tagCount.set(t.name, (tagCount.get(t.name) ?? 0) + 1)
    })
    // Co-occurrence links
    for (let i = 0; i < item.tags.length; i++) {
      for (let j = i + 1; j < item.tags.length; j++) {
        const key = [item.tags[i]!.name, item.tags[j]!.name].sort().join("|")
        coTags.set(key, (coTags.get(key) ?? 0) + 1)
      }
    }
  })

  const nodes: ThemeNode[] = []
  const links: ThemeLink[] = []

  // Personal values as anchors
  PERSONAL_VALUES.forEach((v) => {
    nodes.push({ id: `value:${v}`, label: v, count: 3, group: "value", color: GROUP_COLORS.value! })
  })

  // Tags with count > 0
  tagCount.forEach((count, name) => {
    nodes.push({ id: `tag:${name}`, label: name, count, group: "tag", color: GROUP_COLORS.tag! })
  })

  // Areas
  areaCount.forEach((count, area) => {
    nodes.push({ id: `area:${area}`, label: area, count, group: "area", color: GROUP_COLORS.area! })
  })

  // Co-occurrence links between tags
  coTags.forEach((strength, key) => {
    const [a, b] = key.split("|")
    if (a && b) {
      links.push({ source: `tag:${a}`, target: `tag:${b}`, strength })
    }
  })

  // Tag → area links (via items)
  items.forEach((item) => {
    item.tags.forEach((t) => {
      const key = `tag:${t.name}|area:${item.area}`
      if (!links.some((l) => `${l.source}|${l.target}` === key)) {
        links.push({ source: `tag:${t.name}`, target: `area:${item.area}`, strength: 1 })
      }
    })
  })

  // Connect tags to nearest value heuristically (first match by label overlap)
  tagCount.forEach((_, tagName) => {
    PERSONAL_VALUES.forEach((v) => {
      if (tagName.toLowerCase().includes(v.toLowerCase().slice(0, 4))) {
        links.push({ source: `tag:${tagName}`, target: `value:${v}`, strength: 2 })
      }
    })
  })

  return { nodes, links }
}

// ── Dynamic force graph (SSR-safe) ────────────────────────────────────────────

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default),
  { ssr: false }
)

// ── Legend ────────────────────────────────────────────────────────────────────

function Legend() {
  const items = [
    { color: GROUP_COLORS.value!,  label: "Valores pessoais" },
    { color: GROUP_COLORS.tag!,    label: "Tags do diário"   },
    { color: GROUP_COLORS.area!,   label: "Áreas de estudo"  },
    { color: GROUP_COLORS.person!, label: "Pessoas"          },
  ]
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: it.color }} />
          <span className="text-[8px] font-mono text-solar-muted/40">{it.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function MapaInterior() {
  const [items,     setItems]     = useState<CompassItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [hovered,   setHovered]   = useState<ThemeNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 600, h: 400 })

  useEffect(() => {
    // Fetch Compass items (diário + notas)
    Promise.all([
      fetch("/api/atlas?area=DIARIO&limit=200").then((r) => r.json()),
      fetch("/api/atlas?area=NOTAS&limit=200").then((r) => r.json()),
    ]).then(([diario, notas]) => {
      const all = [...(diario as CompassItem[]), ...(notas as CompassItem[])]
      setItems(all)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      if (e) setDims({ w: e.contentRect.width, h: Math.max(400, e.contentRect.width * 0.6) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const graphData = useMemo(() => buildGraph(items), [items])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse uppercase tracking-widest">
          Construindo mapa interior...
        </p>
      </div>
    )
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-solar-border/15 gap-3">
        <p className="text-[9px] font-mono text-solar-muted/30 uppercase tracking-widest">
          Nenhum dado ainda
        </p>
        <p className="text-[9px] font-mono text-solar-muted/20 text-center max-w-xs">
          Escreva no Diário e adicione tags — o mapa se forma automaticamente.
        </p>
        <Link href="/compass/diario" className="text-[9px] font-mono text-compass-neon/50 hover:text-compass-neon transition-colors">
          → Abrir Diário
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/50">
          Mapa Interior · Constelação de Temas
        </p>
        <Legend />
      </div>

      {hovered && (
        <div className="flex items-center gap-3 px-3 py-2 border border-solar-border/20 bg-solar-deep/30">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: hovered.color }} />
          <span className="text-[10px] font-mono text-solar-text/80">{hovered.label}</span>
          <span className="text-[9px] font-mono text-solar-muted/40">
            {hovered.group} · {hovered.count} ocorrência{hovered.count !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="border border-solar-border/20 bg-solar-void overflow-hidden"
        style={{ height: dims.h }}
      >
        <ForceGraph2D
          width={dims.w}
          height={dims.h}
          graphData={graphData}
          backgroundColor="#0D0D0F"
          nodeLabel="label"
          nodeVal={(node) => (node as ThemeNode).count * 2}
          nodeColor={(node) => (node as ThemeNode).color}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n      = node as ThemeNode & { x?: number; y?: number }
            const x      = n.x ?? 0
            const y      = n.y ?? 0
            const r      = Math.max(3, Math.sqrt(n.count) * 4)
            const isHov  = hovered?.id === n.id

            // Glow
            if (isHov) {
              ctx.beginPath()
              ctx.arc(x, y, r * 2, 0, Math.PI * 2)
              const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2)
              grad.addColorStop(0, n.color + "40")
              grad.addColorStop(1, "transparent")
              ctx.fillStyle = grad
              ctx.fill()
            }

            // Node circle
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fillStyle = n.color + (isHov ? "FF" : "CC")
            ctx.fill()

            // Label
            const fontSize = Math.max(8, Math.min(13, r * 1.4)) / globalScale
            ctx.font = `${fontSize}px IBM Plex Mono, monospace`
            ctx.fillStyle = isHov ? "#E8E4DC" : "#8A8678"
            ctx.textAlign = "center"
            ctx.fillText(n.label, x, y + r + fontSize + 1)
          }}
          linkColor={() => "rgba(200,164,90,0.08)"}
          linkWidth={(link) => Math.max(0.5, ((link as ThemeLink).strength ?? 1) * 0.5)}
          onNodeHover={(node) => setHovered(node ? (node as ThemeNode) : null)}
          cooldownTicks={80}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>
    </div>
  )
}
