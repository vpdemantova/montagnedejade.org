"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

type EventCard = {
  id:           string
  title:        string
  description:  string | null
  date:         string
  city:         string | null
  neighborhood: string | null
  maxGuests:    number
  spotsLeft:    number
  status:       string
  tags:         string[]
  host:         { id: string; username: string; displayName: string; accentColor: string }
  recommended:  boolean
  commonTags:   string[]
}

function TagChip({ tag, accent }: { tag: string; accent?: string }) {
  return (
    <span
      className="font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 border"
      style={{
        borderColor: accent ? `${accent}40` : "rgb(var(--c-border) / 0.35)",
        color:       accent ?? "rgb(var(--c-muted) / 0.7)",
      }}
    >
      {tag}
    </span>
  )
}

function EventCardItem({ ev }: { ev: EventCard }) {
  const dateObj  = new Date(ev.date)
  const accent   = ev.host.accentColor
  const isFull   = ev.spotsLeft === 0

  return (
    <Link
      href={`/social/eventos/${ev.id}`}
      className="block group"
      style={{
        border:     `1px solid ${accent}20`,
        background: "rgb(var(--c-deep) / 0.4)",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${accent}50`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${accent}20`)}
    >
      {/* Faixa de cor do host no topo */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}60, transparent)` }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {ev.recommended && (
              <p className="font-mono text-[6.5px] uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>
                ✦ Recomendado para você
              </p>
            )}
            <h3
              className="font-display leading-snug truncate"
              style={{ fontSize: "1rem", letterSpacing: "-0.01em", color: "rgb(var(--c-text) / 0.9)" }}
            >
              {ev.title}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-[8px]" style={{ color: isFull ? "rgb(var(--c-muted) / 0.4)" : accent }}>
              {isFull ? "Lotado" : `${ev.spotsLeft} vaga${ev.spotsLeft !== 1 ? "s" : ""}`}
            </p>
            <p className="font-mono text-[7px] text-solar-muted/30">{ev.maxGuests} max</p>
          </div>
        </div>

        {/* Data e localização */}
        <div className="flex items-center gap-3 mb-3">
          <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
            {dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            {" · "}
            {dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          {(ev.city || ev.neighborhood) && (
            <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
              {[ev.neighborhood, ev.city].filter(Boolean).join(", ")}
            </p>
          )}
        </div>

        {/* Descrição */}
        {ev.description && (
          <p className="text-[11px] leading-relaxed mb-3 line-clamp-2" style={{ color: "rgb(var(--c-muted) / 0.65)" }}>
            {ev.description}
          </p>
        )}

        {/* Tags */}
        {ev.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {ev.tags.slice(0, 5).map((t) => (
              <TagChip key={t} tag={t} accent={ev.commonTags.includes(t) ? accent : undefined} />
            ))}
          </div>
        )}

        {/* Host */}
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{ background: `${accent}25`, color: accent }}
          >
            {ev.host.displayName[0]?.toUpperCase()}
          </div>
          <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
            por <span style={{ color: "rgb(var(--c-text) / 0.7)" }}>@{ev.host.username}</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default function EventosPage() {
  const [events,  setEvents]  = useState<EventCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")

  const load = useCallback(async (tag?: string) => {
    setLoading(true)
    const url = tag ? `/api/social/events?tag=${encodeURIComponent(tag)}` : "/api/social/events"
    const res = await fetch(url)
    if (res.ok) setEvents(await res.json() as EventCard[])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const filtered = events.filter((ev) =>
    !search || ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.tags.some((t) => t.includes(search.toLowerCase())) ||
    ev.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="ph">
        <div className="page-narrow">
          <p className="page-label mb-2">Portal Solar · Encontros</p>
          <h1 className="page-title mb-5">Eventos</h1>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, tag ou cidade…"
              className="flex-1 bg-transparent font-mono text-sm outline-none pb-1.5 transition-colors"
              style={{
                color:        "rgb(var(--c-text) / 0.8)",
                borderBottom: "1px solid rgb(var(--c-border) / 0.3)",
              }}
            />
            <Link
              href="/social/eventos/novo"
              className="font-mono text-[8px] uppercase tracking-[0.2em] px-4 py-2 flex-shrink-0"
              style={{ background: "rgb(var(--c-text))", color: "rgb(var(--c-void))" }}
            >
              + Criar encontro
            </Link>
          </div>
        </div>
      </header>

      <div className="page-narrow py-8">
        {loading ? (
          <p className="font-mono text-[10px] text-solar-muted/40 animate-pulse">Carregando encontros…</p>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-solar-text/30 mb-2">Nenhum encontro por aqui</p>
            <p className="font-mono text-[9px] text-solar-muted/30 mb-6">
              Seja o primeiro a criar um evento na sua cidade.
            </p>
            <Link href="/social/eventos/novo" className="btn btn-primary btn-sm">
              Criar encontro →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((ev) => <EventCardItem key={ev.id} ev={ev} />)}
          </div>
        )}
      </div>
    </div>
  )
}
