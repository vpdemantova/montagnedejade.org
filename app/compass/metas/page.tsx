"use client"

import { useState, useEffect } from "react"

type Goal = {
  id:          string
  title:       string
  description: string | null
  horizon:     string
  status:      string
  dueDate:     string | null
  progress:    number
  createdAt:   string
}

const STATUS_LABEL: Record<string, string> = {
  active:    "Ativo",
  completed: "Concluído",
  paused:    "Pausado",
}

const STATUS_COLOR: Record<string, string> = {
  active:    "text-solar-accent border-solar-accent/30 bg-solar-accent/8",
  completed: "text-solar-teal border-solar-teal/30 bg-solar-teal/8",
  paused:    "text-solar-muted/50 border-solar-border/30",
}

function GoalCard({
  goal,
  onUpdate,
  onDelete,
}: {
  goal:     Goal
  onUpdate: (id: string, patch: Partial<Goal>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [progress, setProgress] = useState(goal.progress)

  const cycleStatus = () => {
    const next = goal.status === "active" ? "completed" : goal.status === "completed" ? "paused" : "active"
    onUpdate(goal.id, { status: next })
  }

  const saveProgress = () => {
    onUpdate(goal.id, { progress })
    setEditing(false)
  }

  const due = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : null

  return (
    <div className={`border border-solar-border/25 bg-solar-deep/20 p-4 ${goal.status === "completed" ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Progress circle */}
        <button
          onClick={() => setEditing((o) => !o)}
          className="flex-shrink-0 relative w-10 h-10 mt-0.5"
          title="Ajustar progresso"
        >
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgb(var(--c-border)/0.2)" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="rgb(var(--c-accent))"
              strokeWidth="2.5"
              strokeDasharray={`${goal.status === "completed" ? 100 : goal.progress} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-solar-text/70">
            {goal.status === "completed" ? "✓" : `${goal.progress}%`}
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-[12px] font-mono text-solar-text/90">{goal.title}</h3>
            <span className="text-[8px] font-mono text-solar-muted/30 uppercase">{goal.horizon === "long" ? "Longo prazo" : "Curto prazo"}</span>
          </div>
          {goal.description && (
            <p className="text-[10px] font-mono text-solar-muted/50 mb-2 leading-relaxed">{goal.description}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={cycleStatus}
              className={`text-[8px] font-mono px-2 py-0.5 border uppercase tracking-widest transition-colors ${STATUS_COLOR[goal.status] ?? ""}`}
            >
              {STATUS_LABEL[goal.status] ?? goal.status}
            </button>
            {due && <span className="text-[8px] font-mono text-solar-muted/35">até {due}</span>}
          </div>
        </div>

        <button
          onClick={() => onDelete(goal.id)}
          className="text-[10px] font-mono text-solar-muted/20 hover:text-solar-muted/60 transition-colors flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Progress slider (inline) */}
      {editing && (
        <div className="mt-3 pt-3 border-t border-solar-border/15 flex items-center gap-3">
          <input
            type="range" min={0} max={100} step={5} value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="flex-1 accent-solar-accent"
          />
          <span className="text-[10px] font-mono text-solar-accent w-10">{progress}%</span>
          <button onClick={saveProgress} className="text-[9px] font-mono px-3 py-1 border border-solar-accent/40 text-solar-accent hover:bg-solar-accent/10 transition-colors">
            OK
          </button>
        </div>
      )}
    </div>
  )
}

export default function MetasPage() {
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [horizon, setHorizon]   = useState<"all" | "short" | "long">("all")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", horizon: "short", dueDate: "" })

  useEffect(() => {
    fetch("/api/compass/goals")
      .then((r) => r.json())
      .then((data: Goal[]) => { setGoals(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addGoal = async () => {
    if (!form.title.trim()) return
    const res = await fetch("/api/compass/goals", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title: form.title, description: form.description || null, horizon: form.horizon, dueDate: form.dueDate || undefined }),
    })
    const goal = await res.json() as Goal
    setGoals((prev) => [goal, ...prev])
    setForm({ title: "", description: "", horizon: "short", dueDate: "" })
    setShowForm(false)
  }

  const updateGoal = async (id: string, patch: Partial<Goal>) => {
    await fetch("/api/compass/goals", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, ...patch }),
    })
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, ...patch } : g))
  }

  const deleteGoal = async (id: string) => {
    await fetch(`/api/compass/goals?id=${id}`, { method: "DELETE" })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const filtered = goals.filter((g) => horizon === "all" || g.horizon === horizon)
  const active   = filtered.filter((g) => g.status !== "completed")
  const done     = filtered.filter((g) => g.status === "completed")

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Metas
          </p>
          <div className="flex items-end justify-between gap-6">
            <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
              Metas & Intenções
            </h1>
            <button
              onClick={() => setShowForm((o) => !o)}
              className="flex-shrink-0 px-4 py-2 border border-compass-neon/40 bg-compass-neon/8 text-[10px] font-mono uppercase tracking-widest text-compass-neon hover:bg-compass-neon/15 transition-solar"
            >
              + Meta
            </button>
          </div>

          {/* Horizon filter */}
          <div className="flex items-center gap-0 mt-4">
            {(["all", "short", "long"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-1.5 text-[9px] font-mono uppercase tracking-widest border-b-2 transition-all ${
                  horizon === h ? "border-solar-accent text-solar-accent" : "border-transparent text-solar-muted/40 hover:text-solar-muted"
                }`}
              >
                {h === "all" ? "Todas" : h === "short" ? "Curto prazo" : "Longo prazo"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-12 py-6 space-y-6">

        {/* Add form */}
        {showForm && (
          <div className="border border-solar-border/30 bg-solar-deep/30 p-5 space-y-3">
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/50">Nova Meta</p>
            <input
              placeholder="O que você quer alcançar? *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40"
            />
            <textarea
              placeholder="Descrição (opcional)"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-transparent border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-accent/40 resize-none"
            />
            <div className="flex gap-3">
              <select
                value={form.horizon}
                onChange={(e) => setForm((f) => ({ ...f, horizon: e.target.value }))}
                className="flex-1 bg-solar-deep border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text focus:outline-none focus:border-solar-accent/40"
              >
                <option value="short">Curto prazo</option>
                <option value="long">Longo prazo</option>
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="flex-1 bg-solar-deep border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text focus:outline-none focus:border-solar-accent/40"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addGoal} className="px-4 py-2 border border-solar-accent/40 text-[10px] font-mono text-solar-accent hover:bg-solar-accent/10 transition-colors">
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
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[10px] font-mono text-solar-muted/40">Nenhuma meta ainda.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-[10px] font-mono text-compass-neon/60 hover:text-compass-neon transition-solar">
              Criar primeira meta →
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="space-y-2">
                {active.map((g) => (
                  <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />
                ))}
              </section>
            )}

            {done.length > 0 && (
              <section className="space-y-2">
                <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/30 mb-3">Concluídas</p>
                {done.map((g) => (
                  <GoalCard key={g.id} goal={g} onUpdate={updateGoal} onDelete={deleteGoal} />
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
