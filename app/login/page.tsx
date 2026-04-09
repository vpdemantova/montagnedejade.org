"use client"

import { useState, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get("from") ?? "/"

  const [username,     setUsername]     = useState("")
  const [password,     setPassword]     = useState("")
  const [error,        setError]        = useState("")
  const [loading,      setLoading]      = useState(false)
  const [loadingGuest, setLoadingGuest] = useState(false)

  async function handleGuest() {
    setLoadingGuest(true)
    const res = await fetch("/api/auth/guest", { method: "POST" })
    if (res.ok) router.replace("/")
    else setLoadingGuest(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, password }),
    })
    if (res.ok) {
      router.replace(from)
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? "Erro ao entrar")
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "rgb(var(--c-void))" }}
    >
      <div className="w-full max-w-sm px-6">

        {/* ── Wordmark ── */}
        <div className="mb-16">
          <p className="editorial-label text-solar-muted/30 mb-4">
            PORTAL SOLAR / {new Date().getFullYear()}
          </p>
          <h1
            className="font-display text-[clamp(3rem,10vw,6rem)] font-bold leading-none tracking-tighter uppercase text-solar-text"
          >
            ATLAS
          </h1>
          <div className="mt-3 w-12 border-t border-solar-accent/40" />
        </div>

        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit}>
          <div className="border border-solar-border/30 bg-solar-deep">

            <div className="px-6 py-6 border-b border-solar-border/20 space-y-6">
              <p className="editorial-label text-solar-muted/35">Identificação</p>

              <div className="space-y-5">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                  autoFocus
                  autoComplete="username"
                  required
                  className="editorial-input"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  autoComplete="current-password"
                  required
                  className="editorial-input"
                />
              </div>

              {error && (
                <p className="font-mono text-[9px] text-red-400/70 tracking-wide">{error}</p>
              )}
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-solar-accent/70 hover:text-solar-accent disabled:text-solar-muted/25 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Entrando…" : "Entrar →"}
              </button>
              <Link
                href="/register"
                className="font-mono text-[9px] text-solar-muted/35 hover:text-solar-muted/70 transition-colors"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </form>

        {/* ── Visitante ── */}
        <div className="mt-8 pt-6 border-t border-solar-border/15 flex flex-col gap-2">
          <button
            onClick={handleGuest}
            disabled={loadingGuest}
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-solar-muted/30 hover:text-solar-muted/60 disabled:cursor-not-allowed transition-colors"
          >
            {loadingGuest ? "Carregando…" : "Explorar sem login →"}
          </button>
          <p className="font-mono text-[8px] text-solar-muted/20 tracking-wide">
            Acesso somente leitura · 4 horas
          </p>
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
