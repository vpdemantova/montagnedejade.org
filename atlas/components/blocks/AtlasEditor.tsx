"use client"

import "@blocknote/core/fonts/inter.css"
import "@blocknote/react/style.css"

import { useCallback, useEffect, useRef, useState } from "react"
import { useCreateBlockNote, BlockNoteViewRaw as BlockNoteView } from "@blocknote/react"
import type { Block } from "@blocknote/core"
import { useRouter }          from "next/navigation"
import { useSolarStore }      from "@/atlas/lib/store"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS, STATUS_LABELS, AreaType, ItemType, StatusType } from "@/atlas/types"
import { contentStats, generateMarkdownMirror, resolveContentPath } from "@/atlas/lib/export"
import { TagLink } from "@/atlas/components/ui/TagLink"

// ── Tipos de Relação ───────────────────────────────────────────────────────────

type RelationEdge = {
  id:           string
  fromItemId:   string
  toItemId:     string
  relationType: string
  fromItem:     { id: string; title: string; type: string; area: string }
  toItem:       { id: string; title: string; type: string; area: string }
}

const RELATION_TYPES = [
  "é parte de", "contém", "influenciou", "foi influenciado por",
  "criou", "foi criado por", "referência", "ver também",
  "precede", "sucede", "colaborou com",
]

// ── Tipos internos ────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error"

type Props = {
  item:        AtlasItemWithTags
  redirectOnSave?: string
}

