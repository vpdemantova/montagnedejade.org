"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import type { WorldNotice } from "@/atlas/types"
import { NOTICE_LABELS, AREA_LABELS } from "@/atlas/types"

// ── Dynamic imports ───────────────────────────────────────────────────────────

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center border border-solar-border/15">
      <p className="text-[10px] font-mono text-solar-muted/40 uppercase tracking-widest animate-pulse">
        Carregando constelação…
      </p>
    </div>
  ),
})

const MapaViewInner = dynamic(
  () => import("./WorldBoardMapView").then((m) => m.WorldBoardMapView),
  {
    ssr:     false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center border border-solar-border/15">
        <p className="text-[10px] font-mono text-solar-muted/40">Carregando mapa…</p>
      </div>
    ),
  }
)

// ── Types ─────────────────────────────────────────────────────────────────────

type View = "MURAL" | "TIMELINE" | "STREAM" | "MAPA" | "CONSTELACAO"

const VIEWS: { id: View; label: string; symbol: string }[] = [
  { id: "MURAL",       label: "Mural",        symbol: "⊞" },
  { id: "TIMELINE",    label: "Timeline",     symbol: "—" },
  { id: "STREAM",      label: "Stream",       symbol: "≡" },
  { id: "MAPA",        label: "Mapa",         symbol: "◎" },
  { id: "CONSTELACAO", label: "Constelação",  symbol: "✦" },
]

const TYPE_COLORS: Record<string, string> = {
  OBRA:       "#C8A45A",
  AVISO:      "#E05C5C",
  EVENTO:     "#4A6C7C",
  DESCOBERTA: "#7CFC6A",
  HOMENAGEM:  "#8A8678",
  CITACAO:    "#4A4A5A",
}

// ── Notice panel ──────────────────────────────────────────────────────────────

