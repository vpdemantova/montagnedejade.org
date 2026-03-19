"use client"

import { useState, useEffect } from "react"
import { MapaInterior } from "@/atlas/components/compass/MapaInterior"

const TABS = [
  { id: "favoritos",  label: "Favoritos"    },
  { id: "musica",     label: "Música"       },
  { id: "estudos",    label: "Estudos"      },
  { id: "sonhos",     label: "Metas"        },
  { id: "repertorio", label: "Repertório"   },
  { id: "mapa",       label: "Mapa Interior"},
] as const

type TabId = (typeof TABS)[number]["id"]

// ── Favoritos tab ──────────────────────────────────────────────────────────────

type AtlasItemFull = {
  id: string; slug?: string | null; title: string; type: string; area: string
  isFavorite: boolean; status: string; updatedAt: string
  coverImage?: string | null
  tags: { id: string; name: string }[]
}

const AREA_PT: Record<string, string> = {
  ACADEMIA: "Academia", ARTES: "Artes", COMPUTACAO: "Computação",
  AULAS: "Aulas", DIARIO: "Diário", NOTAS: "Notas",
  HUMANIDADE: "Humanidade", CIENCIAS: "Ciências",
  NATUREZA: "Natureza", TECNICA: "Técnica",
  HISTORIA: "História", GEOGRAFIA: "Geografia",
  PESSOAS: "Pessoas", CRIACOES: "Criações",
}

