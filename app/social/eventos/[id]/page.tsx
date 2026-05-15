"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter }                       from "next/navigation"
import Link                                           from "next/link"

type EventUser = { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string }
type Request   = { id: string; userId: string; status: string; note: string | null; user: EventUser }
type ChatMsg   = { id: string; content: string; createdAt: string; user: EventUser }
type EventDetail = {
  id: string; title: string; description: string | null
  date: string; city: string | null; neighborhood: string | null; address: string | null
  maxGuests: number; spotsLeft: number; status: string; tags: string[]
  host: EventUser; isHost: boolean; myRequestStatus: string | null
  requests: Request[]
}

function Avatar({ user, size = 28 }: { user: EventUser; size?: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center font-bold overflow-hidden"
      style={{ width: size, height: size, background: `${user.accentColor}25`, color: user.accentColor, fontSize: size * 0.38 }}
    >
      {user.displayName[0]?.toUpperCase()}
    </div>
  )
}

export default function EventDetailPage() {
  const { id }    = useParams() as { id: string }
  const router    = useRouter()

  const [event,      setEvent]      = useState<EventDetail | null>(null)
  const [chat,       setChat]       = useState<ChatMsg[]>([])
  const [msg,        setMsg]        = useState("")
  const [sending,    setSending]    = useState(false)
  const [tab,        setTab]        = useState<"info" | "chat" | "pedidos">("info")
  const [noteModal,  setNoteModal]  = useState(false)
  const [note,       setNote]       = useState("")
  const [requesting, setRequesting] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadEvent = useCallback(async () => {
    const res = await fetch(`/api/social/events/${id}`)
    if (!res.ok) { router.push("/social/eventos"); return }
    setEvent(await res.json() as EventDetail)
  }, [id, router])

  const loadChat = useCallback(async () => {
    const res = await fetch(`/api/social/events/${id}/chat`)
    if (res.ok) {
      const data = await res.json() as { messages: ChatMsg[] }
      setChat(data.messages)
    }
  }, [id])

  useEffect(() => {
    void loadEvent()
    void loadChat()
    pollRef.current = setInterval(() => void loadChat(), 8000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [loadEvent, loadChat])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat])

  const sendChat = async () => {
    if (!msg.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/social/events/${id}/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content: msg.trim() }),
    })
    if (res.ok) {
      const m = await res.json() as ChatMsg
      setChat((prev) => [...prev, m])
      setMsg("")
    }
    setSending(false)
  }

  const requestJoin = async () => {
    setRequesting(true)
    await fetch(`/api/social/events/${id}/requests`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ note }),
    })
    await loadEvent()
    setNoteModal(false)
    setNote("")
    setRequesting(false)
  }

  const handleRequest = async (reqId: string, status: "ACCEPTED" | "REJECTED") => {
    await fetch(`/api/social/events/${id}/requests/${reqId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    })
    await loadEvent()
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-[10px] text-solar-muted/40">Carregando…</div>
  }

  const accent  = event.host.accentColor
  const dateObj = new Date(event.date)

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}>
        <div className="absolute inset-0" style={{ borderBottom: `1px solid ${accent}20` }} />
      </div>

      <div className="page-narrow">
        {/* Header */}
        <div className="relative -mt-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1 mb-2">
                {event.tags.map((t) => (
                  <span key={t} className="font-mono text-[6.5px] uppercase tracking-widest px-2 py-0.5 border"
                    style={{ borderColor: `${accent}30`, color: `${accent}` }}>
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="page-title mb-1">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[8.5px]" style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
                <span>
                  {dateObj.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                  {" às "}
                  {dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {(event.city || event.neighborhood) && (
                  <span>{[event.neighborhood, event.city].filter(Boolean).join(", ")}</span>
                )}
                <span style={{ color: event.spotsLeft === 0 ? "rgb(var(--c-muted) / 0.35)" : accent }}>
                  {event.spotsLeft === 0 ? "Lotado" : `${event.spotsLeft} vaga${event.spotsLeft !== 1 ? "s" : ""}`}
                </span>
              </div>
            </div>

            {/* Ação principal */}
            <div className="flex-shrink-0 mt-1">
              {event.isHost ? (
                <span className="font-mono text-[8px] uppercase tracking-widest px-3 py-1.5 border"
                  style={{ borderColor: `${accent}40`, color: accent }}>
                  Você é o host
                </span>
              ) : event.myRequestStatus === "ACCEPTED" ? (
                <span className="font-mono text-[8px] uppercase tracking-widest px-3 py-1.5 border border-green-500/40 text-green-400/80">
                  ✓ Aceito
                </span>
              ) : event.myRequestStatus === "PENDING" ? (
                <span className="font-mono text-[8px] uppercase tracking-widest px-3 py-1.5 border border-solar-border/30 text-solar-muted/50">
                  Pedido enviado
                </span>
              ) : event.myRequestStatus === "REJECTED" ? (
                <span className="font-mono text-[8px] uppercase tracking-widest px-3 py-1.5 border border-red-500/30 text-red-400/60">
                  Não aceito
                </span>
              ) : event.spotsLeft > 0 && event.status === "OPEN" ? (
                <button
                  onClick={() => setNoteModal(true)}
                  className="font-mono text-[8px] uppercase tracking-widest px-4 py-2"
                  style={{ background: accent, color: "#000" }}
                >
                  Quero participar
                </button>
              ) : null}
            </div>
          </div>

          {/* Endereço (só para aceitos) */}
          {event.address && (
            <div className="mt-4 p-3 border border-solar-border/25 bg-solar-deep/30">
              <p className="font-mono text-[7px] uppercase tracking-widest mb-1" style={{ color: accent }}>
                ✦ Endereço — apenas para participantes aceitos
              </p>
              <p className="font-mono text-[10px]" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{event.address}</p>
            </div>
          )}

          {/* Host */}
          <div className="mt-4 flex items-center gap-2">
            <Avatar user={event.host} size={24} />
            <p className="font-mono text-[8px]" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
              organizado por{" "}
              <Link href={`/perfil/${event.host.username}`} className="hover:opacity-80" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
                @{event.host.username}
              </Link>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar mb-6">
          {([["info", "Sobre"], ["chat", "Chat aberto"], ...(event.isHost ? [["pedidos", `Pedidos (${event.requests.filter((r) => r.status === "PENDING").length})`]] : [])] as [string, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t as typeof tab)} className="tab" data-active={tab === t ? "true" : undefined}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Sobre */}
        {tab === "info" && (
          <div className="space-y-4">
            {event.description && (
              <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--c-muted) / 0.75)" }}>{event.description}</p>
            )}
            <div>
              <p className="section-label mb-2">Participantes aceitos</p>
              <div className="flex flex-wrap gap-2">
                {event.requests.filter((r) => r.status === "ACCEPTED").map((r) => (
                  <Link key={r.id} href={`/perfil/${r.user.username}`} className="flex items-center gap-1.5 group">
                    <Avatar user={r.user} size={22} />
                    <span className="font-mono text-[8px] group-hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-text) / 0.65)" }}>
                      @{r.user.username}
                    </span>
                  </Link>
                ))}
                {event.requests.filter((r) => r.status === "ACCEPTED").length === 0 && (
                  <p className="font-mono text-[9px] text-solar-muted/30">Nenhum participante aceito ainda</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Chat */}
        {tab === "chat" && (
          <div className="flex flex-col" style={{ height: "60vh" }}>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-3">
              {chat.length === 0 && (
                <p className="font-mono text-[9px] text-solar-muted/30 text-center py-8">
                  Nenhuma mensagem ainda. Seja o primeiro a escrever!
                </p>
              )}
              {chat.map((m) => (
                <div key={m.id} className="flex items-start gap-2">
                  <Avatar user={m.user} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-mono text-[8px] font-bold" style={{ color: m.user.accentColor }}>
                        @{m.user.username}
                      </span>
                      <span className="font-mono text-[7px] text-solar-muted/25">
                        {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{m.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-3 border-t border-solar-border/20">
              <input
                type="text"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void sendChat() }}
                placeholder="Escrever no chat…"
                className="flex-1 bg-solar-deep/30 border border-solar-border/25 px-3 py-2 font-mono text-[11px] outline-none"
                style={{ color: "rgb(var(--c-text) / 0.85)" }}
              />
              <button
                onClick={() => void sendChat()}
                disabled={sending || !msg.trim()}
                className="font-mono text-[8px] uppercase tracking-widest px-4 py-2 disabled:opacity-30 transition-opacity"
                style={{ background: "rgb(var(--c-accent))", color: "rgb(var(--c-void))" }}
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* Tab: Pedidos (host only) */}
        {tab === "pedidos" && event.isHost && (
          <div className="space-y-3">
            {event.requests.length === 0 && (
              <p className="font-mono text-[9px] text-solar-muted/30 py-8 text-center">Nenhum pedido ainda</p>
            )}
            {event.requests.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-4 border border-solar-border/25 bg-solar-deep/20">
                <Avatar user={r.user} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/perfil/${r.user.username}`} className="font-mono text-[9px] hover:opacity-70" style={{ color: "rgb(var(--c-text) / 0.8)" }}>
                      @{r.user.username}
                    </Link>
                    <span className={`font-mono text-[7px] uppercase tracking-widest px-1.5 py-0.5 ${
                      r.status === "ACCEPTED"  ? "bg-green-500/10 text-green-400/70" :
                      r.status === "REJECTED"  ? "bg-red-500/10 text-red-400/60" :
                                                 "bg-solar-accent/10 text-solar-accent/70"
                    }`}>
                      {r.status === "ACCEPTED" ? "Aceito" : r.status === "REJECTED" ? "Rejeitado" : "Pendente"}
                    </span>
                  </div>
                  {r.note && <p className="font-mono text-[9px] text-solar-muted/55 italic mb-2">&ldquo;{r.note}&rdquo;</p>}
                  {r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleRequest(r.id, "ACCEPTED")}
                        className="font-mono text-[7.5px] uppercase tracking-widest px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400/80 hover:bg-green-500/20 transition-colors"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => void handleRequest(r.id, "REJECTED")}
                        className="font-mono text-[7.5px] uppercase tracking-widest px-3 py-1 border border-solar-border/25 text-solar-muted/50 hover:border-red-500/30 hover:text-red-400/60 transition-colors"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: pedido para participar */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgb(var(--c-void) / 0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm" style={{ border: "1px solid rgb(var(--c-border) / 0.35)", background: "rgb(var(--c-deep))" }}>
            <div className="px-6 py-5 border-b border-solar-border/20">
              <p className="font-display" style={{ fontSize: "1rem", color: "rgb(var(--c-text) / 0.9)" }}>Pedir para participar</p>
              <p className="font-mono text-[8px] text-solar-muted/45 mt-0.5">{event.title}</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="section-label mb-2 block">Apresentação (opcional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Diga algo sobre você ou por que quer participar…"
                  rows={3}
                  className="w-full bg-solar-void/60 border border-solar-border/25 p-3 font-mono text-[11px] outline-none resize-none"
                  style={{ color: "rgb(var(--c-text) / 0.8)" }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => void requestJoin()}
                  disabled={requesting}
                  className="flex-1 font-mono text-[8px] uppercase tracking-widest py-2.5"
                  style={{ background: accent, color: "#000" }}
                >
                  {requesting ? "Enviando…" : "Enviar pedido →"}
                </button>
                <button
                  onClick={() => setNoteModal(false)}
                  className="font-mono text-[8px] uppercase tracking-widest px-4 py-2.5 border border-solar-border/25 text-solar-muted/50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
