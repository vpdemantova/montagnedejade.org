"use client"

import { useState, FormEvent, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function RegisterForm() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const invitedBy     = searchParams.get("ref") ?? undefined

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
      body:    JSON.stringify({ username, displayName, password, invitedByUsername: invitedBy }),
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "rgb(var(--c-void))" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-12 h-12 flex items-center justify-center"
            style={{ border: "1px solid rgb(var(--c-accent) / 0.2)" }}>
            <span className="font-mono text-2xl leading-none" style={{ color: "rgb(var(--c-accent) / 0.5)" }}>☀</span>
          </div>
          <p className="page-label">Portal Solar</p>
        </div>

        {invitedBy && (
          <div className="mb-4 px-5 py-3 text-center font-mono text-[8px]"
            style={{ border: "1px solid rgb(var(--c-accent) / 0.2)", color: "rgb(var(--c-muted) / 0.7)" }}>
            <span style={{ color: "rgb(var(--c-accent) / 0.8)" }}>@{invitedBy}</span> te convida para o Portal Solar
          </div>
        )}

        <form onSubmit={handleSubmit}
          style={{ border: "1px solid rgb(var(--c-border) / 0.25)", background: "rgb(var(--c-deep) / 0.4)" }}>

          <div className="px-8 py-6 space-y-5"
            style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.2)" }}>
            <p className="section-label">Criar perfil</p>

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
                className="w-full bg-transparent font-mono text-sm outline-none pb-2 transition-colors"
                style={{
                  color: "rgb(var(--c-text) / 0.8)",
                  borderBottom: "1px solid rgb(var(--c-border) / 0.3)",
                }}
                onFocus={(e) => e.currentTarget.style.borderBottomColor = "rgb(var(--c-accent) / 0.4)"}
                onBlur={(e) => e.currentTarget.style.borderBottomColor = "rgb(var(--c-border) / 0.3)"}
              />
              <p className="font-mono text-[7.5px] mt-1" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
                Apenas letras, números e _ · Você pode mudar depois nas configurações
              </p>
            </div>

            {[
              { value: displayName, set: setDisplayName, placeholder: "Nome de exibição", type: "text",     autoComplete: "name" },
              { value: password,    set: setPassword,    placeholder: "Senha (mín. 6 caracteres)", type: "password", autoComplete: "new-password" },
              { value: confirm,     set: setConfirm,     placeholder: "Confirmar senha",  type: "password", autoComplete: "new-password" },
            ].map(({ value, set, placeholder, type, autoComplete }) => (
              <input
                key={placeholder}
                type={type}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required
                className="w-full bg-transparent font-mono text-sm outline-none pb-2 transition-colors"
                style={{
                  color: "rgb(var(--c-text) / 0.8)",
                  borderBottom: "1px solid rgb(var(--c-border) / 0.3)",
                }}
                onFocus={(e) => e.currentTarget.style.borderBottomColor = "rgb(var(--c-accent) / 0.4)"}
                onBlur={(e) => e.currentTarget.style.borderBottomColor = "rgb(var(--c-border) / 0.3)"}
              />
            ))}

            {error && <p className="font-mono text-[9px] text-red-400/70">{error}</p>}

            <p className="font-mono text-[7.5px] leading-relaxed" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
              Ao criar sua conta você ganha{" "}
              <span style={{ color: "rgb(var(--c-accent) / 0.7)" }}>3 Tickets Solares</span> de boas-vindas,
              incluindo um <span style={{ color: "rgb(var(--c-accent) / 0.7)" }}>Ticket Fundador</span> exclusivo.
            </p>
          </div>

          <div className="px-8 py-4 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !username || !displayName || !password || !confirm}
              className="btn btn-primary btn-md"
            >
              {loading ? "Criando…" : "Criar conta →"}
            </button>
            <Link href="/login" className="btn btn-subtle btn-sm">
              Já tenho conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