function FavoritosTab() {
  const [items,   setItems]   = useState<AtlasItemFull[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/atlas/favorites")
      .then((r) => r.json() as Promise<AtlasItemFull[]>)
      .then((d) => { setItems(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse">Carregando…</p>

  if (items.length === 0) return (
    <div className="py-16 text-center border border-dashed border-solar-border/20">
      <p className="text-[10px] font-mono text-solar-muted/40">Nenhum favorito ainda.</p>
      <a href="/atlas" className="block mt-2 text-[10px] font-mono text-compass-neon/50 hover:text-compass-neon transition-solar">
        Explorar o Atlas →
      </a>
    </div>
  )

  return (
    <div className="space-y-4">
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/50">
        Favoritos — {items.length} {items.length === 1 ? "item" : "itens"}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-solar-border/10 border border-solar-border/15">
        {items.map((item) => (
          <a
            key={item.id}
            href={`/atlas/${item.slug ?? item.id}`}
            className="group bg-solar-void hover:bg-solar-deep/60 transition-solar flex flex-col"
          >
            {item.coverImage ? (
              <div className="aspect-[16/7] overflow-hidden">
                <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ) : (
              <div className="aspect-[16/7] bg-solar-surface/20 flex items-center justify-center">
                <span className="font-display text-3xl text-solar-amber/15 group-hover:text-solar-amber/25 transition-colors">
                  {item.title.charAt(0)}
                </span>
              </div>
            )}
            <div className="p-3 flex-1">
              <p className="text-[8px] font-mono text-solar-muted/35 uppercase tracking-widest mb-1">
                {AREA_PT[item.area] ?? item.area} · ★
              </p>
              <p className="text-[11px] font-mono text-solar-text/80 group-hover:text-solar-amber-lt transition-solar line-clamp-2">
                {item.title}
              </p>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((t) => (
                    <span key={t.id} className="text-[7px] font-mono px-1 border border-solar-border/20 text-solar-muted/35 uppercase">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Music tab ──────────────────────────────────────────────────────────────────
type AtlasItem = { id: string; slug?: string | null; title: string; type: string; area: string; content: string | null; updatedAt: string; status?: string }

function MusicaTab() {
  const [items,   setItems]   = useState<AtlasItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/atlas?area=ARTES&limit=100").then((r) => r.json() as Promise<AtlasItem[]>),
    ]).then(([artes]) => {
      setItems(artes.filter((i) => ["PERSON", "WORK", "PARTITURA", "RECORDING"].includes(i.type)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const grouped = items.reduce<Record<string, AtlasItem[]>>((acc, item) => {
    const k = item.type
    if (!acc[k]) acc[k] = []
    acc[k]!.push(item)
    return acc
  }, {})

  const TYPE_PT: Record<string, string> = {
    PERSON:     "Compositores & Intérpretes",
    WORK:       "Obras",
    PARTITURA:  "Partituras",
    RECORDING:  "Gravações",
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-solar-muted/40">
            Nenhum item musical encontrado na área ARTES.
          </p>
          <a href="/atlas/novo" className="inline-flex text-[10px] font-mono text-compass-neon/60 hover:text-compass-neon transition-solar uppercase tracking-widest">
            + Adicionar ao Atlas →
          </a>
        </div>
      ) : (
        Object.entries(grouped).map(([type, list]) => (
          <div key={type}>
            <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-compass-neon-dim/50 mb-3">
              {TYPE_PT[type] ?? type}
            </p>
            <div className="space-y-px">
              {list.map((item) => (
                <a key={item.id} href={`/atlas/${item.slug ?? item.id}`}
                  className="flex items-center justify-between px-4 py-2.5 border border-solar-border/15 hover:border-solar-border/40 hover:bg-solar-surface/20 transition-all group"
                >
                  <span className="text-[11px] font-mono text-solar-text/80 group-hover:text-solar-amber transition-solar truncate">
                    {item.title}
                  </span>
                  <span className="text-[8px] font-mono text-solar-muted/30 flex-shrink-0 ml-3">→</span>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ── Studies tab ───────────────────────────────────────────────────────────────

type Discipline = {
  id:         string
  name:       string
  code:       string
  professor:  string | null
  semester:   string
  totalHours: number
  color:      string
  sessions:   { id: string; durationMin: number; date: string }[]
}

function EstudosTab() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading,     setLoading]     = useState(true)
  const [newName,     setNewName]     = useState("")
  const [newCode,     setNewCode]     = useState("")
  const [logging,     setLogging]     = useState<string | null>(null)
  const [logMin,      setLogMin]      = useState(30)

  useEffect(() => {
    fetch("/api/compass/tracker")
      .then((r) => r.json() as Promise<Discipline[]>)
      .then((d) => { setDisciplines(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addDiscipline = async () => {
    if (!newName.trim()) return
    const res = await fetch("/api/compass/tracker", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newName.trim(), code: newCode.trim(), semester: "2026-1" }),
    })
    const d = await res.json() as Discipline
    setDisciplines((prev) => [...prev, { ...d, sessions: [] }])
    setNewName("")
    setNewCode("")
  }

  const logSession = async (disciplineId: string) => {
    const res = await fetch("/api/compass/tracker", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "log-session", disciplineId, durationMin: logMin }),
    })
    const session = await res.json() as { id: string; durationMin: number; date: string }
    setDisciplines((prev) =>
      prev.map((d) => d.id === disciplineId
        ? { ...d, sessions: [session, ...d.sessions] }
        : d
      )
    )
    setLogging(null)
  }

  const remove = async (id: string) => {
    await fetch(`/api/compass/tracker?id=${id}`, { method: "DELETE" })
    setDisciplines((prev) => prev.filter((d) => d.id !== id))
  }

  // Progress = total session hours / totalHours
  const getProgress = (d: Discipline) => {
    const totalMin = d.sessions.reduce((sum, s) => sum + s.durationMin, 0)
    return Math.min(100, Math.round((totalMin / 60 / d.totalHours) * 100))
  }

  return (
    <div className="space-y-6">
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/50">
        Tracker de Estudos · PUCC 2026
      </p>

      {loading ? (
        <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {disciplines.map((d) => {
            const progress = getProgress(d)
            const totalMin = d.sessions.reduce((s, x) => s + x.durationMin, 0)
            return (
              <div key={d.id} className="border border-solar-border/20 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[11px] font-mono text-solar-text/80">{d.name}</p>
                    {d.code && (
                      <p className="text-[8px] font-mono text-solar-muted/35 mt-0.5">{d.code} · {d.semester}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-solar-muted/40">
                      {Math.round(totalMin / 60)}h / {d.totalHours}h
                    </span>
                    {logging === d.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={logMin}
                          onChange={(e) => setLogMin(Number(e.target.value))}
                          className="w-14 bg-solar-deep border border-solar-border/30 px-1.5 py-1 text-[9px] font-mono text-solar-text focus:outline-none"
                        />
                        <span className="text-[8px] font-mono text-solar-muted/40">min</span>
                        <button
                          onClick={() => logSession(d.id)}
                          className="text-[8px] font-mono text-compass-neon/70 hover:text-compass-neon transition-colors"
                        >✓</button>
                        <button
                          onClick={() => setLogging(null)}
                          className="text-[8px] font-mono text-solar-muted/30 hover:text-solar-muted transition-colors"
                        >×</button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setLogging(d.id)}
                          className="text-[8px] font-mono text-compass-neon/50 hover:text-compass-neon transition-colors"
                        >+ log</button>
                        <button
                          onClick={() => remove(d.id)}
                          className="text-[8px] font-mono text-solar-muted/20 hover:text-solar-red/50 transition-colors"
                        >×</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-px bg-solar-border/20">
                  <div
                    className="h-px transition-all duration-500"
                    style={{ width: `${progress}%`, background: d.color }}
                  />
                </div>
                <p className="text-[8px] font-mono text-solar-muted/25 mt-1.5">{progress}%</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Add discipline */}
      <div className="flex items-center gap-2 pt-2">
        <input
          value={newName} onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da disciplina"
          className="flex-1 bg-transparent border-b border-solar-border/30 px-0 py-1 text-xs font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-compass-neon/30"
        />
        <input
          value={newCode} onChange={(e) => setNewCode(e.target.value)}
          placeholder="Código"
          className="w-24 bg-transparent border-b border-solar-border/30 px-0 py-1 text-xs font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-compass-neon/30"
        />
        <button
          onClick={addDiscipline}
          className="text-[9px] font-mono text-compass-neon/50 hover:text-compass-neon transition-colors uppercase tracking-widest"
        >+ Adicionar</button>
      </div>
    </div>
  )
}

// ── Goals tab ─────────────────────────────────────────────────────────────────

type Goal = {
  id:          string
  title:       string
  description: string | null
  horizon:     string
  status:      string
  progress:    number
  dueDate:     string | null
}

function SonhosTab() {
  const [goals,    setGoals]    = useState<Goal[]>([])
  const [loading,  setLoading]  = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [horizon,  setHorizon]  = useState<"short" | "long">("short")

  useEffect(() => {
    fetch("/api/compass/goals")
      .then((r) => r.json() as Promise<Goal[]>)
      .then((d) => { setGoals(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addGoal = async () => {
    if (!newTitle.trim()) return
    const res  = await fetch("/api/compass/goals", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: newTitle.trim(), horizon }),
    })
    const goal = await res.json() as Goal
    setGoals((prev) => [goal, ...prev])
    setNewTitle("")
  }

  const updateProgress = async (id: string, progress: number) => {
    await fetch("/api/compass/goals", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, progress }),
    })
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, progress } : g))
  }

  const toggleStatus = async (g: Goal) => {
    const next = g.status === "completed" ? "active" : "completed"
    await fetch("/api/compass/goals", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: g.id, status: next }),
    })
    setGoals((prev) => prev.map((x) => x.id === g.id ? { ...x, status: next } : x))
  }

  const remove = async (id: string) => {
    await fetch(`/api/compass/goals?id=${id}`, { method: "DELETE" })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const short = goals.filter((g) => g.horizon === "short")
  const long  = goals.filter((g) => g.horizon === "long")

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <div className={`border p-3 transition-all ${goal.status === "completed" ? "border-solar-border/10 opacity-50" : "border-solar-border/25"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-[10px] font-mono leading-snug ${goal.status === "completed" ? "line-through text-solar-muted/40" : "text-solar-text/80"}`}>
          {goal.title}
        </p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => toggleStatus(goal)} className="text-[9px] font-mono text-solar-muted/30 hover:text-compass-neon/60 transition-colors">
            {goal.status === "completed" ? "↺" : "✓"}
          </button>
          <button onClick={() => remove(goal.id)} className="text-[8px] font-mono text-solar-muted/20 hover:text-solar-red/50 transition-colors">×</button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range" min={0} max={100} value={goal.progress}
          onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
          className="flex-1 h-px accent-compass-neon"
        />
        <span className="text-[8px] font-mono text-solar-muted/35 w-7 text-right">{goal.progress}%</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/50">
        Metas & Intenções
      </p>

      {loading ? (
        <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse">Carregando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-solar-muted/40 mb-3">Curto prazo</p>
            <div className="space-y-2">
              {short.length === 0 ? (
                <p className="text-[9px] font-mono text-solar-muted/25">Nenhuma meta.</p>
              ) : short.map((g) => <GoalCard key={g.id} goal={g} />)}
            </div>
          </div>
          <div>
            <p className="text-[8px] font-mono uppercase tracking-widest text-solar-muted/40 mb-3">Longo prazo</p>
            <div className="space-y-2">
              {long.length === 0 ? (
                <p className="text-[9px] font-mono text-solar-muted/25">Nenhuma meta.</p>
              ) : long.map((g) => <GoalCard key={g.id} goal={g} />)}
            </div>
          </div>
        </div>
      )}

      {/* Add goal */}
      <div className="flex items-center gap-2 pt-2 border-t border-solar-border/15">
        <input
          value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova meta ou intenção..."
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          className="flex-1 bg-transparent border-b border-solar-border/30 px-0 py-1 text-xs font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-compass-neon/30"
        />
        <button
          onClick={() => setHorizon((h) => h === "short" ? "long" : "short")}
          className={`text-[8px] font-mono uppercase tracking-widest px-2 py-1 border transition-colors ${horizon === "short" ? "border-compass-neon/30 text-compass-neon/60" : "border-solar-amber/30 text-solar-amber/60"}`}
        >
          {horizon === "short" ? "Curto" : "Longo"}
        </button>
        <button
          onClick={addGoal}
          className="text-[9px] font-mono text-compass-neon/50 hover:text-compass-neon transition-colors"
        >+ Add</button>
      </div>
    </div>
  )
}

// ── Repertoire tab ────────────────────────────────────────────────────────────
const STATUS_GROUP: Record<string, { label: string; color: string }> = {
  ACTIVE:      { label: "Em andamento",  color: "text-solar-amber"   },
  PUBLISHED:   { label: "Performável",   color: "text-compass-neon"  },
  DRAFT:       { label: "Iniciando",     color: "text-solar-muted/60"},
  ARCHIVED:    { label: "Dominado",      color: "text-solar-green"   },
}

function RepertorioTab() {
  const [items,   setItems]   = useState<AtlasItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/atlas?area=ARTES&type=PARTITURA&limit=100")
      .then((r) => r.json() as Promise<AtlasItem[]>)
      .then((d) => { setItems(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const grouped = items.reduce<Record<string, AtlasItem[]>>((acc, item) => {
    const k = (item as AtlasItem & { status?: string }).status ?? "DRAFT"
    if (!acc[k]) acc[k] = []
    acc[k]!.push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/50">Repertório Musical</p>
      {loading ? (
        <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-solar-muted/40">
            Nenhuma partitura encontrada. Adicione items do tipo PARTITURA na área ARTES.
          </p>
          <a href="/atlas/novo" className="inline-flex text-[10px] font-mono text-compass-neon/60 hover:text-compass-neon transition-solar uppercase tracking-widest">
            + Adicionar partitura →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(STATUS_GROUP).map(([status, meta]) => {
            const list = grouped[status] ?? []
            return (
              <div key={status} className="border border-solar-border/15 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-[9px] font-mono uppercase tracking-widest ${meta.color}`}>{meta.label}</p>
                  <span className="text-[8px] font-mono text-solar-muted/30">{list.length}</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-[9px] font-mono text-solar-muted/25">—</p>
                ) : (
                  <div className="space-y-1.5">
                    {list.map((item) => (
                      <a key={item.id} href={`/atlas/${item.slug ?? item.id}`}
                        className="block text-[10px] font-mono text-solar-text/70 hover:text-solar-amber transition-solar truncate"
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<TabId>("favoritos")

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Perfil
          </p>
          <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
            Perfil
          </h1>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-12 py-6">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-solar-border/20 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-solar border-b-2 -mb-px
                ${activeTab === tab.id
                  ? "border-compass-neon text-compass-neon"
                  : "border-transparent text-solar-muted/50 hover:text-solar-muted"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "favoritos"  && <FavoritosTab />}
          {activeTab === "musica"     && <MusicaTab />}
          {activeTab === "estudos"    && <EstudosTab />}
          {activeTab === "sonhos"     && <SonhosTab />}
          {activeTab === "repertorio" && <RepertorioTab />}
          {activeTab === "mapa"       && <MapaInterior />}
        </div>
      </div>
    </div>
  )
}
