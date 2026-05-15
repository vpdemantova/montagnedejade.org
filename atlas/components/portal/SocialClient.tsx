"use client"

import {
  useState, useEffect, useCallback, useRef, useMemo
} from "react"
import Link from "next/link"
import Image from "next/image"

// ── Seções do menu ────────────────────────────────────────────────────────────

const NAV = [
  { id: "bubble",     label: "◎ Bubble Mixture",         short: "Bubble"    },
  { id: "radar",      label: "// Radar Report",           short: "Radar"     },
  { id: "feed",       label: "▸ Feed",                   short: "Feed"      },
  { id: "grupos",     label: "⬡ Grupos",                  short: "Grupos"    },
  { id: "crises",     label: "◈ Crises",                  short: "Crises"    },
  { id: "avancos",    label: "⊹ Avanços",                 short: "Avanços"   },
  { id: "institutos", label: "◉ Institutos & Poderosos",  short: "Institutos"},
  { id: "comunidade", label: "○ Comunidade",              short: "Comunidade"},
  { id: "descobrir",  label: "◌ Descobrir",               short: "Descobrir" },
  { id: "colecao",    label: "◫ Coleção",                 short: "Coleção"   },
]

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Post     = { id: string; content: string; type: string; createdAt: string; liked?: boolean; author: { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string }; atlasItem?: { id: string; slug: string | null; title: string; area: string } | null; _count: { likes: number } }
type Me       = { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string }
type Match    = { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string; bio: string | null; commonInterests: number; _count: { followers: number } }
type Member   = { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string; bio: string | null; _count: { followers: number; posts: number; interests: number } }
type Token    = { id: string; tokenType: string; name: string; rarity: string; imageUrl: string | null; isEquipped: boolean }
type Notice   = { id: string; title: string; body: string; type: string; area: string; author: string | null }
type BubbleQ  = { id: string; n: number; text: string; type: string; options: string | null }

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#888", RARE: "#4A90D9", EPIC: "#9B59B6", LEGENDARY: "#C8A45A",
}

// ── Hook: seção ativa por IntersectionObserver ────────────────────────────────

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "")
  const refs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    ids.forEach((id) => {
      const el = refs.current.get(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => { if (entries[0]?.isIntersecting) setActive(id) },
        { rootMargin: "-35% 0px -60% 0px" }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [ids])

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el)
  }, [])

  return { active, setRef }
}

// ── Componente SectionTitle ───────────────────────────────────────────────────

function SectionTitle({ symbol, label, desc }: { symbol: string; label: string; desc?: string }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-[7px] uppercase tracking-[0.4em] mb-2"
        style={{ color: "rgb(var(--c-muted)/0.35)" }}>{symbol}</p>
      <h2 className="font-display text-2xl font-bold mb-2"
        style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text)/0.9)" }}>{label}</h2>
      {desc && <p className="font-mono text-[9.5px] leading-relaxed max-w-lg"
        style={{ color: "rgb(var(--c-muted)/0.55)" }}>{desc}</p>}
    </div>
  )
}

// ── Bubble Mixture ────────────────────────────────────────────────────────────

