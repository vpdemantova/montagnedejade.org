"use client"

import "@blocknote/core/fonts/inter.css"
import "@blocknote/react/style.css"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter }                                from "next/navigation"
import { useCreateBlockNote, BlockNoteViewRaw }     from "@blocknote/react"
import type { Block }                              from "@blocknote/core"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type PageDetail = {
  id:       string
  title:    string
  icon:     string | null
  content:  string | null
  isPublic: boolean
  isBlog:   boolean
  parentId: string | null
  parent:   { id: string; title: string; icon: string | null } | null
  children: Array<{ id: string; title: string; icon: string | null }>
}

const EMOJI_OPTS = ["📄","📝","💡","🌟","📚","🎵","🌿","⚡","🔬","🎨","🌍","💬","🧠","✨","🔥","🌱"]

// ── Editor principal ──────────────────────────────────────────────────────────

export function PageEditor({ page: initial }: { page: PageDetail }) {
  const router   = useRouter()
  const [page,      setPage]      = useState(initial)
  const [title,     setTitle]     = useState(initial.title)
  const [icon,      setIcon]      = useState(initial.icon ?? "📄")
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [showEmoji, setShowEmoji] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Parse conteúdo inicial do JSON
  const initialContent = (() => {
    if (!initial.content) return undefined
    try { return JSON.parse(initial.content) as Block[] } catch { return undefined }
  })()

  const editor = useCreateBlockNote({ initialContent })

  // Auto-save do conteúdo com debounce de 1s
  const saveContent = useCallback(async (blocks: Block[]) => {
    setSaveState("saving")
    await fetch(`/api/workspace/pages/${page.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content: JSON.stringify(blocks) }),
    })
    setSaveState("saved")
    setTimeout(() => setSaveState("idle"), 2000)
  }, [page.id])

  // Listener de mudanças no editor
  useEffect(() => {
    const unsub = editor.onChange(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void saveContent(editor.document)
      }, 1000)
    })
    return () => {
      unsub()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [editor, saveContent])

  // Salvar título com debounce
  const saveTitle = useCallback((newTitle: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      await fetch(`/api/workspace/pages/${page.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title: newTitle }),
      })
    }, 600)
  }, [page.id])

  const saveIcon = async (newIcon: string) => {
    setIcon(newIcon)
    setShowEmoji(false)
    await fetch(`/api/workspace/pages/${page.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ icon: newIcon }),
    })
  }

  const togglePublic = async () => {
    const next = !page.isPublic
    setPage((p) => ({ ...p, isPublic: next }))
    await fetch(`/api/workspace/pages/${page.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isPublic: next }),
    })
  }

  const toggleBlog = async () => {
    const nextBlog   = !page.isBlog
    const nextPublic = nextBlog ? true : page.isPublic
    setPage((p) => ({ ...p, isBlog: nextBlog, isPublic: nextPublic }))
    await fetch(`/api/workspace/pages/${page.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isBlog: nextBlog, isPublic: nextPublic }),
    })
  }

  const createSubPage = async () => {
    const res = await fetch("/api/workspace/pages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: "Nova página", parentId: page.id }),
    })
    if (res.ok) {
      const p = await res.json() as { id: string }
      router.push(`/workspace/${p.id}`)
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ── */}
      <div
        className="flex-shrink-0 flex items-center justify-between gap-3 px-6 py-2"
        style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.12)" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-mono text-[8px] text-solar-muted/40 min-w-0 overflow-hidden">
          {page.parent && (
            <>
              <span>{page.parent.icon}</span>
              <a href={`/workspace/${page.parent.id}`} className="hover:text-solar-muted/70 transition-colors truncate max-w-[120px]">
                {page.parent.title}
              </a>
              <span className="opacity-40">›</span>
            </>
          )}
          <span className="text-solar-muted/60 truncate">{title || "Sem título"}</span>
        </div>

        {/* Controles de privacidade + save */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Save state */}
          <span className="font-mono text-[7.5px] transition-opacity"
            style={{ color: saveState === "saving" ? "rgb(var(--c-muted)/0.5)" : saveState === "saved" ? "rgb(var(--c-accent)/0.7)" : "transparent" }}>
            {saveState === "saving" ? "Salvando…" : saveState === "saved" ? "✓ Salvo" : "·"}
          </span>

          {/* Blog toggle */}
          <button
            onClick={() => void toggleBlog()}
            className="font-mono text-[7.5px] uppercase tracking-widest px-2 py-1 border transition-all"
            style={{
              borderColor: page.isBlog ? "rgb(var(--c-accent)/0.5)" : "rgb(var(--c-border)/0.3)",
              background:  page.isBlog ? "rgb(var(--c-accent)/0.1)" : "transparent",
              color:       page.isBlog ? "rgb(var(--c-accent))" : "rgb(var(--c-muted)/0.5)",
            }}
            title={page.isBlog ? "Remover do blog" : "Publicar no blog"}
          >
            {page.isBlog ? "◎ Blog" : "◌ Blog"}
          </button>

          {/* Público toggle */}
          <button
            onClick={() => void togglePublic()}
            className="font-mono text-[7.5px] uppercase tracking-widest px-2 py-1 border transition-all"
            style={{
              borderColor: page.isPublic ? "rgb(var(--c-teal)/0.5)" : "rgb(var(--c-border)/0.3)",
              background:  page.isPublic ? "rgb(var(--c-teal)/0.08)" : "transparent",
              color:       page.isPublic ? "rgb(var(--c-teal))" : "rgb(var(--c-muted)/0.5)",
            }}
            title={page.isPublic ? "Tornar privado" : "Tornar público"}
          >
            {page.isPublic ? "◉ Público" : "○ Privado"}
          </button>

          {/* Nova sub-página */}
          <button
            onClick={() => void createSubPage()}
            className="font-mono text-[7.5px] uppercase tracking-widest px-2 py-1 border border-solar-border/25 text-solar-muted/45 hover:text-solar-text hover:border-solar-border/50 transition-colors"
          >
            + Sub-página
          </button>
        </div>
      </div>

      {/* ── Área de conteúdo ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-10">
          {/* Ícone */}
          <div className="relative mb-4">
            <button
              onClick={() => setShowEmoji((o) => !o)}
              className="text-4xl hover:opacity-70 transition-opacity"
              title="Mudar ícone"
            >
              {icon}
            </button>

            {showEmoji && (
              <div
                className="absolute top-12 left-0 z-10 p-3 grid grid-cols-8 gap-1"
                style={{ background: "rgb(var(--c-deep))", border: "1px solid rgb(var(--c-border)/0.3)", boxShadow: "0 8px 32px rgb(0 0 0/0.2)" }}
              >
                {EMOJI_OPTS.map((e) => (
                  <button key={e} onClick={() => void saveIcon(e)}
                    className="text-lg hover:bg-solar-surface/40 p-1 rounded transition-colors">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Título editável */}
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); saveTitle(e.target.value) }}
            placeholder="Sem título"
            className="w-full bg-transparent font-display outline-none leading-tight mb-6 placeholder:text-solar-muted/20"
            style={{
              fontSize:      "clamp(1.6rem, 4vw, 2.5rem)",
              fontWeight:    700,
              letterSpacing: "-0.02em",
              color:         "rgb(var(--c-text) / 0.92)",
            }}
          />

          {/* Editor BlockNote */}
          <div className="blocknote-workspace">
            <BlockNoteViewRaw
              editor={editor}
              theme="dark"
            />
          </div>

          {/* Sub-páginas */}
          {page.children.length > 0 && (
            <div className="mt-10 pt-8" style={{ borderTop: "1px solid rgb(var(--c-border)/0.15)" }}>
              <p className="font-mono text-[7px] uppercase tracking-widest text-solar-muted/40 mb-3">
                Sub-páginas
              </p>
              <div className="grid grid-cols-2 gap-2">
                {page.children.map((child) => (
                  <a key={child.id} href={`/workspace/${child.id}`}
                    className="flex items-center gap-2 p-3 border border-solar-border/20 hover:border-solar-border/40 hover:bg-solar-surface/20 transition-all">
                    <span>{child.icon ?? "📄"}</span>
                    <span className="font-mono text-[9px] text-solar-text/70 truncate">{child.title || "Sem título"}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
