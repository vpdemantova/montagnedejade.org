import { notFound } from "next/navigation"
import Link from "next/link"
import { MemberCard, type CardData } from "@/atlas/components/compass/ProfileCard"

// ── Busca dados do perfil público ─────────────────────────────────────────────

async function getCardData(username: string): Promise<CardData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const res  = await fetch(`${base}/api/perfil/${encodeURIComponent(username)}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json() as Promise<CardData>
  } catch { return null }
}

// ── Página ────────────────────────────────────────────────────────────────────

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await getCardData(username)
  if (!data) notFound()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16">

      {/* Card do anfitrião */}
      <div className="w-full max-w-sm">
        <MemberCard data={data} />
      </div>

      {/* Mensagem de convite */}
      <div className="max-w-sm text-center space-y-4">
        <p className="font-mono text-[8px] uppercase tracking-[0.3em]"
          style={{ color: "rgb(var(--c-accent) / 0.7)" }}>
          Convite
        </p>
        <p className="font-display text-xl leading-snug"
          style={{ color: "rgb(var(--c-text) / 0.88)", letterSpacing: "-0.01em" }}>
          <span style={{ color: data.accentColor }}>@{data.username}</span>{" "}
          te convida para fazer parte do Portal Solar.
        </p>
        <p className="font-mono text-[8.5px] leading-relaxed"
          style={{ color: "rgb(var(--c-muted) / 0.65)" }}>
          Crie seu perfil ou apenas navegue na plataforma da realidade —
          construindo utopias, registrando ações de paz.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link
            href={`/register?ref=${encodeURIComponent(data.username)}`}
            className="flex-1 flex items-center justify-center font-mono text-[8px] uppercase tracking-[0.2em] px-5 py-3 transition-colors"
            style={{ background: "rgb(var(--c-text))", color: "rgb(var(--c-void))" }}
          >
            Criar meu perfil →
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center font-mono text-[8px] uppercase tracking-[0.2em] px-5 py-3 border transition-colors"
            style={{ border: "1px solid rgb(var(--c-border) / 0.35)", color: "rgb(var(--c-text) / 0.7)" }}
          >
            Navegar na plataforma
          </Link>
        </div>
      </div>

      {/* Rodapé */}
      <p className="font-mono text-[7px] uppercase tracking-widest"
        style={{ color: "rgb(var(--c-muted) / 0.3)" }}>
        ☀ Portal Solar · Construindo Utopias · Ações de Paz
      </p>

    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  return {
    title:       `@${username} te convida — Portal Solar`,
    description: `${username} te convida para fazer parte do Portal Solar. Crie seu perfil ou apenas navegue na plataforma da realidade.`,
  }
}
