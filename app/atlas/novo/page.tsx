"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"

function NovoItemForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [title,      setTitle]      = useState("")
  const [area,       setArea]       = useState(searchParams.get("area") ?? "ATLAS")
  const [type,       setType]       = useState(searchParams.get("type") ?? "PAGE")
  const [coverImage, setCoverImage] = useState("")
  const [tags,       setTags]       = useState("")
  const [location,   setLocation]   = useState("")
  const [yearStart,  setYearStart]  = useState("")
  const [yearEnd,    setYearEnd]    = useState("")
  const [loading,    setLoading]    = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      const metadata: Record<string, unknown> = {}
      if (location.trim()) metadata.location = location.trim()
      if (yearStart.trim()) {
        metadata.period = {
          start: parseInt(yearStart),
          ...(yearEnd.trim() ? { end: parseInt(yearEnd) } : {}),
        }
      }

      const res = await fetch("/api/atlas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:      title.trim(),
          area,
          type,
          coverImage: coverImage.trim() || undefined,
          metadata:   Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : undefined,
          tagNames:   tags.trim()
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : undefined,
        }),
      })
      const item = await res.json() as { id: string; slug?: string | null }
      router.push(`/atlas/${item.slug ?? item.id}`)
    } catch {
      setLoading(false)
    }
  }

  const isPersonType = type === "PERSON"

  return (
    <div className="relative min-h-screen pb-20">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-8 sm:pt-12 pb-5 sm:pb-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-8">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/70 mb-3">
            Atlas · Novo item
          </p>
          <h1 className="font-display text-[28px] sm:text-[36px] leading-none text-solar-text font-semibold tracking-tight">
            Criar
          </h1>
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">

        {/* Título */}
        <div>
          <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
            Título *
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) void handleCreate() }}
            placeholder={isPersonType ? "Nome completo…" : "Nome do item…"}
            className="w-full bg-transparent border-b border-solar-border/50 py-2 font-display text-2xl text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/50 transition-solar"
          />
        </div>

        {/* Área + Tipo */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
              Área
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-solar-surface border border-solar-border/40 px-3 py-2 text-[11px] font-mono text-solar-text focus:outline-none focus:border-solar-amber/40 transition-solar"
            >
              {Object.entries(AREA_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: "#1C1C26" }}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-solar-surface border border-solar-border/40 px-3 py-2 text-[11px] font-mono text-solar-text focus:outline-none focus:border-solar-amber/40 transition-solar"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} style={{ background: "#1C1C26" }}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
            {isPersonType ? "Retrato (URL da imagem)" : "Imagem de capa (URL)"}
          </label>
          <input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://…"
            className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
          />
          {coverImage && (
            <div className="mt-2 border border-solar-border/20 relative h-40">
              <Image src={coverImage} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
            Tags (separadas por vírgula)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={isPersonType ? "Compositor, Barroco, Itália…" : "Conceito, Renascimento…"}
            className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
          />
        </div>

        {/* Período e Localização */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
              Ano início
            </label>
            <input
              value={yearStart}
              onChange={(e) => setYearStart(e.target.value)}
              placeholder="1685"
              type="number"
              className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
              Ano fim
            </label>
            <input
              value={yearEnd}
              onChange={(e) => setYearEnd(e.target.value)}
              placeholder="1750"
              type="number"
              className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
              Local / País
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Alemanha"
              className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-solar-border/15">
          <button
            onClick={() => void handleCreate()}
            disabled={!title.trim() || loading}
            className="px-6 py-2.5 bg-solar-amber/10 border border-solar-amber/40 text-[11px] font-mono text-solar-amber uppercase tracking-widest hover:bg-solar-amber/20 transition-solar disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Criando…" : "Criar item →"}
          </button>
          <button
            onClick={() => router.back()}
            className="text-[10px] font-mono text-solar-muted/50 hover:text-solar-muted transition-solar"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NovoItemPage() {
  return (
    <Suspense>
      <NovoItemForm />
    </Suspense>
  )
}
