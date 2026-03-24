"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const MODES = [
  { id: "nota",  label: "Nota rápida",  hint: "Pensamento ou observação" },
  { id: "ideia", label: "Ideia visual",  hint: "Conceito com referência visual" },
  { id: "link",  label: "Link",          hint: "URL + anotação" },
] as const

type Mode = (typeof MODES)[number]["id"]

export default function NovaNotaPage() {
  const router = useRouter()
  const [mode,    setMode]    = useState<Mode>("nota")
  const [title,   setTitle]   = useState("")
  const [url,     setUrl]     = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleCreate = async () => {
    const t = title.trim() || (mode === "link" ? url.trim() : "")
    if (!t) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/atlas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:     t,
          area:      "NOTAS",
          type:      "NOTA",
          hemisphere: "COMPASS",
          status:    "ACTIVE",
          tagNames:  [],
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? `Erro ${res.status}`)
      }
      const item = await res.json() as { id: string }
      router.push(`/compass/notas/${item.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar nota")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-4 md:px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Notas · Nova
          </p>
          <h1 className="font-display text-[36px] leading-none text-solar-text font-semibold tracking-tight">
            Nova nota
          </h1>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-12 py-10 space-y-8">

        {/* Mode selector */}
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/50 mb-3">Tipo</p>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex-1 px-4 py-3 border text-left transition-solar
                  ${mode === m.id
                    ? "border-compass-neon/50 bg-compass-neon/8"
                    : "border-solar-border/30 hover:border-solar-border/50"}`}
              >
                <p className={`text-[10px] font-mono uppercase tracking-widest ${mode === m.id ? "text-compass-neon" : "text-solar-text/60"}`}>
                  {m.label}
                </p>
                <p className="text-[9px] font-mono text-solar-muted/40 mt-0.5">{m.hint}</p>
              </button>
            ))}
          </div>
        </div>

        {/* URL field for links */}
        {mode === "link" && (
          <div>
            <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
              URL
            </label>
            <input
              autoFocus
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full bg-transparent border-b border-solar-border/50 py-2 font-mono text-sm text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-compass-neon/50 transition-solar"
            />
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/60 mb-2">
            {mode === "link" ? "Título / Anotação" : "Título"}
          </label>
          <input
            autoFocus={mode !== "link"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleCreate() }}
            placeholder={mode === "nota" ? "O que você está pensando?" : mode === "ideia" ? "Nome da ideia…" : "Título do link…"}
            className="w-full bg-transparent border-b border-solar-border/50 py-2 font-display text-2xl text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-compass-neon/50 transition-solar"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-[10px] font-mono text-red-400/80 border border-red-400/20 px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => void handleCreate()}
            disabled={loading || (!title.trim() && !url.trim())}
            className="px-6 py-2.5 bg-compass-neon/10 border border-compass-neon/40 text-[11px] font-mono text-compass-neon uppercase tracking-widest hover:bg-compass-neon/20 transition-solar disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Criando…" : "Criar nota →"}
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