function BubbleMixture() {
  const [questions, setQuestions] = useState<BubbleQ[]>([])
  const [myAnswers, setMyAnswers] = useState<Record<string, string>>({})
  const [aggregated, setAggregated] = useState<Record<string, Record<string, number>>>({})
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [done, setDone] = useState(false)

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "anon"
    let sid = sessionStorage.getItem("ps-bubble-session")
    if (!sid) { sid = Math.random().toString(36).slice(2); sessionStorage.setItem("ps-bubble-session", sid) }
    return sid
  }, [])

  useEffect(() => {
    fetch(`/api/social/bubble?session=${sessionId}`)
      .then((r) => r.json())
      .then((d: { questions: BubbleQ[]; myAnswers: Record<string, string>; aggregated: Record<string, Record<string, number>> }) => {
        setQuestions(d.questions)
        setMyAnswers(d.myAnswers)
        setAggregated(d.aggregated)
        // Achar a primeira pergunta não respondida
        const firstUnanswered = d.questions.findIndex((q) => !d.myAnswers[q.id])
        setCurrentQ(firstUnanswered >= 0 ? firstUnanswered : d.questions.length - 1)
        if (Object.keys(d.myAnswers).length === d.questions.length && d.questions.length > 0) setDone(true)
        setLoading(false)
      })
  }, [sessionId])

  const answer = async (questionId: string, value: string) => {
    await fetch("/api/social/bubble", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ sessionId, questionId, answer: value }),
    })
    setMyAnswers((p) => ({ ...p, [questionId]: value }))
    if (currentQ < questions.length - 1) setCurrentQ((i) => i + 1)
    else setDone(true)
  }

  const q = questions[currentQ]
  const answered = Object.keys(myAnswers).length
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0

  return (
    <div>
      <SectionTitle
        symbol="◎ Seção Inicial"
        label="Bubble Mixture"
        desc={`Uma série de ${questions.length || 30} perguntas sem tópico — suas percepções somadas às de todos. Anônimo, honesto, coletivo.`}
      />

      {/* Progresso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <p className="font-mono text-[7.5px] uppercase tracking-widest" style={{ color: "rgb(var(--c-muted)/0.4)" }}>
            {answered} de {questions.length} respondidas
          </p>
          <p className="font-mono text-[7.5px]" style={{ color: "rgb(var(--c-accent)/0.7)" }}>
            {Math.round(progress)}%
          </p>
        </div>
        <div className="h-0.5 w-full" style={{ background: "rgb(var(--c-border)/0.2)" }}>
          <div className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "rgb(var(--c-accent))" }} />
        </div>
      </div>

      {loading ? (
        <p className="font-mono text-[9px] text-solar-muted/30 animate-pulse">Carregando perguntas…</p>
      ) : done ? (
        <div className="border border-solar-accent/20 bg-solar-accent/5 p-6 max-w-lg">
          <p className="font-display text-lg mb-2" style={{ color: "rgb(var(--c-accent))" }}>
            Obrigado pela sua percepção.
          </p>
          <p className="font-mono text-[9px] leading-relaxed" style={{ color: "rgb(var(--c-muted)/0.6)" }}>
            Suas respostas foram registradas e somadas ao Bubble Mixture.
            As perguntas restantes (até 100) serão adicionadas gradualmente.
          </p>
          <button onClick={() => { setDone(false); setCurrentQ(0) }}
            className="mt-4 font-mono text-[7.5px] uppercase tracking-widest px-3 py-1.5 border border-solar-border/25 text-solar-muted/50 hover:border-solar-accent/30 hover:text-solar-accent/70 transition-all">
            Rever respostas
          </button>
        </div>
      ) : q ? (
        <div className="max-w-xl">
          {/* Número e pergunta */}
          <div className="mb-6">
            <p className="font-mono text-[7px] uppercase tracking-[0.3em] mb-2"
              style={{ color: "rgb(var(--c-muted)/0.3)" }}>
              #{String(q.n).padStart(2, "0")}
            </p>
            <p className="font-display leading-snug"
              style={{ fontSize: "1.15rem", color: "rgb(var(--c-text)/0.88)", letterSpacing: "-0.01em" }}>
              {q.text}
            </p>
          </div>

          {/* Respostas */}
          {q.type === "scale" ? (
            <div className="flex gap-2 flex-wrap">
              {["1","2","3","4","5","6","7","8","9","10"].map((v) => {
                const isAnswered = myAnswers[q.id] === v
                const qAgg = aggregated[q.id] ?? {}
                const total = Object.values(qAgg).reduce((a, b) => a + b, 0)
                const pct   = total > 0 ? Math.round(((qAgg[v] ?? 0) / total) * 100) : 0
                return (
                  <button key={v} onClick={() => void answer(q.id, v)}
                    className="relative flex flex-col items-center gap-1 px-3 py-2 border transition-all"
                    style={{
                      borderColor: isAnswered ? "rgb(var(--c-accent))" : "rgb(var(--c-border)/0.25)",
                      background:  isAnswered ? "rgb(var(--c-accent)/0.1)" : "transparent",
                      color:       isAnswered ? "rgb(var(--c-accent))" : "rgb(var(--c-text)/0.55)",
                      minWidth:    40,
                    }}>
                    <span className="font-mono text-[11px] font-bold">{v}</span>
                    {pct > 0 && <span className="font-mono text-[6.5px]" style={{ color: "rgb(var(--c-muted)/0.4)" }}>{pct}%</span>}
                  </button>
                )
              })}
            </div>
          ) : q.type === "choice" && q.options ? (
            <div className="flex flex-col gap-2">
              {(JSON.parse(q.options) as string[]).map((opt) => {
                const isAnswered = myAnswers[q.id] === opt
                const qAgg = aggregated[q.id] ?? {}
                const total = Object.values(qAgg).reduce((a, b) => a + b, 0)
                const pct   = total > 0 ? Math.round(((qAgg[opt] ?? 0) / total) * 100) : 0
                return (
                  <button key={opt} onClick={() => void answer(q.id, opt)}
                    className="flex items-center justify-between px-4 py-3 border transition-all text-left"
                    style={{
                      borderColor: isAnswered ? "rgb(var(--c-accent))" : "rgb(var(--c-border)/0.2)",
                      background:  isAnswered ? "rgb(var(--c-accent)/0.08)" : "transparent",
                    }}>
                    <span className="font-mono text-[9.5px]"
                      style={{ color: isAnswered ? "rgb(var(--c-accent))" : "rgb(var(--c-text)/0.65)" }}>
                      {opt}
                    </span>
                    {pct > 0 && (
                      <span className="font-mono text-[7px] ml-4 flex-shrink-0"
                        style={{ color: "rgb(var(--c-muted)/0.4)" }}>
                        {pct}% concordam
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : null}

          {/* Nav perguntas */}
          <div className="flex items-center gap-3 mt-6">
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ((i) => i - 1)}
                className="font-mono text-[7.5px] uppercase tracking-widest text-solar-muted/40 hover:text-solar-muted/70 transition-colors">
                ← Anterior
              </button>
            )}
            {myAnswers[q.id] && currentQ < questions.length - 1 && (
              <button onClick={() => setCurrentQ((i) => i + 1)}
                className="font-mono text-[7.5px] uppercase tracking-widest text-solar-accent/60 hover:text-solar-accent transition-colors ml-auto">
                Próxima →
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Radar Report ──────────────────────────────────────────────────────────────

function RadarReport({ notices }: { notices: Notice[] }) {
  return (
    <div>
      <SectionTitle
        symbol="// Radar Report"
        label="Radar Report"
        desc="Quadro geral de acontecimentos, notícias e movimentos do mundo — curado pelo Portal Solar."
      />

      {notices.length === 0 ? (
        <div className="border border-solar-border/15 p-8 text-center">
          <p className="font-mono text-[9px] text-solar-muted/30 mb-2">Nenhum aviso no quadro.</p>
          <p className="font-mono text-[8px] text-solar-muted/20">Em breve: integração com fontes globais de notícias.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {notices.map((n) => {
            const typeColor: Record<string, string> = {
              OBRA: "#C8A45A", AVISO: "#E91E63", EVENTO: "#4A90D9",
              DESCOBERTA: "#2ECC71", HOMENAGEM: "#9B59B6", CITACAO: "#888",
            }
            const color = typeColor[n.type] ?? "#888"
            return (
              <div key={n.id} className="p-4 border border-solar-border/20 hover:border-solar-border/40 transition-colors"
                style={{ borderLeft: `2px solid ${color}50` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[6.5px] uppercase tracking-widest px-1.5 py-0.5"
                    style={{ background: `${color}15`, color }}>
                    {n.type}
                  </span>
                  <span className="font-mono text-[6.5px] uppercase tracking-widest"
                    style={{ color: "rgb(var(--c-muted)/0.35)" }}>
                    {n.area}
                  </span>
                </div>
                <p className="font-display text-[13px] leading-snug mb-1"
                  style={{ color: "rgb(var(--c-text)/0.82)", letterSpacing: "-0.01em" }}>
                  {n.title}
                </p>
                <p className="font-mono text-[8px] line-clamp-2 leading-relaxed"
                  style={{ color: "rgb(var(--c-muted)/0.5)" }}>
                  {n.body}
                </p>
                {n.author && (
                  <p className="font-mono text-[7px] mt-2" style={{ color: "rgb(var(--c-muted)/0.3)" }}>
                    — {n.author}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6">
        <Link href="/world" className="font-mono text-[8px] uppercase tracking-widest text-solar-accent/55 hover:text-solar-accent transition-colors">
          ▸ Ver Quadro Mundial completo →
        </Link>
      </div>
    </div>
  )
}

// ── Feed ──────────────────────────────────────────────────────────────────────

function FeedSection() {
  const [feed,       setFeed]       = useState<Post[]>([])
  const [me,         setMe]         = useState<Me | null>(null)
  const [postText,   setPostText]   = useState("")
  const [posting,    setPosting]    = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [cursor,     setCursor]     = useState<string | null>(null)
  const [likingIds,  setLikingIds]  = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch("/api/social/feed?limit=15").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
    ]).then(([feedData, meData]: [{ posts: Post[]; nextCursor: string | null }, Me | null]) => {
      setFeed(feedData.posts)
      setCursor(feedData.nextCursor)
      setMe(meData)
      setLoading(false)
    })
  }, [])

  const toggleLike = async (post: Post) => {
    if (likingIds.has(post.id)) return
    setLikingIds((s) => new Set(Array.from(s).concat(post.id)))
    const wasLiked = post.liked ?? false
    setFeed((prev) => prev.map((p) => p.id === post.id ? { ...p, liked: !wasLiked, _count: { likes: p._count.likes + (wasLiked ? -1 : 1) } } : p))
    await fetch(`/api/social/feed/${post.id}/like`, { method: "POST" })
    setLikingIds((s) => { const next = new Set(s); next.delete(post.id); return next })
  }

  const handlePost = async () => {
    if (!postText.trim() || posting) return
    setPosting(true)
    const res = await fetch("/api/social/feed", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: postText }),
    })
    if (res.ok) {
      const newPost = await res.json() as Post
      setFeed((p) => [{ ...newPost, liked: false, author: me! }, ...p])
      setPostText("")
    }
    setPosting(false)
  }

  return (
    <div>
      <SectionTitle symbol="▸ Feed" label="Feed" desc="Compartilhe descobertas, recomendações e pensamentos." />

      {me && (
        <div className="border border-solar-border/25 bg-solar-surface/15 p-4 space-y-3 mb-6">
          <textarea value={postText} onChange={(e) => setPostText(e.target.value)}
            placeholder="Compartilhe uma descoberta ou pensamento…" rows={3}
            className="w-full bg-transparent text-sm text-solar-text/80 placeholder:text-solar-muted/30 outline-none resize-none" />
          <div className="flex justify-end">
            <button onClick={() => void handlePost()} disabled={posting || !postText.trim()} className="btn btn-primary btn-sm">
              {posting ? "Publicando…" : "Publicar →"}
            </button>
          </div>
        </div>
      )}

      {loading ? <p className="font-mono text-[9px] text-solar-muted/30 animate-pulse">Carregando…</p> : (
        <div className="space-y-4">
          {feed.map((post) => (
            <div key={post.id} className="p-4 border border-solar-border/20 bg-solar-surface/10 space-y-2"
              style={{ borderLeft: `2px solid ${post.author.accentColor}30` }}>
              <div className="flex items-center gap-2">
                <Link href={`/perfil/${post.author.username}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden relative flex-shrink-0"
                    style={{ background: `${post.author.accentColor}25`, color: post.author.accentColor }}>
                    {post.author.avatarUrl
                      ? <Image src={post.author.avatarUrl} alt="" fill className="object-cover" unoptimized />
                      : post.author.displayName[0]?.toUpperCase()}
                  </div>
                </Link>
                <Link href={`/perfil/${post.author.username}`}
                  className="font-mono text-[8.5px] hover:opacity-70 transition-opacity"
                  style={{ color: post.author.accentColor }}>
                  @{post.author.username}
                </Link>
                <span className="font-mono text-[7.5px] text-solar-muted/30">
                  {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="text-sm text-solar-text/80 leading-relaxed">{post.content}</p>
              <button onClick={() => void toggleLike(post)}
                className={`font-mono text-[8px] transition-colors ${post.liked ? "text-solar-accent/80" : "text-solar-muted/35 hover:text-solar-muted/60"}`}>
                ♥ {post._count.likes}
              </button>
            </div>
          ))}
          {cursor && (
            <button onClick={async () => {
              const res  = await fetch(`/api/social/feed?limit=15&cursor=${cursor}`)
              const data = await res.json() as { posts: Post[]; nextCursor: string | null }
              setFeed((p) => [...p, ...data.posts])
              setCursor(data.nextCursor)
            }} className="btn btn-ghost btn-sm w-full">
              Carregar mais
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Grupos ────────────────────────────────────────────────────────────────────

const GRUPO_CATS = [
  { key: "musica",    label: "◎ Música",           areas: ["MUSICA","ARTES"],  types: ["MOVEMENT","CONCEPT"] },
  { key: "ciencia",   label: "⬡ Ciência & Pesquisa",areas: ["CIENCIAS"],        types: ["MOVEMENT","CONCEPT"] },
  { key: "arte",      label: "▸ Artes & Criação",   areas: ["ARTES","OBRAS"],   types: ["MOVEMENT"] },
  { key: "educacao",  label: "◈ Educação",          areas: ["HISTORIA"],        types: ["MOVEMENT"] },
  { key: "filosofia", label: "◉ Filosofia",         areas: ["FILOSOFIA"],       types: ["MOVEMENT","CONCEPT"] },
  { key: "politica",  label: "// Política",         areas: ["HISTORIA"],        types: ["MOVEMENT"] },
]

function GruposSection() {
  const [activeGrupo, setActiveGrupo] = useState("musica")

  return (
    <div>
      <SectionTitle
        symbol="⬡ Grupos"
        label="Grupos & Movimentos"
        desc="Grupos, escolas, instituições e movimentos — organizados por área e referenciados no Atlas."
      />

      <div className="flex flex-wrap gap-1.5 mb-6">
        {GRUPO_CATS.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveGrupo(key)}
            className="font-mono text-[7.5px] uppercase tracking-widest px-3 py-1.5 border transition-all"
            style={{
              borderColor: activeGrupo === key ? "rgb(var(--c-accent)/0.5)" : "rgb(var(--c-border)/0.2)",
              background:  activeGrupo === key ? "rgb(var(--c-accent)/0.08)" : "transparent",
              color:       activeGrupo === key ? "rgb(var(--c-accent))" : "rgb(var(--c-muted)/0.5)",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Placeholder — em breve conectado com Atlas items */}
      <div className="border border-solar-border/15 p-6 text-center">
        <p className="font-mono text-[9px] text-solar-muted/35 mb-2">
          Esta seção conecta grupos ao Atlas automaticamente.
        </p>
        <p className="font-mono text-[8px] text-solar-muted/25 mb-4">
          Categoria selecionada: <span style={{ color: "rgb(var(--c-accent)/0.6)" }}>
            {GRUPO_CATS.find((g) => g.key === activeGrupo)?.label}
          </span>
        </p>
        <Link href={`/?area=${GRUPO_CATS.find((g) => g.key === activeGrupo)?.areas[0]}`}
          className="font-mono text-[7.5px] uppercase tracking-widest text-solar-accent/55 hover:text-solar-accent transition-colors">
          ▸ Ver no Atlas →
        </Link>
      </div>
    </div>
  )
}

// ── Crises da Humanidade ──────────────────────────────────────────────────────

const CRISES = [
  { title: "Crise Climática",           area: "Ambiente",     desc: "Aquecimento global, biodiversidade, oceanos e ciclos naturais.",           color: "#2ECC71" },
  { title: "Conflitos Armados",         area: "Segurança",    desc: "Guerras, violência, refugiados e instabilidade geopolítica.",               color: "#E91E63" },
  { title: "Desigualdade Global",       area: "Social",       desc: "Pobreza extrema, acesso à saúde, educação e oportunidades.",                color: "#E67E22" },
  { title: "Saúde Mental",             area: "Saúde",        desc: "Epidemia silenciosa de depressão, ansiedade e solidão.",                    color: "#9B59B6" },
  { title: "Desinformação",             area: "Comunicação",  desc: "Fake news, manipulação de narrativas e erosão da verdade.",                 color: "#E74C3C" },
  { title: "Sofrimento Animal",         area: "Ética",        desc: "Pecuária industrial, extinção de espécies e crueldade sistemática.",        color: "#C8A45A" },
]

function CrisesSection() {
  return (
    <div>
      <SectionTitle
        symbol="◈ Crises da Humanidade"
        label="Crises da Humanidade"
        desc="Causas que agem — ONGs, movimentos e iniciativas focadas na cura, harmonia e transformação."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {CRISES.map(({ title, area, desc, color }) => (
          <div key={title} className="p-4 border border-solar-border/15 hover:border-solar-border/35 transition-colors group cursor-default"
            style={{ borderLeft: `3px solid ${color}40` }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[6.5px] uppercase tracking-widest px-1.5 py-0.5"
                style={{ background: `${color}15`, color }}>
                {area}
              </span>
            </div>
            <p className="font-display text-[14px] mb-1 group-hover:opacity-90 transition-opacity"
              style={{ color: "rgb(var(--c-text)/0.82)", letterSpacing: "-0.01em" }}>
              {title}
            </p>
            <p className="font-mono text-[8px] leading-relaxed" style={{ color: "rgb(var(--c-muted)/0.5)" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-solar-border/12 p-5" style={{ borderLeft: "3px solid rgb(var(--c-teal)/0.4)" }}>
        <p className="font-mono text-[7.5px] uppercase tracking-widest mb-2"
          style={{ color: "rgb(var(--c-teal)/0.7)" }}>
          ◎ Causas & Organizações
        </p>
        <p className="font-mono text-[9px] leading-relaxed" style={{ color: "rgb(var(--c-muted)/0.5)" }}>
          Em breve: lista curada de ONGs, movimentos e iniciativas que atuam em cada uma dessas crises,
          com links, descrições e formas de contribuir.
        </p>
      </div>
    </div>
  )
}

// ── Avanços do Mundo ──────────────────────────────────────────────────────────

const AVANCOS = [
  { area: "Medicina & Saúde",    symbol: "⊹", desc: "Novas terapias, vacinas, longevidade e saúde preventiva.",             color: "#2ECC71" },
  { area: "Energia Limpa",       symbol: "◎", desc: "Solar, eólica, fusão nuclear e armazenamento de energia.",             color: "#C8A45A" },
  { area: "Alimentação",         symbol: "▸", desc: "Proteína alternativa, agricultura vertical e sustentabilidade.",       color: "#27AE60" },
  { area: "Espaço & Cosmos",     symbol: "✦", desc: "Telescópios, missões lunares e exploração do sistema solar.",          color: "#4A90D9" },
  { area: "IA & Computação",     symbol: "⬡", desc: "Modelos de linguagem, computação quântica e automação.",               color: "#9B59B6" },
  { area: "Biodiversidade",      symbol: "◉", desc: "Restauração de ecossistemas, espécies salvas e corredores verdes.",    color: "#16A085" },
]

function AvancosSection() {
  return (
    <div>
      <SectionTitle
        symbol="⊹ Avanços do Mundo"
        label="Avanços do Mundo"
        desc="As pesquisas, descobertas e conquistas que estão expandindo os limites do possível."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {AVANCOS.map(({ area, symbol, desc, color }) => (
          <div key={area} className="p-5 border border-solar-border/15 hover:border-solar-border/35 transition-colors group cursor-default">
            <span className="text-xl mb-3 block" style={{ color: `${color}80` }}>{symbol}</span>
            <p className="font-display text-[14px] mb-1.5 group-hover:opacity-90 transition-opacity"
              style={{ color: "rgb(var(--c-text)/0.8)", letterSpacing: "-0.01em" }}>
              {area}
            </p>
            <p className="font-mono text-[8px] leading-relaxed" style={{ color: "rgb(var(--c-muted)/0.48)" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/?area=CIENCIAS" className="font-mono text-[8px] uppercase tracking-widest text-solar-accent/55 hover:text-solar-accent transition-colors">
          ▸ Explorar Ciências no Atlas →
        </Link>
      </div>
    </div>
  )
}

// ── Institutos & Poderosos ────────────────────────────────────────────────────

const INSTITUTOS = [
  { name: "ONU",              type: "Organização Internacional", desc: "Órgão central de governança global, paz e direitos humanos."                },
  { name: "WHO / OMS",        type: "Saúde Global",              desc: "Padrões e coordenação mundial de saúde pública."                            },
  { name: "MIT",              type: "Pesquisa & Inovação",       desc: "Instituto de tecnologia que moldou a era digital."                          },
  { name: "Oxfam",            type: "Desigualdade",              desc: "Confederação de ONGs focada em pobreza e desigualdade global."              },
  { name: "CERN",             type: "Física & Ciência",          desc: "Laboratório europeu que explora as leis fundamentais da matéria."           },
  { name: "Greenpeace",       type: "Ambiente",                  desc: "Organização de defesa ambiental presente em 55 países."                    },
  { name: "Médicos Sem Fronteiras", type: "Saúde & Crises",     desc: "Assistência médica em zonas de conflito e desastres."                      },
  { name: "NASA",             type: "Espaço & Ciência",          desc: "Agência espacial que conecta a humanidade ao cosmos."                      },
]

function InstitutosSection() {
  return (
    <div>
      <SectionTitle
        symbol="◉ Institutos & Poderosos"
        label="Os Institutos & Poderosos"
        desc="Um quadro geral das organizações, instituições e movimentos que mais moldam e carregam o mundo."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {INSTITUTOS.map(({ name, type, desc }) => (
          <div key={name} className="flex items-start gap-3 p-4 border border-solar-border/15 hover:border-solar-border/35 transition-colors group cursor-default">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-solar-border/20 font-mono text-[8px]"
              style={{ color: "rgb(var(--c-muted)/0.4)" }}>
              ◉
            </div>
            <div>
              <p className="font-display text-[13px] mb-0.5 group-hover:opacity-90 transition-opacity"
                style={{ color: "rgb(var(--c-text)/0.82)", letterSpacing: "-0.01em" }}>
                {name}
              </p>
              <p className="font-mono text-[6.5px] uppercase tracking-widest mb-1.5"
                style={{ color: "rgb(var(--c-accent)/0.55)" }}>
                {type}
              </p>
              <p className="font-mono text-[8px] leading-relaxed" style={{ color: "rgb(var(--c-muted)/0.45)" }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Comunidade ────────────────────────────────────────────────────────────────

function ComunidadeSection() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/social/members?limit=30").then((r) => r.json())
      .then((d: { users: Member[] }) => { setMembers(d.users); setLoading(false) })
  }, [])

  const filtered = members.filter((m) =>
    !search || m.username.toLowerCase().includes(search) || m.displayName.toLowerCase().includes(search)
  )

  return (
    <div>
      <SectionTitle symbol="○ Comunidade" label="Comunidade" desc="Todos os membros do Portal Solar." />
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toLowerCase())}
        placeholder="Buscar membro…"
        className="w-full max-w-xs bg-solar-deep/50 border border-solar-border/25 px-3 py-1.5 font-mono text-[10px] outline-none mb-5 focus:border-solar-accent/40"
        style={{ color: "rgb(var(--c-text)/0.8)" }} />
      {loading ? <p className="font-mono text-[9px] text-solar-muted/30 animate-pulse">Carregando…</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((m) => (
            <Link key={m.id} href={`/perfil/${m.username}`}
              className="flex flex-col items-center gap-2 p-4 border border-solar-border/15 hover:border-solar-border/40 transition-all group text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: `${m.accentColor}25`, color: m.accentColor }}>
                {m.displayName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-display text-[12px] leading-none mb-0.5 group-hover:opacity-80 transition-opacity"
                  style={{ color: "rgb(var(--c-text)/0.78)" }}>
                  {m.displayName}
                </p>
                <p className="font-mono text-[7.5px]" style={{ color: "rgb(var(--c-muted)/0.4)" }}>@{m.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Descobrir ─────────────────────────────────────────────────────────────────

function DescrobirSection() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/social/match").then((r) => r.ok ? r.json() : [])
      .then((d: Match[]) => { setMatches(d); setLoading(false) })
  }, [])

  return (
    <div>
      <SectionTitle symbol="◌ Descobrir" label="Descobrir" desc="Membros com interesses em comum com você." />
      {loading ? <p className="font-mono text-[9px] text-solar-muted/30 animate-pulse">Calculando…</p> : (
        matches.length === 0 ? (
          <p className="font-mono text-[9px] text-solar-muted/30">
            Adicione interesses no Atlas para descobrir pessoas com afinidades.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matches.slice(0, 12).map((m) => (
              <Link key={m.id} href={`/perfil/${m.username}`}
                className="flex items-center gap-3 p-3 border border-solar-border/15 hover:border-solar-border/40 transition-all group">
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background: `${m.accentColor}25`, color: m.accentColor }}>
                  {m.displayName[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[13px] truncate group-hover:opacity-80 transition-opacity"
                    style={{ color: "rgb(var(--c-text)/0.8)" }}>
                    {m.displayName}
                  </p>
                  <p className="font-mono text-[7.5px]" style={{ color: "rgb(var(--c-accent)/0.6)" }}>
                    {m.commonInterests} interesses em comum
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── Coleção de tokens ─────────────────────────────────────────────────────────

function ColecaoSection() {
  const [tokens, setTokens]   = useState<Token[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/social/tokens").then((r) => r.ok ? r.json() : [])
      .then((d: Token[]) => { setTokens(d); setLoading(false) })
  }, [])

  const toggleEquip = async (t: Token) => {
    const next = !t.isEquipped
    setTokens((p) => p.map((tk) => tk.id === t.id ? { ...tk, isEquipped: next } : tk))
    await fetch("/api/social/tokens", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: t.id, isEquipped: next }),
    })
  }

  return (
    <div>
      <SectionTitle symbol="◫ Coleção" label="Minha Coleção" desc="Tokens e conquistas colecionáveis." />
      {loading ? <p className="font-mono text-[9px] text-solar-muted/30 animate-pulse">Carregando…</p> : (
        tokens.length === 0 ? (
          <p className="font-mono text-[9px] text-solar-muted/30">Nenhum token ainda.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {tokens.map((t) => (
              <button key={t.id} onClick={() => void toggleEquip(t)}
                className="aspect-square border flex flex-col items-center justify-center gap-1 p-2 transition-all hover:border-solar-border/50"
                style={{
                  borderColor: `${RARITY_COLORS[t.rarity] ?? "#888"}${t.isEquipped ? "80" : "30"}`,
                  background:  `${RARITY_COLORS[t.rarity] ?? "#888"}${t.isEquipped ? "15" : "06"}`,
                }}>
                <p className="text-xl">{t.tokenType === "BADGE" ? "🏅" : t.tokenType === "MONUMENT" ? "🗿" : "✦"}</p>
                <p className="font-mono text-[7px] text-center line-clamp-1"
                  style={{ color: RARITY_COLORS[t.rarity] }}>
                  {t.name}
                </p>
              </button>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── Componente Principal ──────────────────────────────────────────────────────

export function SocialClient({ notices }: { notices: Notice[] }) {
  const ids = NAV.map((n) => n.id)
  const { active, setRef } = useActiveSection(ids)
  const navRef = useRef<HTMLDivElement>(null)
  const isScrollingTo = useRef(false)

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    isScrollingTo.current = true
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setTimeout(() => { isScrollingTo.current = false }, 800)
    const navEl = navRef.current
    if (navEl) {
      const btn = navEl.querySelector(`[data-nav="${id}"]`) as HTMLElement | null
      if (btn) navEl.scrollTo({ left: btn.offsetLeft - navEl.offsetWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" })
    }
  }, [])

  return (
    <div>
      {/* ── Menu Sticky ── */}
      <div ref={navRef}
        className="sticky top-[38px] z-40 flex gap-0 overflow-x-auto scrollbar-hide"
        style={{ background: "rgb(var(--c-deep)/0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgb(var(--c-border)/0.18)" }}>
        {NAV.map(({ id, label, short }) => (
          <button key={id} data-nav={id} onClick={() => scrollTo(id)}
            className="flex-shrink-0 font-mono uppercase tracking-[0.2em] px-4 py-2.5 transition-all border-b-2 whitespace-nowrap"
            style={{
              fontSize:         "6.5px",
              borderBottomColor: active === id ? "rgb(var(--c-accent))" : "transparent",
              color:             active === id ? "rgb(var(--c-accent))" : "rgb(var(--c-muted)/0.4)",
              background:        active === id ? "rgb(var(--c-accent)/0.04)" : "transparent",
            }}>
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        ))}
      </div>

      <div className="page-standard">
        {/* ── Seções ── */}
        {[
          { id: "bubble",     el: <BubbleMixture /> },
          { id: "radar",      el: <RadarReport notices={notices} /> },
          { id: "feed",       el: <FeedSection /> },
          { id: "grupos",     el: <GruposSection /> },
          { id: "crises",     el: <CrisesSection /> },
          { id: "avancos",    el: <AvancosSection /> },
          { id: "institutos", el: <InstitutosSection /> },
          { id: "comunidade", el: <ComunidadeSection /> },
          { id: "descobrir",  el: <DescrobirSection /> },
          { id: "colecao",    el: <ColecaoSection /> },
        ].map(({ id, el }) => (
          <section key={id} id={id} ref={setRef(id)}
            className="py-14"
            style={{ borderBottom: "1px solid rgb(var(--c-border)/0.1)" }}>
            {el}
          </section>
        ))}

        {/* Rodapé */}
        <div className="py-10">
          <div className="flex flex-wrap gap-3">
            <Link href="/social/eventos" className="btn btn-ghost btn-sm">⬡ Eventos →</Link>
            <Link href="/social/mensagens" className="btn btn-ghost btn-sm">✉ Mensagens →</Link>
            <Link href="/blog" className="btn btn-ghost btn-sm">◎ Blog →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