// ── Tag chip input ────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState("")

  const add = () => {
    const v = input.trim().toLowerCase()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput("")
  }

  return (
    <div className="flex items-center flex-wrap gap-1">
      {tags.map((tag) => (
        <TagLink
          key={tag}
          tag={tag}
          onDelete={() => onChange(tags.filter((t) => t !== tag))}
        />
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() }
          if (e.key === "Backspace" && !input && tags.length) {
            onChange(tags.slice(0, -1))
          }
        }}
        onBlur={add}
        placeholder="+ tag"
        className="text-[9px] font-mono bg-transparent border-none outline-none text-solar-muted/60 placeholder:text-solar-muted/30 w-14"
      />
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

// Temas do Solar que têm fundo claro
const LIGHT_THEMES = new Set([
  "papel-amarelo","manuscrito","gelo","museu","mapa-antigo",
  "laboratorio","tinta-china","solar-inverso",
])

export function AtlasEditor({ item, redirectOnSave }: Props) {
  const router      = useRouter()
  const activeTheme = useSolarStore((s) => s.theme)
  const bnTheme     = LIGHT_THEMES.has(activeTheme) ? "light" : "dark"

  // ── Estado de propriedades ──────────────────────────────────────────────
  const [title,      setTitle]      = useState(item.title)
  const [area,       setArea]       = useState(item.area)
  const [type,       setType]       = useState(item.type)
  const [status,     setStatus]     = useState(item.status)
  const [isFavorite, setIsFavorite] = useState(item.isFavorite)
  const [tags,       setTags]       = useState<string[]>(item.tags.map((t) => t.name))
  const [coverImage, setCoverImage] = useState<string>((item as Record<string, unknown>).coverImage as string ?? "")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [stats,      setStats]      = useState({ words: 0, chars: 0, minutes: 1 })

  // ── Interesse social ────────────────────────────────────────────────────
  const [myInterest,      setMyInterest]      = useState<number>(0) // 0 = sem interesse, 1-5 = rating
  const [interestLoading, setInterestLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/social/interests?atlasItemId=${item.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { rating?: number } | null) => {
        if (data && typeof data.rating === "number") setMyInterest(data.rating)
      })
      .catch(() => {/* não autenticado, ignorar */})
  }, [item.id])

  const toggleInterest = async () => {
    setInterestLoading(true)
    if (myInterest > 0) {
      await fetch(`/api/social/interests?atlasItemId=${item.id}`, { method: "DELETE" })
      setMyInterest(0)
    } else {
      const res = await fetch("/api/social/interests", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ atlasItemId: item.id, rating: 5 }),
      })
      if (res.ok) setMyInterest(5)
    }
    setInterestLoading(false)
  }

  // ── IA ──────────────────────────────────────────────────────────────────
  const [aiTagsLoading,  setAiTagsLoading]  = useState(false)
  const [aiImageLoading, setAiImageLoading] = useState(false)
  const [aiImagePrompt,  setAiImagePrompt]  = useState(item.title)
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null)
  const [aiProvider,     setAiProvider]     = useState<"gemini" | "replicate">("gemini")
  const [aiTagsError,    setAiTagsError]    = useState<string | null>(null)
  const [aiImageError,   setAiImageError]   = useState<string | null>(null)

  const suggestTags = async () => {
    setAiTagsLoading(true)
    setAiTagsError(null)
    try {
      const text = editor.document
        .flatMap((b) => ((b.content ?? []) as Array<{ text?: string }>).map((c) => c.text ?? ""))
        .join(" ")
        .slice(0, 1000)
      const res  = await fetch("/api/ai/text", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type: "tags", title, content: text }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const { result } = await res.json() as { result?: string }
      if (result) {
        const newTags = result.split(/[,\n]+/).map((t) => t.trim().toLowerCase()).filter(Boolean)
        const merged  = Array.from(new Set([...tags, ...newTags]))
        setTags(merged)
        void save({ tags: merged })
      }
    } catch (e) {
      setAiTagsError(e instanceof Error ? e.message : "Falha na IA")
    } finally { setAiTagsLoading(false) }
  }

  const generateAiImage = async () => {
    setAiImageLoading(true)
    setAiImagePreview(null)
    setAiImageError(null)
    try {
      const res  = await fetch("/api/ai/image", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prompt: aiImagePrompt, provider: aiProvider }),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const { url, error } = await res.json() as { url?: string; error?: string }
      if (error) throw new Error(error)
      if (url) setAiImagePreview(url)
    } catch (e) {
      setAiImageError(e instanceof Error ? e.message : "Falha na geração de imagem")
    } finally { setAiImageLoading(false) }
  }

  // ── Painel lateral ──────────────────────────────────────────────────────
  const [sidePanel,   setSidePanel]   = useState<"none" | "meta" | "relations">("none")
  const [relations,   setRelations]   = useState<RelationEdge[]>([])
  const [relLoading,  setRelLoading]  = useState(false)
  const [relSearch,   setRelSearch]   = useState("")
  const [relResults,  setRelResults]  = useState<AtlasItemWithTags[]>([])
  const [relType,     setRelType]     = useState(RELATION_TYPES[0]!)
  const [coverDraft,  setCoverDraft]  = useState(coverImage)

  const loadRelations = useCallback(async () => {
    setRelLoading(true)
    try {
      const res = await fetch(`/api/atlas/${item.id}/relations`)
      setRelations(await res.json() as RelationEdge[])
    } finally { setRelLoading(false) }
  }, [item.id])

  const searchItems = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setRelResults([]); return }
    const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await res.json() as Array<{ item: AtlasItemWithTags }>
    setRelResults(data.map((d) => d.item).filter((i) => i.id !== item.id).slice(0, 8))
  }, [item.id])

  const addRelation = useCallback(async (toItemId: string) => {
    await fetch(`/api/atlas/${item.id}/relations`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ toItemId, relationType: relType }),
    })
    void loadRelations()
    setRelSearch("")
    setRelResults([])
  }, [item.id, relType, loadRelations])

  const removeRelation = useCallback(async (relationId: string) => {
    await fetch(`/api/atlas/${item.id}/relations?relationId=${relationId}`, { method: "DELETE" })
    setRelations((prev) => prev.filter((r) => r.id !== relationId))
  }, [item.id])

  const saveCoverImage = useCallback(async (url: string) => {
    setCoverImage(url)
    await fetch(`/api/atlas/${item.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ coverImage: url }),
    })
  }, [item.id])

  useEffect(() => {
    if (sidePanel === "relations" && relations.length === 0 && !relLoading) {
      void loadRelations()
    }
  }, [sidePanel, relations.length, relLoading, loadRelations])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirty     = useRef(false)

  // Avisa o usuário antes de fechar com mudanças não salvas
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty.current) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  // ── Inicializa o editor BlockNote ──────────────────────────────────────
  const initialContent: Block[] | undefined = (() => {
    if (!item.content) return undefined
    try { return JSON.parse(item.content) as Block[] } catch { return undefined }
  })()

  const editor = useCreateBlockNote({ initialContent })

  // ── Calcula estatísticas do documento ─────────────────────────────────
  useEffect(() => {
    const text = editor.document
      .flatMap((b) => {
        const inline = (b.content ?? []) as Array<{ type: string; text?: string }>
        return inline.map((c) => c.text ?? "")
      })
      .join(" ")
    setStats(contentStats(text))
  }, [editor.document])

  // ── Auto-save com debounce 2s ─────────────────────────────────────────
  const save = useCallback(async (overrides?: Partial<{
    title: string; area: string; type: string; status: string
    isFavorite: boolean; tags: string[]; coverImage: string
  }>) => {
    isDirty.current = false
    setSaveStatus("saving")
    try {
      const blocks        = editor.document
      const content       = JSON.stringify(blocks)
      const markdownBody  = await editor.blocksToMarkdownLossy(blocks)

      const currentItem = {
        ...item,
        title:      overrides?.title      ?? title,
        area:       overrides?.area       ?? area,
        type:       overrides?.type       ?? type,
        status:     overrides?.status     ?? status,
        isFavorite: overrides?.isFavorite ?? isFavorite,
        tags:       (overrides?.tags ?? tags).map((name) => ({ id: name, name, color: "#C8A45A" })),
      }

      const contentPath    = resolveContentPath({ id: item.id, area: currentItem.area, hemisphere: item.hemisphere })
      const markdownMirror = generateMarkdownMirror(
        { ...currentItem, createdAt: item.createdAt, updatedAt: new Date() },
        markdownBody
      )

      await fetch(`/api/atlas/${item.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:      currentItem.title,
          area:       currentItem.area,
          type:       currentItem.type,
          status:     currentItem.status,
          isFavorite: currentItem.isFavorite,
          tagNames:   overrides?.tags ?? tags,
          coverImage: overrides?.coverImage ?? coverImage,
          content,
          contentPath,
          markdownMirror,
        }),
      })

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
      if (redirectOnSave) router.push(redirectOnSave)
    } catch {
      setSaveStatus("error")
    }
  }, [editor, title, area, type, status, isFavorite, tags, coverImage, item, redirectOnSave, router])

  const scheduleSave = useCallback(() => {
    isDirty.current = true
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void save(), 2000)
  }, [save])

  // Salva com Cmd/Ctrl + S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); void save() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [save])

  // ── Helpers de prop change que trigam save ─────────────────────────────
  const updateProp = <T extends string | boolean>(
    setter: (v: T) => void,
    key: string,
    value: T
  ) => {
    setter(value)
    void save({ [key]: value } as Parameters<typeof save>[0])
  }

  const statusColor: Record<string, string> = {
    ACTIVE:    "text-solar-amber",
    FAVORITE:  "text-solar-amber",
    COMPLETED: "text-solar-green",
    ARCHIVED:  "text-solar-red",
    BACKLOG:   "text-solar-muted/60",
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Cabeçalho de propriedades ─────────────────────────────────── */}
      <div className="border-b border-solar-border/30 bg-solar-void">
        <div className="max-w-4xl mx-auto px-12 pt-10 pb-6 space-y-5">
          {/* Cover image banner */}
          {coverImage && (
            <div className="relative w-full aspect-[16/5] overflow-hidden -mx-0">
              <img src={coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-solar-void/80" />
            </div>
          )}

          {/* Título inline */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void save({ title })}
            placeholder="Sem título"
            className="
              w-full bg-transparent border-none outline-none
              font-display text-[36px] leading-tight text-solar-text
              placeholder:text-solar-muted/25
            "
          />

          {/* Propriedades em linha */}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-3">

            {/* Área */}
            <label className="flex items-center gap-2">
              <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/45">Área</span>
              <select
                value={area}
                onChange={(e) => updateProp(setArea, "area", e.target.value)}
                className="bg-transparent text-[10px] font-mono text-solar-text/70 border-none outline-none cursor-pointer hover:text-solar-amber transition-solar"
              >
                {Object.entries(AREA_LABELS).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: "#13131A" }}>{v}</option>
                ))}
              </select>
            </label>

            {/* Tipo */}
            <label className="flex items-center gap-2">
              <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/45">Tipo</span>
              <select
                value={type}
                onChange={(e) => updateProp(setType, "type", e.target.value)}
                className="bg-transparent text-[10px] font-mono text-solar-text/70 border-none outline-none cursor-pointer hover:text-solar-amber transition-solar"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: "#13131A" }}>{v}</option>
                ))}
              </select>
            </label>

            {/* Status */}
            <label className="flex items-center gap-2">
              <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/45">Status</span>
              <select
                value={status}
                onChange={(e) => updateProp(setStatus, "status", e.target.value)}
                className={`bg-transparent text-[10px] font-mono border-none outline-none cursor-pointer transition-solar ${statusColor[status] ?? "text-solar-muted/60"}`}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: "#13131A" }}>{v}</option>
                ))}
              </select>
            </label>

            {/* Favorito */}
            <button
              onClick={() => updateProp(setIsFavorite, "isFavorite", !isFavorite)}
              className={`text-base transition-solar ${isFavorite ? "text-solar-amber" : "text-solar-muted/35 hover:text-solar-muted/70"}`}
              title="Favorito"
            >
              {isFavorite ? "★" : "☆"}
            </button>

            {/* Interesse (perfil social) */}
            <button
              onClick={toggleInterest}
              disabled={interestLoading}
              className={`text-base transition-solar disabled:opacity-40 ${myInterest > 0 ? "text-rose-400" : "text-solar-muted/35 hover:text-solar-muted/70"}`}
              title={myInterest > 0 ? "Remover do meu perfil" : "Adicionar ao meu perfil"}
            >
              {myInterest > 0 ? "♥" : "♡"}
            </button>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/45 flex-shrink-0">Tags</span>
            <TagInput
              tags={tags}
              onChange={(newTags) => {
                setTags(newTags)
                void save({ tags: newTags })
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Editor BlockNote ──────────────────────────────────────────────── */}
      <div
        className="flex-1 max-w-4xl mx-auto w-full px-12 py-8"
        style={{
          // Segue as variáveis CSS do tema ativo (claro ou escuro)
          "--bn-colors-editor-background":          "rgb(var(--c-void))",
          "--bn-colors-editor-text":                "rgb(var(--c-text))",
          "--bn-colors-menu-background":            "rgb(var(--c-deep))",
          "--bn-colors-tooltip-background":         "rgb(var(--c-deep))",
          "--bn-colors-hovered-background":         "rgb(var(--c-surface))",
          "--bn-colors-selected-background":        "rgb(var(--c-accent) / 0.15)",
          "--bn-colors-disabled-background":        "rgb(var(--c-surface))",
          "--bn-colors-shadow":                     "rgba(0,0,0,0.3)",
          "--bn-colors-border":                     "rgb(var(--c-border) / 0.4)",
          "--bn-colors-side-menu":                  "rgb(var(--c-muted))",
          "--bn-colors-highlights-gray-background": "rgb(var(--c-surface))",
          "--bn-font-family":                       "var(--font-ibm-plex-mono)",
        } as React.CSSProperties}
      >
        <BlockNoteView
          editor={editor}
          theme={bnTheme}
          onChange={scheduleSave}
        />
      </div>

      {/* ── Rodapé ────────────────────────────────────────────────────────── */}
      <div className="border-t border-solar-border/20 bg-solar-void">
        <div className="max-w-4xl mx-auto px-12 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="text-[8px] font-mono text-solar-muted/40">{stats.words} palavras</span>
            <span className="text-[8px] font-mono text-solar-muted/30">{stats.chars} chars</span>
            <span className="text-[8px] font-mono text-solar-muted/30">~{stats.minutes} min</span>
          </div>
          <div className="flex items-center gap-3">
            {/* IA: sugerir tags */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => void suggestTags()}
                disabled={aiTagsLoading}
                className="text-[8px] font-mono uppercase tracking-widest transition-solar px-2 py-0.5 border border-solar-border/20 text-solar-muted/35 hover:text-solar-amber hover:border-solar-amber/30 disabled:opacity-30"
                title="Sugerir tags com IA"
              >
                {aiTagsLoading ? "…" : "✦ Tags"}
              </button>
              {aiTagsError && (
                <span className="text-[8px] font-mono text-red-400/70">{aiTagsError}</span>
              )}
            </div>

            {/* Painel lateral — botões */}
            <button
              onClick={() => setSidePanel((p) => p === "meta" ? "none" : "meta")}
              className={`text-[8px] font-mono uppercase tracking-widest transition-solar px-2 py-0.5 border ${sidePanel === "meta" ? "border-solar-amber/40 text-solar-amber" : "border-solar-border/20 text-solar-muted/35 hover:text-solar-muted"}`}
            >
              Imagem
            </button>
            <button
              onClick={() => setSidePanel((p) => p === "relations" ? "none" : "relations")}
              className={`text-[8px] font-mono uppercase tracking-widest transition-solar px-2 py-0.5 border ${sidePanel === "relations" ? "border-solar-amber/40 text-solar-amber" : "border-solar-border/20 text-solar-muted/35 hover:text-solar-muted"}`}
            >
              Relações {relations.length > 0 && `(${relations.length})`}
            </button>
            <span className={`text-[8px] font-mono uppercase tracking-widest transition-all ${
              saveStatus === "saving" ? "text-solar-muted/50 animate-pulse" :
              saveStatus === "saved"  ? "text-solar-green/70" :
              saveStatus === "error"  ? "text-solar-red/70" :
              "text-solar-muted/25"
            }`}>
              {saveStatus === "saving" ? "Salvando…" : saveStatus === "saved" ? "Salvo ✓" :
               saveStatus === "error"  ? "Erro" : "⌘S"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Painel lateral: Cover Image ────────────────────────────────── */}
      {sidePanel === "meta" && (
        <div className="fixed right-0 top-0 bottom-0 w-72 z-40 border-l border-solar-border/30 bg-solar-void flex flex-col pb-14">
          <div className="px-5 py-4 border-b border-solar-border/20 flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/60">Cover Image</span>
            <button onClick={() => setSidePanel("none")} className="text-solar-muted/30 hover:text-solar-muted text-sm">×</button>
          </div>
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Preview */}
            {coverDraft && (
              <div className="aspect-[16/9] overflow-hidden border border-solar-border/20">
                <img src={coverDraft} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {!coverDraft && (
              <div className="aspect-[16/9] border border-dashed border-solar-border/20 flex items-center justify-center">
                <span className="text-[9px] font-mono text-solar-muted/25">Sem imagem</span>
              </div>
            )}
            {/* URL input */}
            <div>
              <label className="block text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/40 mb-1.5">URL da imagem</label>
              <input
                type="text"
                value={coverDraft}
                onChange={(e) => setCoverDraft(e.target.value)}
                placeholder="https://…"
                className="w-full bg-solar-deep/60 border border-solar-border/30 px-3 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => void saveCoverImage(coverDraft)}
                className="flex-1 py-1.5 border border-solar-amber/40 text-[9px] font-mono uppercase tracking-widest text-solar-amber hover:bg-solar-amber/10 transition-solar"
              >
                Salvar
              </button>
              {coverImage && (
                <button
                  onClick={() => { setCoverDraft(""); void saveCoverImage("") }}
                  className="px-3 py-1.5 border border-solar-border/20 text-[9px] font-mono text-solar-muted/40 hover:text-solar-red/60 transition-solar"
                >
                  Remover
                </button>
              )}
            </div>

            {/* ── Gerar com IA ─────────────────────────────────────── */}
            <div className="border-t border-solar-border/20 pt-4 space-y-3">
              <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40">Gerar com IA</p>

              {/* Provider toggle */}
              <div className="flex gap-1">
                {(["gemini", "replicate"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAiProvider(p)}
                    className={`flex-1 py-1 text-[7px] font-mono uppercase tracking-widest border transition-solar ${
                      aiProvider === p
                        ? "border-solar-amber/50 text-solar-amber bg-solar-amber/10"
                        : "border-solar-border/20 text-solar-muted/35 hover:text-solar-muted"
                    }`}
                  >
                    {p === "gemini" ? "Gemini" : "Flux"}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={aiImagePrompt}
                onChange={(e) => setAiImagePrompt(e.target.value)}
                placeholder="Descreva a imagem…"
                className="w-full bg-solar-deep/60 border border-solar-border/30 px-3 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
              />

              <button
                onClick={() => void generateAiImage()}
                disabled={aiImageLoading || !aiImagePrompt.trim()}
                className="w-full py-1.5 border border-solar-border/30 text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 hover:text-solar-amber hover:border-solar-amber/30 transition-solar disabled:opacity-30"
              >
                {aiImageLoading ? "Gerando…" : "✦ Gerar imagem"}
              </button>
              {aiImageError && (
                <p className="text-[8px] font-mono text-red-400/70">{aiImageError}</p>
              )}

              {/* Preview da imagem gerada */}
              {aiImagePreview && (
                <div className="space-y-2">
                  <div className="aspect-[16/9] overflow-hidden border border-solar-amber/20">
                    <img src={aiImagePreview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => { setCoverDraft(aiImagePreview); void saveCoverImage(aiImagePreview) }}
                    className="w-full py-1.5 border border-solar-amber/40 text-[9px] font-mono uppercase tracking-widest text-solar-amber hover:bg-solar-amber/10 transition-solar"
                  >
                    Usar como capa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Painel lateral: Relações ───────────────────────────────────── */}
      {sidePanel === "relations" && (
        <div className="fixed right-0 top-0 bottom-0 w-80 z-40 border-l border-solar-border/30 bg-solar-void flex flex-col pb-14">
          <div className="px-5 py-4 border-b border-solar-border/20 flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/60">Relações</span>
            <button onClick={() => setSidePanel("none")} className="text-solar-muted/30 hover:text-solar-muted text-sm">×</button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Adicionar relação */}
            <div className="space-y-2">
              <label className="block text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/40">Tipo de relação</label>
              <select
                value={relType}
                onChange={(e) => setRelType(e.target.value)}
                className="w-full bg-solar-deep/60 border border-solar-border/30 px-2 py-1.5 text-[10px] font-mono text-solar-text/80 focus:outline-none"
                style={{ background: "#0D0D0F" }}
              >
                {RELATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                type="text"
                value={relSearch}
                onChange={(e) => { setRelSearch(e.target.value); void searchItems(e.target.value) }}
                placeholder="Buscar item…"
                className="w-full bg-solar-deep/60 border border-solar-border/30 px-3 py-1.5 text-[10px] font-mono text-solar-text placeholder:text-solar-muted/25 focus:outline-none focus:border-solar-amber/40 transition-solar"
              />
              {relResults.length > 0 && (
                <div className="border border-solar-border/20 divide-y divide-solar-border/10">
                  {relResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => void addRelation(r.id)}
                      className="w-full text-left px-3 py-2 hover:bg-solar-surface/30 transition-solar"
                    >
                      <p className="text-[10px] font-mono text-solar-text/80 truncate">{r.title}</p>
                      <p className="text-[8px] font-mono text-solar-muted/40">{AREA_LABELS[r.area] ?? r.area}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Lista de relações existentes */}
            <div>
              <p className="text-[8px] font-mono uppercase tracking-[0.15em] text-solar-muted/40 mb-2">
                Relações existentes {relLoading && "…"}
              </p>
              {relations.length === 0 && !relLoading && (
                <p className="text-[9px] font-mono text-solar-muted/25">Nenhuma relação ainda.</p>
              )}
              <div className="space-y-1.5">
                {relations.map((rel) => {
                  const other = rel.fromItemId === item.id ? rel.toItem : rel.fromItem
                  const dir   = rel.fromItemId === item.id ? "→" : "←"
                  return (
                    <div key={rel.id} className="group flex items-start gap-2 p-2 border border-solar-border/15 hover:border-solar-border/30 transition-solar">
                      <span className="text-solar-amber/50 font-mono text-[10px] flex-shrink-0 mt-0.5">{dir}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-mono text-solar-muted/35 mb-0.5 italic">{rel.relationType}</p>
                        <p className="text-[10px] font-mono text-solar-text/75 truncate">{other.title}</p>
                        <p className="text-[8px] font-mono text-solar-muted/30">{AREA_LABELS[other.area] ?? other.area}</p>
                      </div>
                      <button
                        onClick={() => void removeRelation(rel.id)}
                        className="opacity-0 group-hover:opacity-100 text-solar-muted/30 hover:text-solar-red/60 transition-solar text-xs flex-shrink-0"
                        title="Remover"
                      >×</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
