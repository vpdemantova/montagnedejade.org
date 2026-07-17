import { readFile, readdir } from "fs/promises"
import { join } from "path"
import matter from "gray-matter"
import Link from "next/link"
import { ArrowLeft, Sun } from "lucide-react"
import { StructureClient } from "@/atlas/components/portal/StructureClient"
import { UI } from "@/portal.config"

// Resolve por sufixo em vez de nome fixo — docs/ já foi renomeado uma vez
// (prefixos numéricos/alfabéticos), então um nome hardcoded quebra silenciosamente.
async function findDocFile(suffix: string): Promise<string> {
  const docsDir = join(process.cwd(), "docs")
  const files = await readdir(docsDir)
  const match = files.find((f) => f.toUpperCase().endsWith(suffix.toUpperCase()))
  if (!match) throw new Error(`Doc não encontrado: ${suffix}`)
  return match
}

async function readDoc(suffix: string) {
  const filename = await findDocFile(suffix)
  const raw = await readFile(join(process.cwd(), "docs", filename), "utf-8")
  const { content } = matter(raw)
  return content
}

export default async function StructurePage() {
  const [visao, arquitetura, stack] = await Promise.all([
    readDoc("VISAO.md"),
    readDoc("ARQUITETURA.md"),
    readDoc("STACK.md"),
  ])

  const docs = [
    { key: "visao"       as const, label: "Visão & Manifesto", content: visao       },
    { key: "arquitetura" as const, label: "Arquitetura",       content: arquitetura },
    { key: "stack"       as const, label: "Stack",             content: stack       },
  ]

  return (
    <div className="flex flex-col h-screen bg-solar-void text-solar-text">

      {/* Header */}
      <header className="flex items-center gap-4 px-6 h-[52px] border-b border-solar-border/20 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-solar-text/40 hover:text-solar-text transition-colors text-[11px] font-mono"
        >
          {UI.SHOW_ICONS && <ArrowLeft size={12} strokeWidth={1.5} />}
          <span className="hidden sm:block">Voltar</span>
        </Link>

        <div className="flex-1 flex items-center justify-center gap-2">
          {UI.SHOW_ICONS && <Sun size={13} strokeWidth={1.5} className="text-solar-accent/60" />}
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-solar-text/50">
            Portal Solar
          </span>
          <span className="text-solar-border/40 text-[11px] font-mono">/</span>
          <span className="text-[11px] font-mono text-solar-text/35">
            Structure
          </span>
        </div>

        <div className="w-16 hidden sm:block" />
      </header>

      {/* Docs + tabs */}
      <StructureClient docs={docs} />

      {/* Footer */}
      <footer className="border-t border-solar-border/20 px-6 py-4 flex-shrink-0 flex items-center justify-between">
        <span className="text-[10px] font-mono text-solar-text/25 uppercase tracking-widest">
          Portal Solar
        </span>
        <span className="text-[10px] font-mono text-solar-text/20">
          Iniciado por Vitor de Mantova · 2025
        </span>
        <span className="text-[10px] font-mono text-solar-text/20">
          {new Date().getFullYear()}
        </span>
      </footer>

    </div>
  )
}
