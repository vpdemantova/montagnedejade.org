"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import dynamic  from "next/dynamic"
import Link     from "next/link"

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default),
  { ssr: false }
)

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeItem = {
  id:    string
  title: string
  type:  string
  area:  string
}

type RelationEdge = {
  id:           string
  fromItemId:   string
  toItemId:     string
  relationType: string
}

type GraphNode = NodeItem & { x?: number; y?: number; vx?: number; vy?: number }

type GraphLink = {
  source: string | GraphNode
  target: string | GraphNode
  relationType: string
}

// ── Area colors ───────────────────────────────────────────────────────────────

const AREA_COLORS: Record<string, string> = {
  ACADEMIA:   "#C8A45A",
  ARTES:      "#E07854",
  COMPUTACAO: "#4A8FA8",
  AULAS:      "#5A8A6A",
  CULTURA:    "#9A6AAA",
  OBRAS:      "#C87850",
  ATLAS:      "#A8B8C8",
  PESSOAS:    "#6B8C9A",
  DIARIO:     "#39FF14",
  NOTAS:      "#39FF1488",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RelationGraphClient() {
  const [nodes,    setNodes]    = useState<GraphNode[]>([])
  const [links,    setLinks]    = useState<GraphLink[]>([])
  const [loading,  setLoading]  = useState(true)
  const [hovered,  setHovered]  = useState<GraphNode | null>(null)
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const containerRef            = useRef<HTMLDivElement>(null)
  const [dims, setDims]         = useState({ w: 800, h: 600 })

  useEffect(() => {
    Promise.all([
      fetch("/api/atlas?limit=1000").then((r) => r.json() as Promise<NodeItem[]>),
      fetch("/api/monument-data").then((r) => r.json() as Promise<{ relations: RelationEdge[] }>),
    ]).then(([items, { relations }]) => {
      const nodeIds = new Set(items.map((i) => i.id))
      const validLinks = relations
        .filter((r) => nodeIds.has(r.fromItemId) && nodeIds.has(r.toItemId))
        .map((r) => ({
          source:       r.fromItemId,
          target:       r.toItemId,
          relationType: r.relationType,
        }))

      // Only include nodes that have at least one relation
      const connectedIds = new Set<string>()
      validLinks.forEach((l) => {
        connectedIds.add(l.source as string)
        connectedIds.add(l.target as string)
      })

      const connectedNodes = items.filter((i) => connectedIds.has(i.id))

      setNodes(connectedNodes)
      setLinks(validLinks)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      if (e) setDims({ w: e.contentRect.width, h: Math.max(500, e.contentRect.width * 0.65) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-0">
        <div className="max-w-6xl mx-auto px-12">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/atlas" className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50 hover:text-solar-amber transition-solar">
              Atlas
            </Link>
            <span className="text-[9px] font-mono text-solar-muted/25">›</span>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/70">
              Grafo de Relações
            </p>
          </div>
          <div className="flex items-end justify-between pb-5">
            <div>
              <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
                Grafo
              </h1>
              <p className="text-solar-muted/70 text-xs font-mono mt-2">
                {nodes.length} itens · {links.length} conexões
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pb-1">
              {Object.entries(AREA_COLORS).slice(0, 6).map(([area, color]) => (
                <div key={area} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[7px] font-mono text-solar-muted/40 uppercase">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Selected item panel */}
      {selected && (
        <div className="relative z-10 max-w-6xl mx-auto px-12 py-3">
          <div className="flex items-center gap-4 px-4 py-3 border border-solar-amber/20 bg-solar-amber/5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: AREA_COLORS[selected.area] ?? "#C8A45A" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono text-solar-text/80 truncate">{selected.title}</p>
              <p className="text-[8px] font-mono text-solar-muted/40">{selected.area} · {selected.type}</p>
            </div>
            <Link
              href={`/atlas/${selected.id}`}
              className="text-[9px] font-mono text-solar-amber/60 hover:text-solar-amber transition-colors flex-shrink-0"
            >
              Abrir →
            </Link>
            <button
              onClick={() => setSelected(null)}
              className="text-[9px] font-mono text-solar-muted/30 hover:text-solar-muted transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Graph */}
      <div ref={containerRef} className="relative z-10 max-w-6xl mx-auto px-12 pb-24">
        {loading ? (
          <div
            className="flex items-center justify-center border border-dashed border-solar-border/15"
            style={{ height: 500 }}
          >
            <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse uppercase tracking-widest">
              Carregando grafo...
            </p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-solar-border/15" style={{ height: 500 }}>
            <p className="text-[9px] font-mono text-solar-muted/30 uppercase tracking-widest">Nenhuma relação criada ainda</p>
            <p className="text-[9px] font-mono text-solar-muted/20 text-center max-w-xs">
              Abra qualquer item no Atlas e use o painel de Relações para conectá-los.
            </p>
            <Link href="/atlas" className="text-[9px] font-mono text-solar-amber/50 hover:text-solar-amber transition-colors">
              → Ir ao Atlas
            </Link>
          </div>
        ) : (
          <div
            className="border border-solar-border/15 bg-solar-void overflow-hidden"
            style={{ height: dims.h }}
          >
            <ForceGraph2D
              width={dims.w}
              height={dims.h}
              graphData={{ nodes, links }}
              backgroundColor="#0D0D0F"
              nodeLabel="title"
              nodeColor={(node) => AREA_COLORS[(node as GraphNode).area] ?? "#C8A45A"}
              nodeVal={4}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n     = node as GraphNode
                const x     = n.x ?? 0
                const y     = n.y ?? 0
                const r     = 5
                const isHov = hovered?.id === n.id
                const isSel = selected?.id === n.id
                const color = AREA_COLORS[n.area] ?? "#C8A45A"

                if (isHov || isSel) {
                  ctx.beginPath()
                  ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
                  const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5)
                  grad.addColorStop(0, color + "50")
                  grad.addColorStop(1, "transparent")
                  ctx.fillStyle = grad
                  ctx.fill()
                }

                ctx.beginPath()
                ctx.arc(x, y, r, 0, Math.PI * 2)
                ctx.fillStyle = color + (isSel ? "FF" : isHov ? "EE" : "99")
                ctx.fill()

                if (isHov || isSel || globalScale > 1.8) {
                  const fontSize = 9 / globalScale
                  ctx.font      = `${fontSize}px IBM Plex Mono, monospace`
                  ctx.fillStyle = isHov || isSel ? "#E8E4DC" : "#8A8678"
                  ctx.textAlign = "center"
                  ctx.fillText(n.title.slice(0, 22), x, y + r + fontSize + 1)
                }
              }}
              linkColor={() => "rgba(200,164,90,0.12)"}
              linkWidth={1}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={() => "rgba(200,164,90,0.3)"}
              linkLabel={(link) => (link as GraphLink).relationType}
              onNodeHover={(node) => setHovered(node ? (node as GraphNode) : null)}
              onNodeClick={(node) => setSelected((prev) => prev?.id === (node as GraphNode).id ? null : (node as GraphNode))}
              cooldownTicks={100}
              d3AlphaDecay={0.015}
            />
          </div>
        )}
      </div>
    </div>
  )
}
