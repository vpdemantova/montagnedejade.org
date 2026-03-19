"use client"

import { useState, useEffect } from "react"

type StudySession = {
  id:          string
  disciplineId: string
  date:        string
  durationMin: number
  note:        string | null
}

type Discipline = {
  id:         string
  name:       string
  code:       string
  professor:  string | null
  semester:   string
  totalHours: number
  color:      string
  sessions:   StudySession[]
}

const PRESET_COLORS = [
  "#6E56CF", "#00C8B4", "#C8A45A", "#FF5A1E",
  "#EB82A5", "#3282C8", "#7CFC6A", "#FF1EB4",
]

function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMin, 0)
}

function fmtHours(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function DisciplineCard({
  disc,
  onSession,
}: {
  disc: Discipline
  onSession: (id: string, min: number) => void
}) {
  const logged = totalMinutes(disc.sessions)
  const target = disc.totalHours * 60
  const pct    = Math.min(100, Math.round((logged / target) * 100))
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState("")

  return (
    <div className="border border-solar-border/25 bg-solar-deep/20">
      <div className="flex items-center gap-4 p-4">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: disc.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-mono text-solar-text/90 truncate">{disc.name}</span>
            {disc.code && (
              <span className="text-[8px] font-mono text-solar-muted/40 uppercase">{disc.code}</span>
            )}
          </div>
          {disc.professor && (
            <p className="text-[9px] font-mono text-solar-muted/40 mt-0.5">{disc.professor}</p>
          )}
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-solar-border/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: disc.color }}
              />
            </div>
            <span className="text-[8px] font-mono text-solar-muted/40 flex-shrink-0">
              {fmtHours(logged)} / {disc.totalHours}h
            </span>
          </div>
        </div>

        {/* Log session buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {[30, 60, 90].map((min) => (
            <button
              key={min}
              onClick={() => onSession(disc.id, min)}
              className="text-[8px] font-mono px-2 py-1 border border-solar-border/25 text-solar-muted/50 hover:text-solar-text hover:border-solar-border/60 transition-colors"
            >
              +{min < 60 ? `${min}′` : `${min / 60}h`}
            </button>
          ))}
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-[8px] font-mono px-2 py-1 border border-solar-border/25 text-solar-muted/50 hover:text-solar-text hover:border-solar-border/60 transition-colors"
          >
            …
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-solar-border/15 pt-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="min"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-20 bg-transparent border border-solar-border/30 px-2 py-1 text-[10px] font-mono text-solar-text focus:outline-none focus:border-solar-accent/40"
          />
          <button
            onClick={() => {
              const m = parseInt(custom)
              if (m > 0) { onSession(disc.id, m); setCustom(""); setOpen(false) }
            }}
            className="text-[9px] font-mono px-3 py-1 border border-solar-accent/40 text-solar-accent hover:bg-solar-accent/10 transition-colors"
          >
            Registrar
          </button>
        </div>
      )}
    </div>
  )
}

export default function EstudosPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm] = useState({ name: "", code: "", professor: "", semester: "2026-1", totalHours: "60", color: PRESET_COLORS[0]! })

  useEffect(() => {
    fetch("/api/compass/tracker")
      .then((r) => r.json())
      .then((data: Discipline[]) => { setDisciplines(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const logSession = async (disciplineId: string, durationMin: number) => {
    const res = await fetch("/api/compass/tracker", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "log-session", disciplineId, durationMin }),
    })
    const session = await res.json() as StudySession
    setDisciplines((prev) =>
      prev.map((d) => d.id === disciplineId ? { ...d, sessions: [session, ...d.sessions] } : d)
    )
  }

  const addDiscipline = async () => {
    if (!form.name.trim()) return
    const res = await fetch("/api/compass/tracker", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:       form.name,
        code:       form.code,
        professor:  form.professor || null,
        semester:   form.semester,
        totalHours: parseInt(form.totalHours) || 60,
        color:      form.color,
      }),
    })
    const disc = await res.json() as Discipline
    setDisciplines((prev) => [...prev, { ...disc, sessions: [] }])
    setForm({ name: "", code: "", professor: "", semester: "2026-1", totalHours: "60", color: PRESET_COLORS[0]! })
    setShowForm(false)
  }

  const totalLogged = disciplines.reduce((sum, d) => sum + totalMinutes(d.sessions), 0)

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Estudos
          </p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
                Tracker de Estudos
              </h1>
              {!loading && (
                <p className="text-[10px] font-mono text-solar-muted/40 mt-2">
                  {disciplines.length} disciplinas · {fmtHours(totalLogged)} registradas
                </p>
              )}
            </div>
            <button
              onClick={() => setShowForm((o) => !o)}
              className="flex-shrink-0 px-4 py-2 border border-compass-neon/40 bg-compass-neon/8 text-[10px] font-mono uppercase tracking-widest text-compass-neon hover:bg-compass-neon/15 transition-solar"
            >
              + Disciplina
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-12 py-6 space-y-4">

        {/* Add discipline form */}
        {showForm && (
          <div className="border border-solar-border/30 bg-solar-deep/30 p-5 space-y-3">
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/50">Nova Disciplina</p>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Nome da disciplina *" value={form.name}       onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="col-span-2 bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40" />
              <input placeholder="Código (ex: DES-320)"  value={form.code}       onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40" />
              <input placeholder="Professor"              value={form.professor}  onChange={(e) => setForm((f) => ({ ...f, professor: e.target.value }))}
                className="bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40" />
              <input placeholder="Semestre (2026-1)"      value={form.semester}   onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                className="bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40" />
              <div className="flex items-center gap-2">
                <input placeholder="Total horas" type="number" value={form.totalHours} onChange={(e) => setForm((f) => ({ ...f, totalHours: e.target.value }))}
                  className="flex-1 bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40" />
                <span className="text-[9px] font-mono text-solar-muted/40">h</span>
              </div>
            </div>
            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-solar-muted/40">Cor:</span>
              {PRESET_COLORS.map((c) => (
                <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-5 h-5 rounded-full transition-all hover:scale-110"
                  style={{ background: c, outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addDiscipline} className="px-4 py-2 border border-solar-accent/40 text-[10px] font-mono text-solar-accent hover:bg-solar-accent/10 transition-colors">
                Adicionar
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-solar-border/30 text-[10px] font-mono text-solar-muted/50 hover:border-solar-border/60 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-[10px] font-mono text-solar-muted/40 animate-pulse">Carregando…</p>
        ) : disciplines.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[10px] font-mono text-solar-muted/40">Nenhuma disciplina ainda.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-[10px] font-mono text-compass-neon/60 hover:text-compass-neon transition-solar">
              Adicionar primeira disciplina →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {disciplines.map((d) => (
              <DisciplineCard key={d.id} disc={d} onSession={logSession} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
