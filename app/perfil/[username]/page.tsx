"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

type UserProfile = {
  id:          string
  username:    string
  displayName: string
  bio:         string | null
  avatarUrl:   string | null
  accentColor: string
  createdAt:   string
  isFollowing: boolean
  _count:      { followers: number; following: number; interests: number; posts: number }
  interests:   Array<{
    id:        string
    rating:    number
    atlasItem: { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null }
  }>
  tokens: Array<{
    id:        string
    tokenType: string
    name:      string
    rarity:    string
    imageUrl:  string | null
  }>
  posts: Array<{
    id:        string
    content:   string
    type:      string
    createdAt: string
    atlasItem: { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null } | null
    _count:    { likes: number }
  }>
}

const AREA_COLORS: Record<string, string> = {
  ACADEMIA: "#C8A45A", ARTES: "#9B59B6", CULTURA: "#E91E63",
  OBRAS: "#3498DB", PESSOAS: "#2ECC71", STUDIO: "#E67E22",
  COMPUTACAO: "#1ABC9C", AULAS: "#F39C12", ATLAS: "#C8A45A",
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#888", RARE: "#4A90D9", EPIC: "#9B59B6", LEGENDARY: "#C8A45A",
}

export default function ProfilePage() {
  const { username } = useParams() as { username: string }
  const router        = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [me,      setMe]      = useState<{ username: string } | null>(null)
  const [tab,     setTab]     = useState<"posts" | "interesses" | "tokens">("posts")
  const [followLoading, setFollowLoading] = useState(false)

  const loadProfile = useCallback(async () => {
    const res = await fetch(`/api/social/profile/${username}`)
    if (!res.ok) { router.push("/social"); return }
    setProfile(await res.json() as UserProfile)
    setLoading(false)
  }, [username, router])

  useEffect(() => {
    loadProfile()
    fetch("/api/auth/me").then((r) => r.json()).then((d: { username?: string }) => {
      if (d.username) setMe({ username: d.username })
    })
  }, [loadProfile])

  const handleFollow = async () => {
    if (!profile) return
    setFollowLoading(true)
    const res = await fetch("/api/social/follow", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        targetUserId: profile.id,
        action:       profile.isFollowing ? "unfollow" : "follow",
      }),
    })
    if (res.ok) {
      setProfile((p) => p ? {
        ...p,
        isFollowing: !p.isFollowing,
        _count: {
          ...p._count,
          followers: p._count.followers + (p.isFollowing ? -1 : 1),
        },
      } : p)
    }
    setFollowLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-solar-muted font-mono text-sm">Carregando…</div>
      </div>
    )
  }

  if (!profile) return null

  const isOwnProfile = me?.username === profile.username

  return (
    <div className="min-h-screen pb-24">
      {/* Header / Banner */}
      <div
        className="h-32 relative"
        style={{ background: `linear-gradient(135deg, ${profile.accentColor}20, ${profile.accentColor}05)` }}
      >
        <div
          className="absolute inset-0"
          style={{ borderBottom: `1px solid ${profile.accentColor}20` }}
        />
      </div>

      {/* Avatar + info */}
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <div className="relative -mt-12 mb-6 flex items-end justify-between">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden"
            style={{
              borderColor: profile.accentColor,
              background:  `${profile.accentColor}20`,
            }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-3xl font-bold" style={{ color: profile.accentColor }}>
                {profile.displayName[0]?.toUpperCase()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-2">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="px-4 py-1.5 border text-[10px] font-mono uppercase tracking-widest transition-colors"
                style={{ borderColor: `${profile.accentColor}40`, color: profile.accentColor }}
              >
                Editar perfil
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all disabled:opacity-50"
                style={{
                  background:  profile.isFollowing ? `${profile.accentColor}15` : profile.accentColor,
                  color:       profile.isFollowing ? profile.accentColor : "#08080C",
                  border:      `1px solid ${profile.accentColor}`,
                }}
              >
                {profile.isFollowing ? "Seguindo" : "Seguir"}
              </button>
            )}
          </div>
        </div>

        {/* Nome e bio */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-solar-text">{profile.displayName}</h1>
          <p className="font-mono text-[10px] text-solar-muted/60 mb-2">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-solar-muted/80 leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 font-mono text-[10px]">
          {[
            { label: "posts",     value: profile._count.posts },
            { label: "seguidores", value: profile._count.followers },
            { label: "seguindo",  value: profile._count.following },
            { label: "interesses", value: profile._count.interests },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-solar-text">{s.value}</div>
              <div className="text-solar-muted/50 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-solar-border/30">
          {(["posts", "interesses", "tokens"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors border-b-2 -mb-px
                ${tab === t
                  ? "border-solar-accent text-solar-accent"
                  : "border-transparent text-solar-muted/40 hover:text-solar-muted"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Posts */}
        {tab === "posts" && (
          <div className="space-y-4">
            {profile.posts.length === 0 && (
              <p className="font-mono text-[10px] text-solar-muted/40 text-center py-12">Nenhum post ainda</p>
            )}
            {profile.posts.map((post) => (
              <div
                key={post.id}
                className="p-4 border border-solar-border/30 bg-solar-surface/30 space-y-3"
                style={{ borderLeft: `2px solid ${profile.accentColor}40` }}
              >
                {post.atlasItem && (
                  <Link
                    href={`/atlas/${post.atlasItem.slug ?? post.atlasItem.id}`}
                    className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest hover:opacity-80 transition-opacity"
                    style={{ color: AREA_COLORS[post.atlasItem.area] ?? "#C8A45A" }}
                  >
                    <span>{post.atlasItem.area}</span>
                    <span className="text-solar-muted/40">·</span>
                    <span className="text-solar-text/60 normal-case tracking-normal">{post.atlasItem.title}</span>
                  </Link>
                )}
                <p className="text-sm text-solar-text/80 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-3 text-[8px] font-mono text-solar-muted/30">
                  <span>{post._count.likes} curtidas</span>
                  <span>{new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interesses */}
        {tab === "interesses" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.interests.length === 0 && (
              <p className="col-span-full font-mono text-[10px] text-solar-muted/40 text-center py-12">
                Nenhum interesse adicionado
              </p>
            )}
            {profile.interests.map((i) => (
              <Link
                key={i.id}
                href={`/atlas/${i.atlasItem.slug ?? i.atlasItem.id}`}
                className="p-3 border border-solar-border/30 bg-solar-surface/30 hover:border-solar-accent/40 transition-colors group"
              >
                {i.atlasItem.coverImage && (
                  <div className="aspect-[3/2] overflow-hidden mb-2">
                    <img
                      src={i.atlasItem.coverImage}
                      alt={i.atlasItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <p className="text-[9px] font-mono uppercase tracking-widest mb-1"
                   style={{ color: AREA_COLORS[i.atlasItem.area] ?? "#C8A45A" }}>
                  {i.atlasItem.area}
                </p>
                <p className="text-xs text-solar-text/80 line-clamp-2">{i.atlasItem.title}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span
                      key={idx}
                      className="text-[8px]"
                      style={{ color: idx < i.rating ? profile.accentColor : "#333" }}
                    >★</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tokens */}
        {tab === "tokens" && (
          <div className="space-y-4">
            {isOwnProfile && (
              <div className="flex justify-end">
                <Link
                  href="/social/tokens"
                  className="text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 border border-solar-border/30 text-solar-muted/50 hover:text-solar-accent hover:border-solar-accent/30 transition-colors"
                >
                  Gerenciar coleção →
                </Link>
              </div>
            )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {profile.tokens.length === 0 && (
              <p className="col-span-full font-mono text-[10px] text-solar-muted/40 text-center py-12">
                Nenhum token equipado
              </p>
            )}
            {profile.tokens.map((t) => (
              <div
                key={t.id}
                className="aspect-square border flex flex-col items-center justify-center gap-1 p-2"
                style={{
                  borderColor: `${RARITY_COLORS[t.rarity] ?? "#888"}40`,
                  background:  `${RARITY_COLORS[t.rarity] ?? "#888"}08`,
                }}
              >
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt={t.name} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                       style={{ background: `${RARITY_COLORS[t.rarity] ?? "#888"}20` }}>
                    {t.tokenType === "BADGE" ? "🏅" : t.tokenType === "MONUMENT" ? "🗿" : t.tokenType === "BONECO" ? "🤖" : "✦"}
                  </div>
                )}
                <p className="text-[8px] font-mono text-center line-clamp-1" style={{ color: RARITY_COLORS[t.rarity] }}>
                  {t.name}
                </p>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>
    </div>
  )
}
