"use client"

import { useState, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const from         = searchParams.get("from") ?? "/"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

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
    <div className="min-h-screen flex items-center justify-center bg-[#08080C]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <div className="w-14 h-14 border border-[#C8A45A]/20 rounded-full flex items-center justify-center">
            <span className="font-mono text-[#C8A45A]/50 text-2xl leading-none">☀</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#C8A45A]/30">Portal Solar</p>
        </div>

        <form onSubmit={handleSubmit} className="border border-[#2A2A2A] bg-[#0D0D12]">
          <div className="px-8 py-6 border-b border-[#2A2A2A] space-y-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">Entrar</p>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuário"
              autoFocus
              autoComplete="username"
              required
              className="w-full bg-transparent font-mono text-sm text-white/80 placeholder-[#444] outline-none border-b border-[#2A2A2A] pb-2 focus:border-[#C8A45A]/40 transition-colors"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              required
              className="w-full bg-transparent font-mono text-sm text-white/80 placeholder-[#444] outline-none border-b border-[#2A2A2A] pb-2 focus:border-[#C8A45A]/40 transition-colors"
            />

            {error && (
              <p className="font-mono text-[9px] text-red-400/70">{error}</p>
            )}
          </div>

          <div className="px-8 py-4 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8A45A]/60 hover:text-[#C8A45A] disabled:text-[#444] disabled:cursor-not-allowed transition-colors py-2"
            >
              {loading ? "Entrando…" : "Entrar →"}
            </button>
            <Link
              href="/register"
              className="font-mono text-[9px] text-[#555] hover:text-[#C8A45A]/50 transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </form>
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
