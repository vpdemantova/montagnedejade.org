"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type Preview = { total: number; byArea: Record<string, number> }
type Result  = { inserted: number; updated: number; errors: number; total: number }

export default function AtlasSeedPage() {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [status,  setStatus]  = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result,  setResult]  = useState<Result | null>(null)

  useEffect(() => {
    fetch("/api/atlas/seed")
      .then((r) => r.json())
      .then(setPreview)
      .catch(() => null)
  }, [])

  async function runSeed() {
    setStatus("loading")
    try {
      const res = await fetch("/api/atlas/seed", {
        method: "POST",
        headers: { "x-seed-secret": "portalsolar-seed" },
      })
      if (!res.ok) throw new Error("Falhou")
      setResult(await res.json())
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-lg w-full space-y-6">

        {/* Header */}
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] mb-1" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
            Atlas · Enciclopédia
          </p>
          <h1 className="font-display text-2xl font-bold text-solar-text/90">Seed enciclopédico</h1>
          <p className="font-mono text-[9px] mt-1.5" style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
            Popula o banco com tabela periódica completa (118 elementos), compositores, cientistas,
            filósofos, pintores, escritores, obras, biblioteca, cosmos, história, natureza e arquitetura.
          </p>
        </div>

        {/* Preview por seção */}
        {preview && (
          <div className="border border-solar-border/25 p-4 space-y-2">
            <p className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/55 mb-3">
              {preview.total} itens a inserir
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {Object.entries(preview.byArea)
                .sort(([, a], [, b]) => b - a)
                .map(([area, count]) => (
                  <div key={area} className="flex items-center justify-between">
                    <span className="font-mono text-[7.5px] text-solar-text/65">{area}</span>
                    <span className="font-mono text-[7.5px] tabular-nums text-solar-muted/40">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Ação */}
        <div className="flex items-center gap-3">
          <button
            onClick={runSeed}
            disabled={status === "loading" || status === "done"}
            className="font-mono text-[8px] uppercase tracking-[0.2em] px-5 py-2.5 transition-all disabled:opacity-40"
            style={{
              border: "1px solid rgb(var(--c-accent) / 0.5)",
              color:  "rgb(var(--c-accent))",
              backgroundColor: status === "loading" ? "rgb(var(--c-accent) / 0.08)" : "transparent",
            }}
          >
            {status === "loading" ? "Inserindo…" : status === "done" ? "✓ Concluído" : "Executar seed"}
          </button>
          <Link href="/" className="font-mono text-[7.5px] uppercase tracking-widest text-solar-muted/50 hover:text-solar-muted transition-colors">
            ← Atlas
          </Link>
        </div>

        {/* Resultado */}
        {status === "done" && result && (
          <div className="border border-solar-border/20 p-4 space-y-1.5">
            <p className="font-mono text-[8px] uppercase tracking-widest text-solar-accent mb-2">Seed concluído</p>
            <p className="font-mono text-[8px] text-solar-text/70">Inseridos: <span className="tabular-nums">{result.inserted}</span></p>
            <p className="font-mono text-[8px] text-solar-text/70">Atualizados: <span className="tabular-nums">{result.updated}</span></p>
            {result.errors > 0 && (
              <p className="font-mono text-[8px] text-solar-muted/55">Erros: {result.errors}</p>
            )}
            <div className="pt-3 flex gap-4">
              <Link href="/" className="font-mono text-[8px] text-solar-accent/80 hover:text-solar-accent transition-colors">
                Ver Atlas →
              </Link>
              <button
                onClick={runSeed}
                className="font-mono text-[8px] text-solar-muted/50 hover:text-solar-muted transition-colors"
              >
                Executar novamente
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <p className="font-mono text-[8px] text-solar-muted/60">
            Erro ao executar. Verifique se o servidor está rodando e tente novamente.
          </p>
        )}
      </div>
    </div>
  )
}
