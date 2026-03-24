"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"

type UserToken = {
  id:          string
  tokenType:   string
  name:        string
  description: string | null
  imageUrl:    string | null
  rarity:      string
  isEquipped:  boolean
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#888", RARE: "#4A90D9", EPIC: "#9B59B6", LEGENDARY: "#C8A45A",
}

const RARITY_ORDER = ["LEGENDARY", "EPIC", "RARE", "COMMON"]

const TOKEN_EMOJI: Record<string, string> = {
  BADGE: "🏅", MONUMENT: "🗿", BONECO: "🤖", AVATAR: "👤", FRAME: "🖼", EFFECT: "✨",
}

export default function TokensPage() {
  const [tokens,  setTokens]  = useState<UserToken[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<string>("ALL")

  const load = useCallback(async () => {
    const res = await fetch("/api/social/tokens")
    if (res.ok) setTokens(await res.json() as UserToken[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const toggleEquip = async (t: UserToken) => {
    const next = !t.isEquipped
    setTokens((prev) => prev.map((x) => x.id === t.id ? { ...x, isEquipped: next } : x))
    await fetch("/api/social/tokens", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ tokenId: t.id, isEquipped: next }),
    })
  }

  const types = ["ALL", ...Array.from(new Set(tokens.map((t) => t.tokenType)))]

  const visible = tokens
    .filter((t) => filter === "ALL" || t.tokenType === filter)
    .sort((a, b) => {
      if (a.isEquipped !== b.isEquipped) return a.isEquipped ? -1 : 1
      return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
    })

  const equipped = tokens.filter((t) => t.isEquipped)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-solar-muted font-mono text-sm">Carregando…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b border-solar-border/40 pt-8 pb-5">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-2">
            <Link href="/social" className="hover:text-solar-muted transition-colors">Rede Solar</Link>
            {" · "}Tokens
          </p>
          <h1 className="font-display text-3xl font-semibold text-solar-text">Coleção</h1>
          <p className="text-xs text-solar-muted/50 mt-1">{tokens.length} tokens · {equipped.length} equipados</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Equipped showcase */}
        {equipped.length > 0 && (
          <div className="space-y-3">
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-solar-muted/40">Equipados</p>
            <div className="flex gap-2 flex-wrap">
              {equipped.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 border"
                  style={{
                    borderColor: `${RARITY_COLORS[t.rarity] ?? "#888"}40`,
                    background:  `${RARITY_COLORS[t.rarity] ?? "#888"}10`,
                  }}
                >
                  {t.imageUrl
                    ? <img src={t.imageUrl} alt={t.name} className="w-6 h-6 object-contain" />
                    : <span className="text-base">{TOKEN_EMOJI[t.tokenType] ?? "✦"}</span>
                  }
                  <span className="text-[10px] font-mono" style={{ color: RARITY_COLORS[t.rarity] }}>
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        {types.length > 2 && (
          <div className="flex gap-1 border-b border-solar-border/30">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-2 text-[9px] font-mono uppercase tracking-widest transition-colors border-b-2 -mb-px
                  ${filter === type
                    ? "border-solar-accent text-solar-accent"
                    : "border-transparent text-solar-muted/40 hover:text-solar-muted"
                  }`}
              >
                {type === "ALL" ? "Todos" : type.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {visible.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="font-mono text-[10px] text-solar-muted/40 uppercase tracking-widest">Nenhum token</p>
            <p className="text-sm text-solar-muted/50">
              Tokens são conquistados ao interagir na plataforma e recebidos de outros usuários.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {visible.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleEquip(t)}
              className={`aspect-square border flex flex-col items-center justify-center gap-1.5 p-3 transition-all group relative
                ${t.isEquipped ? "" : "opacity-70 hover:opacity-100"}`}
              style={{
                borderColor: `${RARITY_COLORS[t.rarity] ?? "#888"}${t.isEquipped ? "60" : "30"}`,
                background:  `${RARITY_COLORS[t.rarity] ?? "#888"}${t.isEquipped ? "15" : "08"}`,
                outline:     t.isEquipped ? `1px solid ${RARITY_COLORS[t.rarity] ?? "#888"}60` : undefined,
              }}
              title={t.isEquipped ? "Desequipar" : "Equipar"}
            >
              {t.isEquipped && (
                <span className="absolute top-1 right-1 text-[8px] font-mono" style={{ color: RARITY_COLORS[t.rarity] }}>✓</span>
              )}
              {t.imageUrl ? (
                <img src={t.imageUrl} alt={t.name} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-2xl">{TOKEN_EMOJI[t.tokenType] ?? "✦"}</span>
              )}
              <p className="text-[8px] font-mono text-center line-clamp-2 leading-tight" style={{ color: RARITY_COLORS[t.rarity] }}>
                {t.name}
              </p>
              <p className="text-[7px] font-mono text-solar-muted/30 uppercase">{t.rarity.toLowerCase()}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