function NoticePanel({
  notice,
  onClose,
  onAddToAtlas,
}: {
  notice:       WorldNotice
  onClose:      () => void
  onAddToAtlas: (n: WorldNotice) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [added,  setAdded]  = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    await onAddToAtlas(notice)
    setAdding(false)
    setAdded(true)
  }

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-80 bg-solar-deep border-l border-solar-border/30 z-50 flex flex-col shadow-2xl"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ duration: 0.22, ease: [0.0, 0.0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-solar-border/20">
        <span
          className="text-[8px] font-mono uppercase tracking-widest"
          style={{ color: TYPE_COLORS[notice.type] ?? "#8A8678" }}
        >
          {NOTICE_LABELS[notice.type] ?? notice.type}
        </span>
        <button onClick={onClose} className="text-solar-muted/40 hover:text-solar-muted transition-solar">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <h3 className="font-display text-[20px] leading-snug text-solar-text">{notice.title}</h3>
        {notice.body && (
          <p className="text-[11px] font-mono text-solar-muted/60 leading-relaxed">{notice.body}</p>
        )}
        {notice.author && (
          <p className="text-[9px] font-mono text-solar-muted/40">— {notice.author}</p>
        )}
        {notice.sourceUrl && (
          <a
            href={notice.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="block text-[9px] font-mono text-solar-amber/60 hover:text-solar-amber transition-solar uppercase tracking-widest"
          >
            Fonte →
          </a>
        )}
        <p className="text-[8px] font-mono text-solar-muted/30">
          {new Date(notice.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="px-5 py-4 border-t border-solar-border/20">
        <button
          onClick={() => void handleAdd()}
          disabled={adding || added}
          className="w-full px-4 py-2.5 border border-solar-amber/40 text-[10px] font-mono uppercase tracking-widest text-solar-amber hover:bg-solar-amber/10 transition-solar disabled:opacity-40"
        >
          {added ? "✓ Adicionado ao Atlas" : adding ? "Adicionando…" : "+ Adicionar ao Atlas"}
        </button>
      </div>
    </motion.div>
  )
}

// ── MURAL ─────────────────────────────────────────────────────────────────────

function MuralView({ notices, onSelect }: { notices: WorldNotice[]; onSelect: (n: WorldNotice) => void }) {
  return (
    <div className="columns-2 md:columns-3 gap-4">
      {notices.map((n, i) => (
        <motion.div
          key={n.id}
          className="break-inside-avoid mb-4 border border-solar-border/20 p-4 cursor-pointer hover:border-solar-amber/30 transition-solar"
          style={{ borderTopColor: TYPE_COLORS[n.type] ?? "transparent", borderTopWidth: 2 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
          onClick={() => onSelect(n)}
        >
          <span className="text-[8px] font-mono uppercase tracking-widest mb-2 block"
            style={{ color: TYPE_COLORS[n.type] ?? "#8A8678" }}>
            {NOTICE_LABELS[n.type] ?? n.type}
          </span>
          <h3 className="font-display text-[14px] leading-snug text-solar-text/90 mb-2">{n.title}</h3>
          {n.body && <p className="text-[9px] font-mono text-solar-muted/50 line-clamp-4">{n.body}</p>}
          <p className="text-[8px] font-mono text-solar-muted/30 mt-3">
            {new Date(n.createdAt).toLocaleDateString("pt-BR", { month: "short", day: "2-digit" })}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────

function TimelineView({ notices, onSelect }: { notices: WorldNotice[]; onSelect: (n: WorldNotice) => void }) {
  const sorted = [...notices].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <div className="overflow-x-auto pb-6">
      <div className="relative flex items-center min-w-max px-4" style={{ minHeight: 200 }}>
        {/* Horizontal spine */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-solar-border/30" />

        {sorted.map((n, i) => (
          <motion.div
            key={n.id}
            className="relative flex flex-col items-center w-44 flex-shrink-0"
            initial={{ opacity: 0, y: i % 2 === 0 ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            {i % 2 === 0 ? (
              <>
                <div
                  className="w-36 mb-3 border border-solar-border/20 p-3 cursor-pointer hover:border-solar-amber/30 transition-solar bg-solar-deep/60"
                  onClick={() => onSelect(n)}
                >
                  <p className="text-[8px] font-mono text-solar-muted/40 mb-1">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                  </p>
                  <p className="text-[10px] font-mono text-solar-text/80 line-clamp-2">{n.title}</p>
                </div>
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: TYPE_COLORS[n.type] ?? "#4A4A5A", border: "2px solid rgb(232, 224, 208)" }} />
                <div className="h-14" />
              </>
            ) : (
              <>
                <div className="h-14" />
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: TYPE_COLORS[n.type] ?? "#4A4A5A", border: "2px solid rgb(232, 224, 208)" }} />
                <div
                  className="w-36 mt-3 border border-solar-border/20 p-3 cursor-pointer hover:border-solar-amber/30 transition-solar bg-solar-deep/60"
                  onClick={() => onSelect(n)}
                >
                  <p className="text-[8px] font-mono text-solar-muted/40 mb-1">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                  </p>
                  <p className="text-[10px] font-mono text-solar-text/80 line-clamp-2">{n.title}</p>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── STREAM ────────────────────────────────────────────────────────────────────

function StreamView({ notices, onSelect }: { notices: WorldNotice[]; onSelect: (n: WorldNotice) => void }) {
  const [visible, setVisible] = useState(10)

  return (
    <div className="max-w-2xl mx-auto">
      {notices.slice(0, visible).map((n, i) => (
        <motion.article
          key={n.id}
          className="border-b border-solar-border/20 py-8 cursor-pointer hover:bg-solar-surface/10 transition-solar px-2 -mx-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(n)}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[8px] font-mono uppercase tracking-widest"
              style={{ color: TYPE_COLORS[n.type] ?? "#8A8678" }}>
              {NOTICE_LABELS[n.type] ?? n.type}
            </span>
            <span className="text-[8px] font-mono text-solar-muted/30">
              {new Date(n.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
            </span>
          </div>
          <h2 className="font-display text-[24px] leading-tight text-solar-text mb-3">{n.title}</h2>
          {n.body && <p className="text-[12px] font-body text-solar-muted/55 leading-loose line-clamp-5">{n.body}</p>}
          {n.author && <p className="text-[9px] font-mono text-solar-muted/35 mt-3">— {n.author}</p>}
        </motion.article>
      ))}

      {visible < notices.length && (
        <button
          onClick={() => setVisible((v) => v + 10)}
          className="w-full py-4 text-[9px] font-mono uppercase tracking-widest text-solar-muted/50 hover:text-solar-muted transition-solar"
        >
          Carregar mais ({notices.length - visible} restantes)
        </button>
      )}
    </div>
  )
}

// ── CONSTELLATION ─────────────────────────────────────────────────────────────

type GraphNode = { id: string; name: string; color: string; val: number; notice: WorldNotice }

function ConstellationView({ notices, onSelect }: { notices: WorldNotice[]; onSelect: (n: WorldNotice) => void }) {
  const nodes: GraphNode[] = notices.map((n) => ({
    id:     n.id,
    name:   n.title,
    color:  TYPE_COLORS[n.type] ?? "#4A4A5A",
    val:    n.isPinned ? 4 : 2,
    notice: n,
  }))

  const links: { source: string; target: string }[] = []
  for (let i = 0; i < notices.length; i++) {
    for (let j = i + 1; j < notices.length; j++) {
      const ni = notices[i]!; const nj = notices[j]!
      if (ni.type === nj.type || ni.area === nj.area) {
        links.push({ source: ni.id, target: nj.id })
      }
    }
  }

  if (nodes.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-solar-border/20">
        <p className="text-[10px] font-mono text-solar-muted/40">Nenhum dado para a constelação.</p>
      </div>
    )
  }

  return (
    <div className="border border-solar-border/15 overflow-hidden" style={{ height: 500 }}>
      <ForceGraph2D
        graphData={{ nodes, links }}
        backgroundColor="rgb(250, 246, 238)"
        nodeColor={(n) => (n as GraphNode).color}
        nodeVal={(n)   => (n as GraphNode).val}
        linkColor={() => "rgba(200,164,90,0.12)"}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphNode
          const r = Math.sqrt(n.val) * 2.5
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI)
          ctx.fillStyle = n.color
          ctx.fill()
          if (globalScale > 1.5) {
            const fontSize = Math.max(3, 4 / globalScale)
            ctx.font = `${fontSize}px monospace`
            ctx.fillStyle = "rgba(28,20,8,0.7)"
            ctx.textAlign = "center"
            ctx.fillText(n.name.slice(0, 20), node.x!, node.y! - r - 1)
          }
        }}
        onNodeClick={(node) => onSelect((node as GraphNode).notice)}
        width={900}
        height={500}
      />
    </div>
  )
}

// ── Notice creation form ──────────────────────────────────────────────────────

const NOTICE_TYPES = ["OBRA","AVISO","EVENTO","DESCOBERTA","HOMENAGEM","CITACAO"] as const
const NOTICE_AREAS = ["ACADEMIA","ARTES","CULTURA","OBRAS","PESSOAS","COMPUTACAO","AULAS","ATLAS"] as const

function NewNoticePanel({
  onClose,
  onCreate,
}: {
  onClose:  () => void
  onCreate: (n: WorldNotice) => void
}) {
  const [title,     setTitle]     = useState("")
  const [body,      setBody]      = useState("")
  const [type,      setType]      = useState<string>("AVISO")
  const [area,      setArea]      = useState<string>("ATLAS")
  const [author,    setAuthor]    = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [isPinned,  setIsPinned]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const submit = async () => {
    if (!title.trim() || !body.trim()) { setError("Título e texto são obrigatórios."); return }
    setSaving(true)
    setError(null)
    try {
      const res  = await fetch("/api/notices", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title: title.trim(),
          body:  body.trim(),
          type, area,
          author:    author.trim()    || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
          isPinned,
        }),
      })
      if (!res.ok) { const { error: e } = await res.json() as { error: string }; setError(e); return }
      const notice = await res.json() as WorldNotice
      onCreate(notice)
      onClose()
    } catch { setError("Erro ao criar aviso.") }
    finally  { setSaving(false) }
  }

  const inputClass = "w-full bg-solar-deep/60 border border-solar-border/30 px-3 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
  const labelClass = "block text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/40 mb-1"

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-80 bg-solar-deep border-l border-solar-border/30 z-50 flex flex-col shadow-2xl"
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ duration: 0.22, ease: [0.0, 0.0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-solar-border/20">
        <span className="text-[9px] font-mono uppercase tracking-widest text-solar-amber/70">✦ Nova Entrada</span>
        <button onClick={onClose} className="text-solar-muted/40 hover:text-solar-muted transition-solar">×</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Tipo + Área */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className={inputClass} style={{ background: "rgb(var(--c-deep))" }}>
              {NOTICE_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "rgb(var(--c-deep))" }}>
                  {NOTICE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Área</label>
            <select value={area} onChange={(e) => setArea(e.target.value)}
              className={inputClass} style={{ background: "rgb(var(--c-deep))" }}>
              {NOTICE_AREAS.map((a) => (
                <option key={a} value={a} style={{ background: "rgb(var(--c-deep))" }}>
                  {AREA_LABELS[a] ?? a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Título */}
        <div>
          <label className={labelClass}>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da obra, evento, aviso…"
            className={inputClass} />
        </div>

        {/* Texto */}
        <div>
          <label className={labelClass}>Texto *</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="Descrição, citação ou nota…"
            rows={4}
            className={`${inputClass} resize-none leading-relaxed`} />
        </div>

        {/* Autor */}
        <div>
          <label className={labelClass}>Autor / Fonte (opcional)</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nome do autor"
            className={inputClass} />
        </div>

        {/* URL */}
        <div>
          <label className={labelClass}>URL de origem (opcional)</label>
          <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
            className={inputClass} />
        </div>

        {/* Fixar */}
        <button
          onClick={() => setIsPinned((p) => !p)}
          className={`flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest transition-solar ${
            isPinned ? "text-solar-amber" : "text-solar-muted/40 hover:text-solar-muted/70"
          }`}
        >
          <span className="text-sm">{isPinned ? "★" : "☆"}</span>
          {isPinned ? "Fixado no topo" : "Fixar no topo"}
        </button>

        {error && (
          <p className="text-[9px] font-mono text-solar-red/70">{error}</p>
        )}
      </div>

      <div className="px-5 py-4 border-t border-solar-border/20">
        <button
          onClick={() => void submit()}
          disabled={saving || !title.trim() || !body.trim()}
          className="w-full px-4 py-2.5 border border-solar-amber/40 text-[10px] font-mono uppercase tracking-widest text-solar-amber hover:bg-solar-amber/10 transition-solar disabled:opacity-30"
        >
          {saving ? "Publicando…" : "✦ Publicar"}
        </button>
      </div>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function WorldBoard({ notices: initialNotices }: { notices: WorldNotice[] }) {
  const [notices, setNotices] = useState<WorldNotice[]>(initialNotices)
  const [view,     setView]     = useState<View>("MURAL")
  const [active,   setActive]   = useState<WorldNotice | null>(null)
  const [creating, setCreating] = useState(false)
  const [visible,  setVisible]  = useState(true)

  const switchView = (v: View) => {
    setVisible(false)
    setTimeout(() => { setView(v); setVisible(true) }, 150)
  }

  const addToAtlas = useCallback(async (notice: WorldNotice) => {
    await fetch("/api/atlas", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        title:      notice.title,
        type:       "WORK",
        area:       notice.area !== "ATLAS" ? notice.area : "CULTURA",
        hemisphere: "PORTAL",
        status:     "ACTIVE",
        tagNames:   [notice.type.toLowerCase()],
      }),
    })
  }, [])

  const handleCreated = useCallback((n: WorldNotice) => {
    setNotices((prev) => n.isPinned ? [n, ...prev] : [n, ...prev.filter((x) => !x.isPinned).concat(prev.filter((x) => x.isPinned))])
  }, [])

  return (
    <div className="relative">
      {/* Switcher + actions */}
      <div className="flex items-center border-b border-solar-border/20 mb-6">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => switchView(v.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-mono uppercase tracking-widest border-b-2 -mb-px transition-solar
              ${view === v.id
                ? "border-solar-amber text-solar-amber"
                : "border-transparent text-solar-muted/45 hover:text-solar-muted"}`}
          >
            <span>{v.symbol}</span>
            <span className="hidden sm:inline ml-1">{v.label}</span>
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[8px] font-mono text-solar-muted/25 mr-4">
          {notices.length} {notices.length === 1 ? "entrada" : "entradas"}
        </span>
        <button
          onClick={() => setCreating(true)}
          className="text-[8px] font-mono uppercase tracking-widest text-solar-amber/50 hover:text-solar-amber border border-solar-amber/20 hover:border-solar-amber/40 px-2.5 py-1 transition-solar mr-2"
        >
          ✦ Nova
        </button>
      </div>

      {/* View */}
      <div className="transition-opacity duration-150" style={{ opacity: visible ? 1 : 0 }}>
        {notices.length === 0 ? (
          <div className="py-20 border border-dashed border-solar-border/20 text-center">
            <p className="text-[10px] font-mono text-solar-muted/40 mb-3">Nenhuma entrada cadastrada ainda.</p>
            <button
              onClick={() => setCreating(true)}
              className="text-[9px] font-mono uppercase tracking-widest text-solar-amber/60 hover:text-solar-amber transition-solar border border-solar-amber/20 hover:border-solar-amber/40 px-3 py-1.5"
            >
              ✦ Criar primeira entrada
            </button>
          </div>
        ) : view === "MURAL" ? (
          <MuralView         notices={notices} onSelect={setActive} />
        ) : view === "TIMELINE" ? (
          <TimelineView      notices={notices} onSelect={setActive} />
        ) : view === "STREAM" ? (
          <StreamView        notices={notices} onSelect={setActive} />
        ) : view === "MAPA" ? (
          <MapaViewInner     notices={notices} onSelect={setActive} />
        ) : (
          <ConstellationView notices={notices} onSelect={setActive} />
        )}
      </div>

      {/* Side panels */}
      <AnimatePresence>
        {active && !creating && (
          <NoticePanel
            notice={active}
            onClose={() => setActive(null)}
            onAddToAtlas={addToAtlas}
          />
        )}
        {creating && (
          <NewNoticePanel
            onClose={() => setCreating(false)}
            onCreate={handleCreated}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
