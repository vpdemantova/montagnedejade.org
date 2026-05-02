"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type ConvUser = { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string }
type Conversation = {
  id:          string
  name:        string
  isGroup:     boolean
  updatedAt:   string
  unread:      boolean
  participants: ConvUser[]
  lastMessage: { content: string; sender: string; sentAt: string } | null
}

function Avatar({ user, size = 32 }: { user: ConvUser; size?: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
      style={{ width: size, height: size, background: `${user.accentColor}25`, color: user.accentColor, fontSize: size * 0.38 }}
    >
      {user.displayName[0]?.toUpperCase()}
    </div>
  )
}

// Modal para criar nova conversa
function NewConvModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [search,   setSearch]   = useState("")
  const [results,  setResults]  = useState<ConvUser[]>([])
  const [selected, setSelected] = useState<ConvUser[]>([])
  const [groupName, setGroupName] = useState("")
  const [creating, setCreating] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    const res = await fetch(`/api/social/members?search=${encodeURIComponent(q)}&limit=10`)
    if (res.ok) {
      const data = await res.json() as { users: ConvUser[] }
      setResults(data.users.filter((u) => !selected.find((s) => s.id === u.id)))
    }
  }, [selected])

  useEffect(() => { void doSearch(search) }, [search, doSearch])

  const toggle = (user: ConvUser) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]
    )
  }

  const create = async () => {
    if (selected.length === 0) return
    setCreating(true)
    const res = await fetch("/api/social/conversations", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        participantIds: selected.map((u) => u.id),
        name: selected.length > 1 ? (groupName.trim() || null) : undefined,
      }),
    })
    if (res.ok) {
      const conv = await res.json() as { id: string }
      onCreated(conv.id)
    }
    setCreating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgb(var(--c-void) / 0.8)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm" style={{ border: "1px solid rgb(var(--c-border) / 0.35)", background: "rgb(var(--c-deep))" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-solar-border/20">
          <p className="font-display" style={{ fontSize: "0.95rem" }}>Nova conversa</p>
          <button onClick={onClose} className="font-mono text-[18px] text-solar-muted/40 hover:text-solar-text/60">×</button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <button key={u.id} onClick={() => toggle(u)}
                  className="flex items-center gap-1 font-mono text-[7.5px] px-2 py-1 border border-solar-accent/30 text-solar-accent/80 hover:bg-solar-accent/10 transition-colors">
                  @{u.username} ×
                </button>
              ))}
            </div>
          )}

          {selected.length > 1 && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nome do grupo (opcional)"
              className="w-full bg-solar-void/50 border border-solar-border/25 px-3 py-2 font-mono text-[11px] outline-none"
              style={{ color: "rgb(var(--c-text) / 0.8)" }}
            />
          )}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou @usuario…"
            className="w-full bg-solar-void/50 border border-solar-border/25 px-3 py-2 font-mono text-[11px] outline-none"
            style={{ color: "rgb(var(--c-text) / 0.8)" }}
            autoFocus
          />

          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map((u) => (
              <button key={u.id} onClick={() => toggle(u)}
                className="w-full flex items-center gap-2 px-2 py-2 hover:bg-solar-surface/30 transition-colors text-left">
                <Avatar user={u} size={26} />
                <div>
                  <p className="font-mono text-[9px]" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{u.displayName}</p>
                  <p className="font-mono text-[7.5px] text-solar-muted/40">@{u.username}</p>
                </div>
              </button>
            ))}
            {search && results.length === 0 && (
              <p className="font-mono text-[8px] text-solar-muted/30 text-center py-3">Nenhum resultado</p>
            )}
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={() => void create()}
            disabled={creating || selected.length === 0}
            className="w-full font-mono text-[8px] uppercase tracking-widest py-2.5 disabled:opacity-30"
            style={{ background: "rgb(var(--c-text))", color: "rgb(var(--c-void))" }}
          >
            {creating ? "Criando…" : selected.length > 1 ? "Criar grupo →" : "Iniciar conversa →"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MensagensPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading,       setLoading]       = useState(true)
  const [newConv,       setNewConv]       = useState(false)

  const load = useCallback(async () => {
    const res = await fetch("/api/social/conversations")
    if (res.ok) setConversations(await res.json() as Conversation[])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const handleCreated = (id: string) => {
    setNewConv(false)
    router.push(`/social/mensagens/${id}`)
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="ph">
        <div className="page-narrow flex items-end justify-between gap-4">
          <div>
            <p className="page-label mb-2">Portal Solar · Mensagens</p>
            <h1 className="page-title">Mensagens</h1>
          </div>
          <button
            onClick={() => setNewConv(true)}
            className="font-mono text-[8px] uppercase tracking-[0.2em] px-4 py-2 mb-1 flex-shrink-0"
            style={{ background: "rgb(var(--c-text))", color: "rgb(var(--c-void))" }}
          >
            + Nova conversa
          </button>
        </div>
      </header>

      <div className="page-narrow py-6">
        {loading ? (
          <p className="font-mono text-[10px] text-solar-muted/40 animate-pulse">Carregando…</p>
        ) : conversations.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-solar-text/25 mb-2">Nenhuma conversa ainda</p>
            <p className="font-mono text-[9px] text-solar-muted/30 mb-6">Inicie um DM ou crie um grupo.</p>
            <button onClick={() => setNewConv(true)} className="btn btn-primary btn-sm">
              Nova conversa →
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-solar-border/15">
            {conversations.map((conv) => {
              const others = conv.participants.filter((_, i) => conv.participants[i])
              const mainUser = others[0]

              return (
                <Link key={conv.id} href={`/social/mensagens/${conv.id}`}
                  className="flex items-center gap-3 py-4 hover:bg-solar-surface/20 transition-colors -mx-2 px-2">
                  {/* Avatar(s) */}
                  {conv.isGroup ? (
                    <div className="relative w-9 h-9 flex-shrink-0">
                      {others.slice(0, 2).map((u, i) => (
                        <div key={u.id}
                          className="absolute rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{
                            width: 22, height: 22,
                            background: `${u.accentColor}25`, color: u.accentColor,
                            top: i === 0 ? 0 : 12, left: i === 0 ? 0 : 12,
                            border: "2px solid rgb(var(--c-void))",
                            zIndex: i,
                          }}
                        >
                          {u.displayName[0]?.toUpperCase()}
                        </div>
                      ))}
                    </div>
                  ) : mainUser ? (
                    <Avatar user={mainUser} size={36} />
                  ) : null}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[10px] font-semibold truncate"
                        style={{ color: conv.unread ? "rgb(var(--c-text) / 0.95)" : "rgb(var(--c-text) / 0.7)" }}>
                        {conv.name ?? (mainUser?.displayName ?? "Conversa")}
                        {conv.isGroup && <span className="ml-1.5 font-mono text-[7px] text-solar-muted/30 font-normal">grupo</span>}
                      </p>
                      {conv.lastMessage && (
                        <p className="font-mono text-[7px] text-solar-muted/30 flex-shrink-0">
                          {new Date(conv.lastMessage.sentAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                        </p>
                      )}
                    </div>
                    {conv.lastMessage ? (
                      <p className="font-mono text-[8.5px] truncate mt-0.5"
                        style={{ color: conv.unread ? "rgb(var(--c-text) / 0.65)" : "rgb(var(--c-muted) / 0.4)" }}>
                        <span style={{ color: "rgb(var(--c-muted) / 0.5)" }}>{conv.lastMessage.sender}: </span>
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="font-mono text-[8px] text-solar-muted/25 mt-0.5">Sem mensagens</p>
                    )}
                  </div>

                  {conv.unread && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgb(var(--c-accent))" }} />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {newConv && <NewConvModal onClose={() => setNewConv(false)} onCreated={handleCreated} />}
    </div>
  )
}
