"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { GenerativePlaceholder } from "@/atlas/components/ui/GenerativePlaceholder"

type AdminUser = {
  id:          string
  username:    string
  displayName: string
  bio:         string | null
  avatarUrl:   string | null
  accentColor: string
  createdAt:   string
  _count:      { followers: number; following: number; posts: number; interests: number; tickets: number; tokens: number }
}

type AdminData = { users: AdminUser[]; total: number; totalAtlas: number }

// ── Tela de senha ─────────────────────────────────────────────────────────────

function AdminLogin({ onAuth }: { onAuth: (key: string) => void }) {
  const [pwd, setPwd] = useState("")
  const [err, setErr] = useState(false)

  const submit = async () => {
    const res = await fetch("/api/admin/users", { headers: { "x-admin-key": pwd } })
    if (res.ok) { onAuth(pwd) } else { setErr(true) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xs space-y-4">
        <p className="font-mono text-[8px] uppercase tracking-[0.3em]" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
          ☀ Portal Solar · Admin
        </p>
        <h1 className="page-title">Acesso restrito</h1>
        <input
          type="password"
          value={pwd}
          onChange={(e) => { setPwd(e.target.value); setErr(false) }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Senha admin"
          className="w-full bg-transparent font-mono text-[11px] px-3 py-2 outline-none"
          style={{ border: `1px solid ${err ? "rgb(var(--c-accent) / 0.5)" : "rgb(var(--c-border) / 0.3)"}`, color: "rgb(var(--c-text) / 0.85)" }}
        />
        {err && <p className="font-mono text-[7.5px]" style={{ color: "rgb(var(--c-accent) / 0.7)" }}>Senha incorreta.</p>}
        <button onClick={submit} className="btn btn-solid btn-md w-full">Entrar</button>
      </div>
    </div>
  )
}

// ── Painel admin ──────────────────────────────────────────────────────────────

function AdminPanel({ adminKey }: { adminKey: string }) {
  const [data,    setData]    = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/users", { headers: { "x-admin-key": adminKey } })
    if (res.ok) setData(await res.json() as AdminData)
    setLoading(false)
  }, [adminKey])

  useEffect(() => { void load() }, [load])

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Remover @${username} permanentemente?`)) return
    setDeleting(userId)
    await fetch("/api/admin/users", {
      method:  "DELETE",
      headers: { "x-admin-key": adminKey, "Content-Type": "application/json" },
      body:    JSON.stringify({ userId }),
    })
    setDeleting(null)
    void load()
  }

  if (loading) return <p className="font-mono text-[9px] animate-pulse pt-16" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>Carregando…</p>
  if (!data) return null

  return (
    <div className="space-y-8">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Usuários",  value: data.total },
          { label: "Itens Atlas", value: data.totalAtlas },
          { label: "Posts",    value: data.users.reduce((s, u) => s + u._count.posts, 0) },
        ].map((s) => (
          <div key={s.label} className="p-4" style={{ border: "1px solid rgb(var(--c-border) / 0.2)", background: "rgb(var(--c-deep))" }}>
            <p className="font-mono text-[7px] uppercase tracking-widest mb-1" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>{s.label}</p>
            <p className="font-display text-2xl font-bold" style={{ color: "rgb(var(--c-text) / 0.9)" }}>{s.value.toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>

      {/* Lista de usuários */}
      <div>
        <p className="font-mono text-[7.5px] uppercase tracking-[0.3em] mb-4" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
          {data.users.length} usuários registrados
        </p>

        <div className="space-y-px">
          {data.users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 px-4 py-3"
              style={{ background: "rgb(var(--c-deep))", borderLeft: `3px solid ${u.accentColor}40` }}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {u.avatarUrl
                  ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />
                  : <GenerativePlaceholder name={u.displayName} className="w-full h-full" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/perfil/${u.username}`} className="font-display text-[14px] hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-text) / 0.85)" }}>
                    {u.displayName}
                  </Link>
                  <span className="font-mono text-[7.5px]" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>@{u.username}</span>
                </div>
                {u.bio && (
                  <p className="font-mono text-[7.5px] truncate" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>{u.bio}</p>
                )}
              </div>

              {/* Métricas */}
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                {[
                  { label: "seguidores", val: u._count.followers },
                  { label: "posts",      val: u._count.posts },
                  { label: "atlas",      val: u._count.interests },
                  { label: "tickets",    val: u._count.tickets },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="font-mono text-[11px] tabular-nums" style={{ color: "rgb(var(--c-text) / 0.75)" }}>{m.val}</p>
                    <p className="font-mono text-[6px] uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Data + ações */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-[7px]" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </span>
                <Link
                  href={`/perfil/${u.username}`}
                  className="font-mono text-[7px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                  style={{ color: "rgb(var(--c-accent) / 0.7)" }}
                >
                  Ver
                </Link>
                <button
                  onClick={() => deleteUser(u.id, u.username)}
                  disabled={deleting === u.id}
                  className="font-mono text-[7px] uppercase tracking-widest hover:opacity-70 transition-opacity disabled:opacity-30"
                  style={{ color: "rgb(var(--c-muted) / 0.4)" }}
                >
                  {deleting === u.id ? "…" : "Remover"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null)

  if (!adminKey) return <AdminLogin onAuth={setAdminKey} />

  return (
    <div className="min-h-screen py-8">
      <div className="mb-8 pb-6" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.15)" }}>
        <p className="page-label mb-2">☀ Portal Solar</p>
        <h1 className="page-title">Painel Admin</h1>
        <div className="flex gap-4 mt-3">
          <Link href="/social" className="font-mono text-[7.5px] uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>← Social</Link>
          <Link href="/" className="font-mono text-[7.5px] uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>Atlas</Link>
        </div>
      </div>

      <AdminPanel adminKey={adminKey} />
    </div>
  )
}
