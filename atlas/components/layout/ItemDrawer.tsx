"use client"

import { useEffect, useRef } from "react"
import { X, ExternalLink, Tag as TagIcon, Calendar, Hash } from "lucide-react"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS, STATUS_LABELS, AREA_COLORS } from "@/atlas/types"
import { Tag } from "@/atlas/components/ui/Tag"

type ItemDrawerProps = {
  item: AtlasItemWithTags | null
  onClose: () => void
}

function itemCode(id: string): string {
  const num = id.replace(/\D/g, "").slice(-3).padStart(3, "0")
  return `SOL-${num || Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 1000).toString().padStart(3, "0")}`
}

export function ItemDrawer({ item, onClose }: ItemDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Fechar com Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (item) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [item, onClose])

  // Travar scroll do body quando aberto
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [item])

  if (!item) return null

  const areaColor  = AREA_COLORS[item.area as keyof typeof AREA_COLORS] ?? "#C8A45A"
  const areaLabel  = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
  const typeLabel  = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] ?? item.type
  const statusLabel = STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] ?? item.status
  const code       = itemCode(item.id)

  const createdAt = new Date(item.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const updatedAt = new Date(item.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "2-digit",
  })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-solar"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="
          fixed top-0 right-0 h-screen z-50
          w-full max-w-[520px]
          bg-solar-deep border-l border-solar-border
          flex flex-col
          animate-slide-in-right
          shadow-2xl
        "
      >
        {/* ── Header ── */}
        <div
          className="flex items-start justify-between px-6 py-4 border-b border-solar-border"
          style={{ borderTopColor: areaColor, borderTopWidth: 2 }}
        >
          <div className="flex-1 min-w-0">
            {/* Área — Tipo — Código */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: areaColor }}
              />
              <span className="text-[10px] font-mono uppercase tracking-widest text-solar-muted">
                <span style={{ color: areaColor }}>{areaLabel}</span>
                <span className="text-solar-border mx-1.5">—</span>
                <span>{typeLabel}</span>
                <span className="text-solar-border mx-1.5">—</span>
                <span className="text-solar-muted/50">{code}</span>
              </span>
            </div>

            {/* Título */}
            <h2 className="font-display text-solar-text text-xl leading-tight">
              {item.title}
            </h2>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            <a
              href={`/atlas/${item.id}`}
              className="w-8 h-8 flex items-center justify-center rounded-md text-solar-muted hover:text-solar-amber hover:bg-solar-amber/10 transition-solar"
              title="Abrir página completa"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-solar-muted hover:text-solar-text hover:bg-solar-surface transition-solar"
              title="Fechar (Esc)"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Metadados ── */}
        <div className="px-6 py-3 border-b border-solar-border bg-solar-surface/30">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 mb-0.5">Status</dt>
              <dd className="text-[11px] font-mono text-solar-muted">{statusLabel}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 mb-0.5">Atualizado</dt>
              <dd className="text-[11px] font-mono text-solar-muted">{updatedAt}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 mb-0.5">Criado em</dt>
              <dd className="text-[11px] font-mono text-solar-muted">{createdAt}</dd>
            </div>
            <div>
              <dt className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 mb-0.5">ID</dt>
              <dd className="text-[11px] font-mono text-solar-muted/50">{code}</dd>
            </div>
          </dl>
        </div>

        {/* ── Tags ── */}
        {item.tags.length > 0 && (
          <div className="px-6 py-3 border-b border-solar-border">
            <p className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <Tag key={tag.id} name={tag.name} color={tag.color} />
              ))}
            </div>
          </div>
        )}

        {/* ── Conteúdo ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {item.content ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-solar-text/80 text-sm leading-relaxed whitespace-pre-wrap font-body">
                {item.content}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-solar-muted/50 text-sm font-mono">Sem conteúdo ainda.</p>
              <a
                href={`/atlas/${item.id}`}
                className="mt-2 text-xs font-mono text-solar-amber/60 hover:text-solar-amber transition-solar"
              >
                Abrir para editar →
              </a>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-solar-border flex items-center justify-between">
          <span className="text-[9px] font-mono text-solar-muted/40 tracking-wider">
            ESC para fechar
          </span>
          <a
            href={`/atlas/${item.id}`}
            className="
              text-[11px] font-mono px-3 py-1.5 rounded-md
              bg-solar-amber/10 text-solar-amber border border-solar-amber/20
              hover:bg-solar-amber/20 transition-solar
            "
          >
            Editar item →
          </a>
        </div>
      </div>
    </>
  )
}
