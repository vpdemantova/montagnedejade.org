"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

type UserToken = {
  id: string; tokenType: string; name: string
  imageUrl: string | null; rarity: string; isEquipped: boolean
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#666", RARE: "#4A90D9", EPIC: "#9B59B6", LEGENDARY: "#C8A45A",
}
const TOKEN_EMOJI: Record<string, string> = {
  BADGE: "🏅", MONUMENT: "🗿", BONECO: "🤖", AVATAR: "👤", FRAME: "🖼", EFFECT: "✨",
}

type Post = {
  id:        string
  content:   string
  type:      string
  createdAt: string
  author:    { id: string; username: string; displayName: string; avatarUrl: string | null; accentColor: string }
  atlasItem: { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null } | null
  _count:    { likes: number }
}

type MatchUser = {
  id:              string
  username:        string
  displayName:     string
  avatarUrl:       string | null
  accentColor:     string
  bio:             string | null
  commonInterests: number
  _count:          { followers: number; interests: number }
}

type Me = {
  id:          string
  username:    string
  displayName: string
  avatarUrl:   string | null
  accentColor: string
}

const AREA_COLORS: Record<string, string> = {
  ACADEMIA: "#C8A45A", ARTES: "#9B59B6", CULTURA: "#E91E63",
  OBRAS: "#3498DB", PESSOAS: "#2ECC71", STUDIO: "#E67E22",
  COMPUTACAO: "#1ABC9C", AULAS: "#F39C12", ATLAS: "#C8A45A",
}

