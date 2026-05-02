"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams }                                  from "next/navigation"
import Link                                           from "next/link"

type ConvUser = { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string }
type ChatMessage = {
  id:        string
  content:   string
  createdAt: string
  sender:    ConvUser
}
type ConvDetail = {
  id:           string
  name:         string | null
  isGroup:      boolean
  participants: ConvUser[]
  messages:     ChatMessage[]
  nextCursor:   string | null
}

function Avatar({ user, size = 28 }: { user: ConvUser; size?: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
      style={{ width: size, height: size, background: `${user.accentColor}25`, color: user.accentColor, fontSize: size * 0.38 }}
    >
      {user.displayName[0]?.toUpperCase()}
    </div>
  )
}

// Modal para adicionar participante
function AddParticipantModal({ convId, onClose, currentIds }: { convId: string; onClose: () => void; currentIds: string[] }) {
  const [search,   setSearch]   = useState("")
  const [results,  setResults]  = useState<ConvUser[]>([])
  const [adding,   setAdding]   = useState(false)

  useEffect(() => {
    if (!search.trim()) { setResults([]); return }
    void fetch(`/api/social/members?search=${encodeURIComponent(search)}&limit=8`)
      .then((r) => r.json() as Promise<{ users: ConvUser[] }>)
      .then((d) => setResults(d.users.filter((u) => !currentIds.includes(u.id))))
  }, [search, currentIds])

  const add = async (userId: string) => {
    setAdding(true)
    await fetch(`/api/social/conversations/${convId}/participants`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ userId }),
    })
    setAdding(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgb(var(--c-void) / 0.8)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-xs" style={{ border: "1px solid rgb(var(--c-border) / 0.35)", background: "rgb(var(--c-deep))" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-solar-border/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-solar-muted/60">Adicionar ao grupo</p>
          <button onClick={onClose} className="font-mono text-[18px] text-solar-muted/40 hover:text-solar-text/60">×</button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuário…"
            autoFocus
            className="w-full bg-solar-void/50 border border-solar-border/25 px-3 py-2 font-mono text-[11px] outline-none"
            style={{ color: "rgb(var(--c-text) / 0.8)" }}
          />
          <div className="max-h-40 overflow-y-auto space-y-1">
            {results.map((u) => (
              <button key={u.id} disabled={adding} onClick={() => void add(u.id)}
                className="w-full flex items-center gap-2 px-2 py-2 hover:bg-solar-surface/30 transition-colors text-left">
                <Avatar user={u} size={24} />
                <div>
                  <p className="font-mono text-[9px]" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{u.displayName}</p>
                  <p className="font-mono text-[7.5px] text-solar-muted/40">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConversationPage() {
  const { id } = useParams() as { id: string }

  const [conv,       setConv]       = useState<ConvDetail | null>(null)
  const [messages,   setMessages]   = useState<ChatMessage[]>([])
  const [msg,        setMsg]        = useState("")
  const [sending,    setSending]    = useState(false)
  const [addModal,   setAddModal]   = useState(false)
  const [me,         setMe]         = useState<{ userId?: string } | null>(null)
  const bottomRef    = useRef<HTMLDivElement>(null)
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/social/conversations/${id}`)
    if (!res.ok) return
    const data = await res.json() as ConvDetail
    setConv(data)
    setMessages(data.messages)
  }, [id])

  useEffect(() => {
    void load()
    void fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((d: { userId?: string } | null) => setMe(d))
    pollRef.current = setInterval(() => void load(), 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!msg.trim() || sending) return
    setSending(true)
    const content = msg.trim()
    setMsg("")
    const res = await fetch(`/api/social/conversations/${id}/messages`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content }),
    })
    if (res.ok) {
      const m = await res.json() as ChatMessage
      setMessages((prev) => [...prev, m])
    }
    setSending(false)
  }

  if (!conv) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-[10px] text-solar-muted/40">Carregando…</div>
  }

  const others  = conv.participants.filter((p) => p.id !== me?.userId)
  const title   = conv.name ?? (others[0]?.displayName ?? "Conversa")

  return (
    <div className="flex flex-col h-screen">
      {/* Header fixo */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-solar-border/25 bg-solar-deep/60"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <Link href="/social/mensagens" className="font-mono text-[10px] text-solar-muted/40 hover:text-solar-muted/70 transition-colors mr-1">
          ←
        </Link>

        {conv.isGroup ? (
          <div className="relative w-8 h-8 flex-shrink-0">
            {others.slice(0, 2).map((u, i) => (
              <div key={u.id}
                className="absolute rounded-full flex items-center justify-center text-[7px] font-bold"
                style={{
                  width: 20, height: 20,
                  background: `${u.accentColor}25`, color: u.accentColor,
                  top: i === 0 ? 0 : 10, left: i === 0 ? 0 : 10,
                  border: "1.5px solid rgb(var(--c-deep))",
                }}
              >
                {u.displayName[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        ) : others[0] ? (
          <Avatar user={others[0]} size={32} />
        ) : null}

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] font-semibold truncate" style={{ color: "rgb(var(--c-text) / 0.88)" }}>
            {title}
          </p>
          <p className="font-mono text-[7.5px] text-solar-muted/35">
            {conv.isGroup
              ? `${conv.participants.length} participantes`
              : others[0] ? `@${others[0].username}` : ""}
          </p>
        </div>

        {conv.isGroup && (
          <button onClick={() => setAddModal(true)}
            className="font-mono text-[7.5px] uppercase tracking-widest px-2 py-1 border border-solar-border/25 text-solar-muted/40 hover:text-solar-accent hover:border-solar-accent/30 transition-colors flex-shrink-0">
            + Add
          </button>
        )}
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="font-mono text-[9px] text-solar-muted/30 text-center py-12">
            Nenhuma mensagem. Diga olá!
          </p>
        )}
        {messages.map((m, i) => {
          const isMe    = m.sender.id === me?.userId
          const showAvatar = !isMe && (i === 0 || messages[i - 1]?.sender.id !== m.sender.id)
          const showName   = !isMe && showAvatar

          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <div style={{ width: 28, flexShrink: 0 }}>
                  {showAvatar && <Avatar user={m.sender} size={28} />}
                </div>
              )}
              <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                {showName && (
                  <p className="font-mono text-[7px] mb-0.5 ml-1" style={{ color: m.sender.accentColor }}>
                    @{m.sender.username}
                  </p>
                )}
                <div
                  className="px-3 py-2 text-[11px] leading-relaxed"
                  style={{
                    background: isMe ? "rgb(var(--c-accent) / 0.15)" : "rgb(var(--c-deep) / 0.6)",
                    border:     `1px solid ${isMe ? "rgb(var(--c-accent) / 0.2)" : "rgb(var(--c-border) / 0.2)"}`,
                    color:      "rgb(var(--c-text) / 0.85)",
                  }}
                >
                  {m.content}
                </div>
                <p className="font-mono text-[6.5px] mt-0.5 mx-1 text-solar-muted/25">
                  {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-solar-border/20 bg-solar-deep/40"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send() } }}
          placeholder="Mensagem…"
          className="flex-1 bg-solar-void/60 border border-solar-border/25 px-3 py-2.5 font-mono text-[11px] outline-none rounded-none"
          style={{ color: "rgb(var(--c-text) / 0.85)" }}
        />
        <button
          onClick={() => void send()}
          disabled={sending || !msg.trim()}
          className="font-mono text-[9px] uppercase tracking-widest px-4 py-2.5 disabled:opacity-30 transition-opacity flex-shrink-0"
          style={{ background: "rgb(var(--c-accent))", color: "rgb(var(--c-void))" }}
        >
          →
        </button>
      </div>

      {addModal && (
        <AddParticipantModal
          convId={id}
          onClose={() => setAddModal(false)}
          currentIds={conv.participants.map((p) => p.id)}
        />
      )}
    </div>
  )
}
