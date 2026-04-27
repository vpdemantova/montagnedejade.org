"use client"

import { useState, useRef, useCallback, type MouseEvent } from "react"
import { GenerativePlaceholder } from "@/atlas/components/ui/GenerativePlaceholder"

export type CardData = {
  username:    string
  displayName: string
  bio?:        string | null
  avatarUrl?:  string | null
  accentColor: string
  memberNum:   string
  since:       string
}

// ── Card visual — proporção carteirinha (85.6 × 54 mm ~ 1.585:1) ─────────────

function MemberCard({ data, className = "" }: { data: CardData; className?: string }) {
  const accent   = data.accentColor ?? "#C8A45A"
  const cardRef  = useRef<HTMLDivElement>(null)
  const tiltRef  = useRef({ x: 0, y: 0 })
  const rafRef   = useRef<number>(0)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el   = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    const dx   = (e.clientX - cx) / (rect.width  / 2)  // -1 .. 1
    const dy   = (e.clientY - cy) / (rect.height / 2)  // -1 .. 1

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (!el) return
      el.style.transform  = `perspective(600px) rotateY(${dx * 10}deg) rotateX(${-dy * 7}deg) scale3d(1.02,1.02,1.02)`
      el.style.transition = "transform 0.05s linear"
    })
  }

  const handleMouseLeave = () => {
    cancelAnimationFrame(rafRef.current)
    const el = cardRef.current
    if (!el) return
    el.style.transform  = "perspective(600px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)"
    el.style.transition = "transform 0.4s ease"
  }

  return (
    <div
      ref={cardRef}
      id="member-card"
      className={`relative overflow-hidden select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width:           "100%",
        aspectRatio:     "1.585",
        background:      `linear-gradient(135deg, rgb(8 5 2) 0%, rgb(22 16 6) 60%, rgb(${hexToRgb(accent)} / 0.15) 100%)`,
        border:          `1px solid ${accent}30`,
        fontFamily:      "var(--font-ibm-plex-mono, monospace)",
        boxShadow:       `0 20px 80px rgb(0 0 0 / 0.5), 0 0 0 1px ${accent}20`,
        transformStyle:  "preserve-3d",
        willChange:      "transform",
      }}
    >
      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />

      {/* Decoração — arco no canto inferior direito */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)`, transform: "translate(30%, 30%)" }} />

      {/* ── Header ──────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "13px", color: accent, lineHeight: 1 }}>☀</span>
          <span className="uppercase tracking-[0.28em]" style={{ fontSize: "8px", color: "#ffffff99", letterSpacing: "0.25em" }}>
            Portal Solar
          </span>
        </div>
        <span style={{ fontSize: "6.5px", color: "#ffffff40", letterSpacing: "0.1em" }}>
          #{data.memberNum}
        </span>
      </div>

      {/* Linha tagline */}
      <div className="absolute top-8 left-0 right-0 px-5">
        <p style={{ fontSize: "5.5px", color: "#ffffff30", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Construindo Utopias · Ações de Paz
        </p>
      </div>

      {/* ── Avatar ──────────────────────────────────── */}
      <div className="absolute left-5" style={{ top: "50%", transform: "translateY(-50%)" }}>
        <div className="relative overflow-hidden rounded-full"
          style={{ width: 52, height: 52, border: `2px solid ${accent}60`, boxShadow: `0 0 20px ${accent}40` }}>
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" />
          ) : (
            <GenerativePlaceholder name={data.displayName} className="w-full h-full" />
          )}
        </div>
      </div>

      {/* ── Info do membro ──────────────────────────── */}
      <div className="absolute" style={{ left: 76, top: "50%", transform: "translateY(-50%)", right: 20 }}>
        <p className="font-bold leading-none mb-1"
          style={{ fontSize: "13px", color: "#ffffffdd", letterSpacing: "-0.01em", fontFamily: "var(--font-display, sans-serif)" }}>
          {data.displayName}
        </p>
        <p style={{ fontSize: "7px", color: accent + "aa", letterSpacing: "0.05em", marginBottom: 4 }}>
          @{data.username}
        </p>
        {data.bio && (
          <p className="line-clamp-2"
            style={{ fontSize: "6.5px", color: "#ffffff55", lineHeight: 1.5, maxWidth: 180 }}>
            {data.bio}
          </p>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 pb-3">
        <p style={{ fontSize: "6px", color: "#ffffff25", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Membro desde {data.since}
        </p>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: i < 3 ? accent + "80" : "#ffffff15" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper — hex → "r g b" para CSS
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "")
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

// ── Wrapper com ações — usado na página de perfil ─────────────────────────────

export function ProfileCardWidget({ data }: { data: CardData }) {
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/convite/${data.username}`
    : `/convite/${data.username}`

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrl])

  const print = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="space-y-4">
      {/* Card */}
      <div ref={cardRef} className="max-w-sm print:max-w-full">
        <MemberCard data={data} />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 print:hidden">
        <button
          onClick={copyLink}
          className="flex items-center gap-2 font-mono text-[7.5px] uppercase tracking-[0.2em] px-3 py-1.5 border transition-all duration-150"
          style={{
            border:  "1px solid rgb(var(--c-border) / 0.35)",
            color:   copied ? "rgb(var(--c-teal))" : "rgb(var(--c-text) / 0.7)",
            borderColor: copied ? "rgb(var(--c-teal) / 0.4)" : undefined,
          }}
        >
          {copied ? "✓ Link copiado!" : "Copiar link de convite"}
        </button>

        <button
          onClick={print}
          className="font-mono text-[7.5px] uppercase tracking-[0.2em] px-3 py-1.5 border transition-colors"
          style={{ border: "1px solid rgb(var(--c-border) / 0.25)", color: "rgb(var(--c-muted) / 0.6)" }}
        >
          Imprimir
        </button>
      </div>

      <p className="font-mono text-[6.5px] print:hidden" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
        Quem abrir o link verá seu cartão e uma mensagem de convite para a plataforma.
      </p>

      {/* CSS de impressão */}
      <style>{`
        @media print {
          body > *:not(.print-target) { display: none !important; }
          #member-card {
            width: 85.6mm !important;
            height: 54mm !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            aspect-ratio: unset !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  )
}

export { MemberCard }
