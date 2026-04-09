"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { X, Zap, BookOpen, FileText, Target, BookHeart } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type CaptureMode = "nota" | "ideia" | "link" | "diario" | "meta"

const MODES: { id: CaptureMode; label: string; shortcut: string; icon: React.ReactNode; placeholder: string }[] = [
  { id: "nota",   label: "Nota",    shortcut: "N", icon: <FileText   size={13} strokeWidth={1.5} />, placeholder: "Escreva uma nota rápida…" },
  { id: "ideia",  label: "Ideia",   shortcut: "I", icon: <Zap        size={13} strokeWidth={1.5} />, placeholder: "Capture uma ideia…" },
  { id: "link",   label: "Link",    shortcut: "L", icon: <BookOpen   size={13} strokeWidth={1.5} />, placeholder: "Cole um link…" },
  { id: "diario", label: "Diário",  shortcut: "D", icon: <BookHeart  size={13} strokeWidth={1.5} />, placeholder: "Escreva no diário de hoje…" },
  { id: "meta",   label: "Meta",    shortcut: "M", icon: <Target     size={13} strokeWidth={1.5} />, placeholder: "Nova meta ou objetivo…" },
]

// ── Store: global open state ──────────────────────────────────────────────────

type QCStore = { open: boolean; mode: CaptureMode; setOpen: (v: boolean, mode?: CaptureMode) => void }

let _listeners: Array<(s: QCStore) => void> = []
let _state: QCStore = {
  open: false,
  mode: "nota",
  setOpen: (open, mode) => {
    _state = { ..._state, open, mode: mode ?? _state.mode }
    _listeners.forEach((fn) => fn(_state))
  },
}

export function useQuickCapture() {
  const [state, setState] = useState(_state)
  useEffect(() => {
    _listeners.push(setState)
    return () => { _listeners = _listeners.filter((fn) => fn !== setState) }
  }, [])
  return state
}

export function openQuickCapture(mode?: CaptureMode) {
  _state.setOpen(true, mode)
}

// ── Tag autocomplete hook ─────────────────────────────────────────────────────

function useTagSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return }
    const tid = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/atlas/tags?q=${encodeURIComponent(query)}`)
        const data = await res.json() as { name: string }[]
        setSuggestions(data.map((t) => t.name).slice(0, 6))
      } catch { setSuggestions([]) }
    }, 200)
    return () => clearTimeout(tid)
  }, [query])
  return suggestions
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuickCapture() {
  const { open, mode, setOpen } = useQuickCapture()
  const router  = useRouter()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const urlRef  = useRef<HTMLInputElement>(null)

  const [title,      setTitle]      = useState("")
  const [body,       setBody]       = useState("")
  const [url,        setUrl]        = useState("")
  const [tagInput,   setTagInput]   = useState("")
  const [tags,       setTags]       = useState<string[]>([])
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)

  const suggestions = useTagSuggestions(tagInput)

  const activeMode = MODES.find((m) => m.id === mode) ?? MODES[0]!

  const close = useCallback(() => {
    setOpen(false)
    // Reset after animation
    setTimeout(() => {
      setTitle(""); setBody(""); setUrl(""); setTagInput(""); setTags([]); setSaved(false)
    }, 200)
  }, [setOpen])

  // Focus textarea on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (mode === "link") urlRef.current?.focus()
        else bodyRef.current?.focus()
      }, 80)
    }
  }, [open, mode])

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "Enter") { e.preventDefault(); void handleSave(); return }
        // Mode switching: Cmd+1..5
        const idx = parseInt(e.key) - 1
        if (idx >= 0 && idx < MODES.length) {
          e.preventDefault()
          setOpen(true, MODES[idx]!.id)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close])

  const addTag = (name: string) => {
    const clean = name.trim().toLowerCase().replace(/\s+/g, "-")
    if (clean && !tags.includes(clean)) setTags((t) => [...t, clean])
    setTagInput("")
  }

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput) }
    if (e.key === "Backspace" && !tagInput) setTags((t) => t.slice(0, -1))
  }

  async function handleSave() {
    const text = mode === "link" ? url : body
    if (!text.trim() && !title.trim()) return

    setSaving(true)
    try {
      if (mode === "diario") {
        // Append to today's journal
        const res = await fetch("/api/compass/diario/today", { method: "POST" })
        if (res.ok) {
          const entry = await res.json() as { id: string }
          setSaved(true)
          setTimeout(() => { close(); router.push(`/compass/diario`) }, 700)
          return
        }
      }

      if (mode === "meta") {
        await fetch("/api/compass/goals", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ title: title || body, description: body !== title ? body : "", horizon: "SHORT" }),
        })
        setSaved(true)
        setTimeout(() => { close(); router.push("/compass/metas") }, 700)
        return
      }

      // nota / ideia / link → Atlas item
      const typeMap: Record<string, string> = { nota: "CONCEPT", ideia: "CONCEPT", link: "CONCEPT" }
      const payload = {
        title:    title || (body.split("\n")[0]?.slice(0, 80) ?? "Sem título"),
        area:     "NOTAS",
        type:     typeMap[mode] ?? "CONCEPT",
        content:  mode === "link" ? JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: url }] }] }) : "",
        metadata: mode === "link" ? JSON.stringify({ url, annotation: body }) : undefined,
        tags,
        status:   "ACTIVE",
      }

      const res = await fetch("/api/atlas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      if (res.ok) {
        const item = await res.json() as { slug?: string; id: string }
        setSaved(true)
        setTimeout(() => {
          close()
          router.push(`/atlas/${item.slug ?? item.id}`)
        }, 700)
      }
    } catch {
      // silent fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-solar-void/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-[201] w-full max-w-xl"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="bg-solar-deep border border-solar-border/40 shadow-2xl overflow-hidden">

              {/* ── Mode tabs ── */}
              <div className="flex border-b border-solar-border/20">
                {MODES.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setOpen(true, m.id)}
                    className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 text-[9px] font-mono uppercase tracking-[0.15em] transition-colors border-r last:border-r-0 border-solar-border/20 ${
                      mode === m.id
                        ? "text-solar-text bg-solar-surface/40 border-b-2 border-b-solar-accent"
                        : "text-solar-muted/35 hover:text-solar-muted/60"
                    }`}
                  >
                    <span className="hidden sm:block">{m.icon}</span>
                    <span>{m.label}</span>
                    <span className="hidden sm:block text-solar-muted/20 text-[7px]">⌘{i + 1}</span>
                  </button>
                ))}
                <button
                  onClick={close}
                  className="flex items-center justify-center w-10 flex-shrink-0 text-solar-muted/30 hover:text-solar-muted/60 transition-colors border-l border-solar-border/20"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>

              {/* ── Body ── */}
              <div className="p-4 space-y-3">

                {/* Title (for nota/ideia/meta) */}
                {(mode === "nota" || mode === "ideia" || mode === "meta") && (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={mode === "meta" ? "Título da meta…" : "Título (opcional)…"}
                    className="w-full bg-transparent font-display text-[17px] text-solar-text placeholder:text-solar-muted/25 outline-none border-b border-solar-border/20 pb-2 focus:border-solar-accent/40 transition-colors"
                  />
                )}

                {/* URL input for link mode */}
                {mode === "link" && (
                  <input
                    ref={urlRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                    className="w-full bg-transparent font-mono text-[12px] text-solar-text placeholder:text-solar-muted/25 outline-none border-b border-solar-border/20 pb-2 focus:border-solar-accent/40 transition-colors"
                  />
                )}

                {/* Main textarea */}
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={activeMode.placeholder}
                  rows={mode === "diario" ? 5 : 3}
                  className="w-full bg-transparent text-[13px] font-sans text-solar-text/85 placeholder:text-solar-muted/25 outline-none resize-none leading-relaxed"
                />

                {/* Tags (not for diario/meta) */}
                {mode !== "diario" && mode !== "meta" && (
                  <div className="relative border-t border-solar-border/15 pt-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 font-mono text-[8px] text-solar-muted/60 border border-solar-border/25 px-1.5 py-0.5"
                        >
                          #{t}
                          <button onClick={() => setTags((ts) => ts.filter((x) => x !== t))} className="text-solar-muted/30 hover:text-solar-text ml-0.5">×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKey}
                        placeholder={tags.length === 0 ? "Adicionar tag…" : "+tag"}
                        className="bg-transparent font-mono text-[10px] text-solar-muted/50 placeholder:text-solar-muted/20 outline-none min-w-[80px] flex-1"
                      />
                    </div>

                    {/* Tag suggestions */}
                    {suggestions.length > 0 && tagInput && (
                      <div className="absolute top-full left-0 z-10 bg-solar-deep border border-solar-border/30 mt-1 min-w-[160px] shadow-xl">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
                            className="w-full text-left px-3 py-1.5 font-mono text-[10px] text-solar-muted/60 hover:text-solar-text hover:bg-solar-surface/40 transition-colors"
                          >
                            #{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-solar-border/15 bg-solar-void/30">
                <span className="font-mono text-[8px] text-solar-muted/25 tracking-wide">
                  ⌘↵ salvar · Esc fechar
                </span>
                <button
                  onClick={() => void handleSave()}
                  disabled={saving || saved || (!body.trim() && !url.trim() && !title.trim())}
                  className={`flex items-center gap-2 px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed ${
                    saved
                      ? "text-solar-text/60 border border-solar-border/20"
                      : "text-solar-accent border border-solar-accent/30 hover:bg-solar-accent/10 disabled:text-solar-muted/25 disabled:border-solar-border/15"
                  }`}
                >
                  {saved ? "✓ Salvo" : saving ? "Salvando…" : "Salvar →"}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Floating trigger button ───────────────────────────────────────────────────

export function QuickCaptureButton() {
  return (
    <button
      onClick={() => openQuickCapture("nota")}
      className="fixed bottom-24 right-5 z-[150] md:bottom-8 md:right-8 w-11 h-11 bg-solar-text text-solar-void flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all"
      title="Captura rápida (⌘N)"
      aria-label="Nova nota rápida"
    >
      <span className="text-xl leading-none font-display font-bold">+</span>
    </button>
  )
}
