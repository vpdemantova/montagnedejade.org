"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_COLORS, AREA_LABELS } from "@/atlas/types"

// react-force-graph-2d usa APIs de browser — carregamento dinâmico obrigatório
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((m) => m.default),
  { ssr: false }
)

type Node = { id: string; name: string; area: string; val: number }
type Link = { source: string; target: string; type: string }
type GraphData = { nodes: Node[]; links: Link[] }

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

export function AtlasMapView({ items, onItemClick }: Props) {
  const containerRef             = useRef<HTMLDivElement>(null)
  const [dimensions, setDim]     = useState({ w: 800, h: 500 })
  const [graph, setGraph]        = useState<GraphData>({ nodes: [], links: [] })
  const [loading, setLoading]    = useState(true)
  const itemMap                  = useRef<Map<string, AtlasItemWithTags>>(new Map())

  // Mede o container
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setDim({ w: entry.contentRect.width, h: Math.max(400, entry.contentRect.height) })
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Monta o grafo com as relações do banco
  useEffect(() => {
    const map = new Map<string, AtlasItemWithTags>()
    items.forEach((i) => map.set(i.id, i))
    itemMap.current = map

    const nodes: Node[] = items.map((i) => ({
      id:   i.id,
      name: i.title,
      area: i.area,
      val:  1 + i.tags.length * 0.5,
    }))

    // Carrega relações de todos os itens via API em batch
    Promise.all(
      items.map((i) =>
        fetch(`/api/atlas/${i.id}/relations`)
          .then((r) => r.json() as Promise<{ fromItemId: string; toItemId: string; relationType: string }[]>)
          .catch(() => [])
      )
    ).then((allRelations) => {
      const seen = new Set<string>()
      const links: Link[] = []

      allRelations.flat().forEach((rel) => {
        const key = `${rel.fromItemId}__${rel.toItemId}`
        if (!seen.has(key)) {
          seen.add(key)
          links.push({ source: rel.fromItemId, target: rel.toItemId, type: rel.relationType })
        }
      })

      setGraph({ nodes, links })
      setLoading(false)
    })
  }, [items])

  const handleNodeClick = (node: unknown) => {
    const n = node as Node
    const item = itemMap.current.get(n.id)
    if (item) onItemClick(item)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border border-solar-border/20">
        <p className="text-[9px] font-mono text-solar-muted/35 uppercase tracking-widest animate-pulse">
          Carregando grafo…
        </p>
      </div>
    )
  }

  return (
    <div className="border border-solar-border/20 bg-solar-void overflow-hidden">
      <div className="px-5 py-3 border-b border-solar-border/20 flex items-center justify-between">
        <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/65">
          Atlas Map · {graph.nodes.length} nós · {graph.links.length} relações
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {Array.from(new Set(items.map((i) => i.area))).slice(0, 5).map((area) => (
            <span key={area} className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: AREA_COLORS[area] ?? "#C8A45A" }}
              />
              <span className="text-[8px] font-mono text-solar-muted/50 uppercase tracking-widest">
                {AREA_LABELS[area] ?? area}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div ref={containerRef} style={{ height: "520px" }}>
        <ForceGraph2D
          width={dimensions.w}
          height={520}
          graphData={graph}
          backgroundColor="#0D0D0F"
          nodeColor={(node) => {
            const n = node as Node
            return (AREA_COLORS[n.area] ?? "#C8A45A") + "CC"
          }}
          nodeVal={(node) => (node as Node).val}
          nodeLabel={(node) => (node as Node).name}
          linkColor={() => "rgba(42,42,58,0.6)"}
          linkWidth={1}
          onNodeClick={handleNodeClick}
          nodeCanvasObjectMode={() => "after"}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const n    = node as Node & { x?: number; y?: number }
            const label = n.name
            const fontSize = Math.max(8, 12 / globalScale)
            ctx.font = `${fontSize}px IBM Plex Mono`
            ctx.fillStyle = "rgba(232,228,220,0.55)"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(
              label.length > 20 ? label.slice(0, 18) + "…" : label,
              n.x ?? 0,
              (n.y ?? 0) + 12
            )
          }}
        />
      </div>
    </div>
  )
}
