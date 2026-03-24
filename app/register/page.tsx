"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()

  const [username,    setUsername]    = useState("")
  const [displayName, setDisplayName] = useState("")
  const [password,    setPassword]    = useState("")
  const [confirm,     setConfirm]     = useState("")
  const [error,       setError]       = useState("")
  const [loading,     setLoading]     = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("As senhas não coincidem")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username, displayName, password }),
    })

    if (res.ok) {
      router.replace("/")
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? "Erro ao criar conta")
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
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">Criar perfil</p>

            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="@usuario"
                autoFocus
                autoComplete="username"
                required
                maxLength={20}
                className="w-full bg-transparent font-mono text-sm text-white/80 placeholder-[#444] outline-none border-b border-[#2A2A2A] pb-2 focus:border-[#C8A45A]/40 transition-colors"
              />
              <p className="font-mono text-[8px] text-[#444] mt-1">Apenas letras, números e _ · Imutável depois de criado</p>
            </div>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nome de exibição"
              autoComplete="name"
              required
              maxLength={40}
              className="w-full bg-transparent font-mono text-sm text-white/80 placeholder-[#444] outline-none border-b border-[#2A2A2A] pb-2 focus:border-[#C8A45A]/40 transition-colors"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              autoComplete="new-password"
              required
              className="w-full bg-transparent font-mono text-sm text-white/80 placeholder-[#444] outline-none border-b border-[#2A2A2A] pb-2 focus:border-[#C8A45A]/40 transition-colors"
            />

            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirmar senha"
              autoComplete="new-password"
              required
              className="w-full bg-transparent font-mono text-sm text-white/80 placeholder-[#444] outline-none border-b border-[#2A2A2A] pb-2 focus:border-[#C8A45A]/40 transition-colors"
            />

            {error && (
              <p className="font-mono text-[9px] text-red-400/70">{error}</p>
            )}

            <p className="font-mono text-[8px] text-[#444] leading-relaxed">
              Ao criar sua conta você ganha <span className="text-[#C8A45A]/60">3 Tickets Solares</span> de boas-vindas,
              incluindo um <span className="text-[#C8A45A]/60">Ticket Fundador</span> exclusivo.
            </p>
          </div>

          <div className="px-8 py-4 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !username || !displayName || !password || !confirm}
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8A45A]/60 hover:text-[#C8A45A] disabled:text-[#444] disabled:cursor-not-allowed transition-colors py-2"
            >
              {loading ? "Criando…" : "Criar conta →"}
            </button>
            <Link
              href="/login"
              className="font-mono text-[9px] text-[#555] hover:text-[#C8A45A]/50 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
