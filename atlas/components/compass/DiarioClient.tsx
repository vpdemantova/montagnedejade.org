"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { AtlasItemWithTags } from "@/atlas/types"
import Link from "next/link"

// ── Helpers ────────────────────────────────────────────────────────────────────

function getMonthDays(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0=Sun, adjusted to Mon=0
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]!
}

function entryDateKey(entry: AtlasItemWithTags): string | null {
  // Title format: "Diário — YYYY-MM-DD"
  const match = entry.title.match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1]! : null
}

const ENERGY_LABELS: Record<number, string> = {
  1: "Exausto",
  2: "Pesado",
  3: "Equilibrado",
  4: "Energizado",
  5: "Pleno",
}

const ENERGY_COLORS: Record<number, string> = {
  1: "text-solar-red/70",
  2: "text-solar-muted/60",
  3: "text-solar-text/50",
  4: "text-solar-amber/70",
  5: "text-compass-neon/80",
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

// ── Calendar ──────────────────────────────────────────────────────────────────

function MiniCalendar({
  year,
  month,
  entryDates,
  selectedDate,
  onSelect,
  onMonthChange,
}: {
  year: number
  month: number
  entryDates: Set<string>
  selectedDate: string | null
  onSelect: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}) {
  const days = getMonthDays(year, month)
  const offset = getFirstDayOfWeek(year, month)
  const today = formatDate(new Date())

  const prev = () => {
    if (month === 0) onMonthChange(year - 1, 11)
    else onMonthChange(year, month - 1)
  }
  const next = () => {
    if (month === 11) onMonthChange(year + 1, 0)
    else onMonthChange(year, month + 1)
  }

  return (
    <div className="w-full">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="text-[10px] font-mono text-solar-muted/50 hover:text-compass-neon transition-solar px-1">‹</button>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-solar-text/70">
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={next} className="text-[10px] font-mono text-solar-muted/50 hover:text-compass-neon transition-solar px-1">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[8px] font-mono text-solar-muted/35 uppercase tracking-widest py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const hasEntry = entryDates.has(dateStr)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate

          return (
            <button
              key={day}
              onClick={() => onSelect(dateStr)}
              className={`
                relative flex flex-col items-center justify-center py-1 text-[10px] font-mono
                transition-solar rounded-sm
                ${isSelected ? "bg-compass-neon/15 text-compass-neon" :
                  isToday ? "text-solar-amber" :
                  hasEntry ? "text-solar-text/80 hover:text-compass-neon" :
                  "text-solar-muted/40 hover:text-solar-muted"}
              `}
            >
              {day}
              {hasEntry && (
                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-compass-neon" : "bg-compass-neon/50"}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Weekly Retrospective ──────────────────────────────────────────────────────

function WeeklyRetro({ entries }: { entries: AtlasItemWithTags[] }) {
  const today = new Date()
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1 // Mon=0
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dow)

  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return formatDate(d)
  })

  const entryMap = new Map(
    entries.map((e) => {
      const k = entryDateKey(e)
      return k ? [k, e] : null
    }).filter(Boolean) as [string, AtlasItemWithTags][]
  )

  return (
    <div className="mt-6 pt-6 border-t border-solar-border/20">
      <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/50 mb-3">
        Semana atual
      </p>
      <div className="flex gap-1">
        {weekDates.map((date, i) => {
          const entry = entryMap.get(date)
          const isToday = date === formatDate(new Date())
          return (
            <div
              key={date}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-sm transition-solar
                ${isToday ? "bg-compass-neon/8 ring-1 ring-compass-neon/20" : ""}`}
            >
              <span className={`text-[8px] font-mono ${isToday ? "text-compass-neon" : "text-solar-muted/40"}`}>
                {DAY_NAMES[i]}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${entry ? "bg-compass-neon/70" : "bg-solar-border/30"}`} />
            </div>
          )
        })}
      </div>
      <p className="text-[8px] font-mono text-solar-muted/35 mt-2">
        {entries.filter((e) => weekDates.includes(entryDateKey(e) ?? "")).length}/7 entradas esta semana
      </p>
    </div>
  )
}

// ── Entry Preview ─────────────────────────────────────────────────────────────

function EntryList({ entries }: { entries: AtlasItemWithTags[] }) {
  const sorted = [...entries].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-px">
      {sorted.map((entry) => {
        const dateKey = entryDateKey(entry)
        const excerpt = (() => {
          if (!entry.content) return null
          try {
            const blocks = JSON.parse(entry.content) as Array<{ content?: Array<{ text?: string }> }>
            const text = blocks
              .flatMap((b) => (b.content ?? []).map((c) => c.text ?? ""))
              .join(" ")
              .trim()
            return text.length > 120 ? text.slice(0, 120) + "…" : text || null
          } catch { return null }
        })()

        return (
          <Link
            key={entry.id}
            href={`/compass/diario/${entry.id}`}
            className="group flex gap-4 px-4 py-3 hover:bg-compass-neon/5 transition-solar border-b border-solar-border/10"
          >
            <div className="flex-shrink-0 w-14 text-right">
              <span className="text-[9px] font-mono text-compass-neon-dim/50 group-hover:text-compass-neon/60 transition-solar">
                {dateKey?.slice(5) ?? ""}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono text-solar-text/80 group-hover:text-solar-text transition-solar truncate">
                {entry.title}
              </p>
              {excerpt && (
                <p className="text-[10px] font-mono text-solar-muted/45 mt-0.5 line-clamp-1">
                  {excerpt}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function DiarioClient({ entries }: { entries: AtlasItemWithTags[] }) {
  const router = useRouter()
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate(today))
  const [loadingToday, setLoadingToday] = useState(false)

  const entryDates = new Set(
    entries.map(entryDateKey).filter(Boolean) as string[]
  )

  const handleOpenToday = useCallback(async () => {
    setLoadingToday(true)
    try {
      const res = await fetch("/api/compass/diario/today")
      const entry = await res.json() as { id: string }
      router.push(`/compass/diario/${entry.id}`)
    } catch {
      setLoadingToday(false)
    }
  }, [router])

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date)
    const entry = entries.find((e) => entryDateKey(e) === date)
    if (entry) {
      router.push(`/compass/diario/${entry.id}`)
    }
  }, [entries, router])

  const todayStr = formatDate(today)
  const hasTodayEntry = entryDates.has(todayStr)

  return (
    <div className="flex gap-8">

      {/* ── Sidebar: Calendário + Retro ──────────────────────────────────────── */}
      <aside className="flex-shrink-0 w-64 space-y-2">

        {/* Hoje CTA */}
        <button
          onClick={() => void handleOpenToday()}
          disabled={loadingToday}
          className={`
            w-full flex items-center justify-between px-4 py-2.5
            border transition-solar group
            ${hasTodayEntry
              ? "border-compass-neon/30 bg-compass-neon/5 hover:bg-compass-neon/10"
              : "border-compass-neon/60 bg-compass-neon/10 hover:bg-compass-neon/20"}
          `}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-compass-neon">
            {loadingToday ? "Abrindo…" : hasTodayEntry ? "Hoje →" : "Começar hoje →"}
          </span>
          <span className="text-[8px] font-mono text-compass-neon/50">
            {todayStr.slice(5)}
          </span>
        </button>

        {/* Mini calendar */}
        <div className="border border-solar-border/20 bg-solar-void/40 p-4">
          <MiniCalendar
            year={calYear}
            month={calMonth}
            entryDates={entryDates}
            selectedDate={selectedDate}
            onSelect={handleSelectDate}
            onMonthChange={(y, m) => { setCalYear(y); setCalMonth(m) }}
          />

          <WeeklyRetro entries={entries} />
        </div>

        {/* Stats */}
        <div className="border border-solar-border/20 p-4 space-y-3">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40">
            Estatísticas
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[9px] font-mono text-solar-muted/50">Total de entradas</span>
              <span className="text-[9px] font-mono text-solar-text/70">{entries.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] font-mono text-solar-muted/50">Este mês</span>
              <span className="text-[9px] font-mono text-solar-text/70">
                {entries.filter((e) => {
                  const k = entryDateKey(e)
                  return k && k.startsWith(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`)
                }).length}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Lista de entradas ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="border border-solar-border/20">
          <div className="border-b border-solar-border/20 px-4 py-2 flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50">
              Entradas — {entries.length}
            </span>
          </div>
          {entries.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[10px] font-mono text-solar-muted/40">Nenhuma entrada ainda.</p>
              <button
                onClick={() => void handleOpenToday()}
                className="mt-3 text-[10px] font-mono text-compass-neon/60 hover:text-compass-neon transition-solar"
              >
                Começar hoje →
              </button>
            </div>
          ) : (
            <EntryList entries={entries} />
          )}
        </div>
      </div>
    </div>
  )
}