export default function SocialPage() {
  const [feed,      setFeed]      = useState<Post[]>([])
  const [matches,   setMatches]   = useState<MatchUser[]>([])
  const [me,        setMe]        = useState<Me | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [posting,   setPosting]   = useState(false)
  const [postText,  setPostText]  = useState("")
  const [tab,       setTab]       = useState<"feed" | "descobrir" | "tokens">("feed")
  const [tokens,    setTokens]    = useState<UserToken[]>([])
  const [tokensLoaded, setTokensLoaded] = useState(false)

  const loadData = useCallback(async () => {
    const [feedRes, matchRes, meRes] = await Promise.all([
      fetch("/api/social/feed"),
      fetch("/api/social/match"),
      fetch("/api/auth/me"),
    ])
    const [feedData, matchData, meData] = await Promise.all([
      feedRes.json() as Promise<{ posts: Post[] }>,
      matchRes.json() as Promise<MatchUser[]>,
      meRes.json() as Promise<Me>,
    ])
    setFeed(feedData.posts ?? [])
    setMatches(Array.isArray(matchData) ? matchData : [])
    if (meData.id) setMe(meData)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (tab === "tokens" && !tokensLoaded) {
      fetch("/api/social/tokens").then((r) => r.ok ? r.json() : []).then((data: UserToken[]) => {
        setTokens(Array.isArray(data) ? data : [])
        setTokensLoaded(true)
      })
    }
  }, [tab, tokensLoaded])

  const toggleEquip = async (t: UserToken) => {
    const next = !t.isEquipped
    setTokens((prev) => prev.map((x) => x.id === t.id ? { ...x, isEquipped: next } : x))
    await fetch("/api/social/tokens", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: t.id, isEquipped: next }),
    })
  }

  const handlePost = async () => {
    if (!postText.trim()) return
    setPosting(true)
    const res = await fetch("/api/social/feed", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content: postText }),
    })
    if (res.ok) {
      const newPost = await res.json() as Post
      setFeed((prev) => [newPost, ...prev])
      setPostText("")
    }
    setPosting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-solar-muted font-mono text-sm">Carregando…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="page-header border-b border-solar-border/40 pt-8 pb-5">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/40 mb-2">
            Portal Solar · Social
          </p>
          <h1 className="font-display text-3xl font-semibold text-solar-text">Rede Solar</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Compose */}
        {me && (
          <div className="border border-solar-border/30 bg-solar-surface/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Link href={`/perfil/${me.username}`}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold overflow-hidden relative"
                  style={{ background: `${me.accentColor}25`, color: me.accentColor }}
                >
                  {me.avatarUrl
                    ? <Image src={me.avatarUrl} alt="" fill className="rounded-full object-cover" unoptimized />
                    : me.displayName[0]?.toUpperCase()}
                </div>
              </Link>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Compartilhe uma descoberta, recomendação ou pensamento…"
                rows={3}
                className="flex-1 bg-transparent text-sm text-solar-text/80 placeholder:text-solar-muted/30 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={posting || !postText.trim()}
                className="px-5 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all disabled:opacity-30"
                style={{
                  background:  "rgb(var(--c-accent) / 0.15)",
                  color:       "rgb(var(--c-accent))",
                  border:      "1px solid rgb(var(--c-accent) / 0.3)",
                }}
              >
                {posting ? "Publicando…" : "Publicar →"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-solar-border/30">
          {([
            { key: "feed",      label: "Feed"           },
            { key: "descobrir", label: "Descobrir"      },
            { key: "tokens",    label: "Minha coleção"  },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors border-b-2 -mb-px
                ${tab === t.key
                  ? "border-solar-accent text-solar-accent"
                  : "border-transparent text-solar-muted/40 hover:text-solar-muted"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {tab === "feed" && (
          <div className="space-y-4">
            {feed.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="font-mono text-[10px] text-solar-muted/40 uppercase tracking-widest">Feed vazio</p>
                <p className="text-sm text-solar-muted/50">
                  Siga pessoas para ver o feed, ou explore a aba{" "}
                  <button onClick={() => setTab("descobrir")} className="text-solar-accent hover:underline">
                    Descobrir
                  </button>
                </p>
              </div>
            )}
            {feed.map((post) => (
              <div
                key={post.id}
                className="p-4 border border-solar-border/20 bg-solar-surface/20 space-y-3"
              >
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Link href={`/perfil/${post.author.username}`}>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden relative"
                      style={{ background: `${post.author.accentColor}25`, color: post.author.accentColor }}
                    >
                      {post.author.avatarUrl
                        ? <Image src={post.author.avatarUrl} alt="" fill className="rounded-full object-cover" unoptimized />
                        : post.author.displayName[0]?.toUpperCase()}
                    </div>
                  </Link>
                  <div>
                    <Link href={`/perfil/${post.author.username}`} className="text-sm font-medium text-solar-text hover:opacity-80">
                      {post.author.displayName}
                    </Link>
                    <p className="text-[9px] font-mono text-solar-muted/40">
                      @{post.author.username} · {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                {/* Atlas item */}
                {post.atlasItem && (
                  <Link
                    href={`/atlas/${post.atlasItem.slug ?? post.atlasItem.id}`}
                    className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest hover:opacity-80"
                    style={{ color: AREA_COLORS[post.atlasItem.area] ?? "#C8A45A" }}
                  >
                    <span>{post.atlasItem.area}</span>
                    <span className="text-solar-muted/30">·</span>
                    <span className="text-solar-text/50 normal-case tracking-normal text-[10px]">{post.atlasItem.title}</span>
                  </Link>
                )}

                <p className="text-sm text-solar-text/80 leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-4 text-[8px] font-mono text-solar-muted/30">
                  <span>{post._count.likes} curtidas</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Descobrir */}
        {tab === "descobrir" && (
          <div className="space-y-3">
            {matches.length === 0 && (
              <div className="text-center py-16 space-y-3">
                <p className="font-mono text-[10px] text-solar-muted/40 uppercase tracking-widest">Ninguém encontrado</p>
                <p className="text-sm text-solar-muted/50">
                  Adicione interesses no seu perfil para encontrar pessoas com gostos semelhantes.
                </p>
                {me && (
                  <Link
                    href={`/perfil/${me.username}`}
                    className="inline-block mt-2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-solar-accent/30 text-solar-accent hover:bg-solar-accent/10 transition-colors"
                  >
                    Meu perfil →
                  </Link>
                )}
              </div>
            )}
            {matches.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-4 p-4 border border-solar-border/20 bg-solar-surface/20 hover:border-solar-border/40 transition-colors"
              >
                <Link href={`/perfil/${u.username}`}>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden relative"
                    style={{ background: `${u.accentColor}25`, color: u.accentColor }}
                  >
                    {u.avatarUrl
                      ? <Image src={u.avatarUrl} alt="" fill className="rounded-full object-cover" unoptimized />
                      : u.displayName[0]?.toUpperCase()}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/perfil/${u.username}`} className="font-medium text-solar-text hover:opacity-80">
                    {u.displayName}
                  </Link>
                  <p className="text-[9px] font-mono text-solar-muted/40">@{u.username}</p>
                  {u.bio && <p className="text-xs text-solar-muted/60 mt-0.5 line-clamp-1">{u.bio}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-[9px] font-mono px-2 py-1"
                    style={{ background: `${u.accentColor}15`, color: u.accentColor }}
                  >
                    {u.commonInterests} em comum
                  </div>
                  <p className="text-[8px] font-mono text-solar-muted/30 mt-1">{u._count.followers} seguidores</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tokens */}
        {tab === "tokens" && (
          <div className="space-y-4">
            {me && (
              <div className="flex justify-end">
                <Link href={`/perfil/${me.username}`} className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/40 hover:text-solar-accent transition-colors">
                  Ver meu perfil →
                </Link>
              </div>
            )}
            {tokens.length === 0 && tokensLoaded && (
              <div className="text-center py-16 space-y-2">
                <p className="font-mono text-[10px] text-solar-muted/40 uppercase tracking-widest">Nenhum token ainda</p>
                <p className="text-sm text-solar-muted/40">Tokens são conquistados ao interagir na plataforma.</p>
              </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {tokens.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggleEquip(t)}
                  title={t.isEquipped ? "Desequipar" : "Equipar"}
                  className={`aspect-square border flex flex-col items-center justify-center gap-1.5 p-2 transition-all ${t.isEquipped ? "" : "opacity-60 hover:opacity-90"}`}
                  style={{
                    borderColor: `${RARITY_COLORS[t.rarity] ?? "#666"}${t.isEquipped ? "60" : "25"}`,
                    background:  `${RARITY_COLORS[t.rarity] ?? "#666"}${t.isEquipped ? "15" : "08"}`,
                    outline: t.isEquipped ? `1px solid ${RARITY_COLORS[t.rarity] ?? "#666"}40` : undefined,
                  }}
                >
                  {t.isEquipped && <span className="absolute top-1 right-1 text-[7px]" style={{ color: RARITY_COLORS[t.rarity] }}>✓</span>}
                  {t.imageUrl
                    ? <Image src={t.imageUrl} alt={t.name} width={32} height={32} className="object-contain" unoptimized />
                    : <span className="text-xl">{TOKEN_EMOJI[t.tokenType] ?? "✦"}</span>
                  }
                  <p className="text-[7px] font-mono text-center line-clamp-1" style={{ color: RARITY_COLORS[t.rarity] }}>{t.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
