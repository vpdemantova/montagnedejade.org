"use client"

import { useEffect, useState, useCallback }  from "react"
import { useParams, useRouter }              from "next/navigation"
import Link                                  from "next/link"
import Image                                 from "next/image"

// ── Tipos ─────────────────────────────────────────────────────────────────────

type UserProfile = {
  id:          string
  username:    string
  displayName: string
  bio:         string | null
  avatarUrl:   string | null
  accentColor: string
  createdAt:   string
  isFollowing: boolean
  invitedBy:   { username: string; displayName: string; accentColor: string } | null
  userTags:    Array<{ tag: string }>
  _count:      { followers: number; following: number; interests: number; posts: number }
  interests:   Array<{
    id: string; rating: number
    atlasItem: { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null }
  }>
  tokens: Array<{ id: string; tokenType: string; name: string; rarity: string; imageUrl: string | null }>
  posts:  Array<{
    id: string; content: string; type: string; createdAt: string
    atlasItem: { id: string; slug: string | null; title: string; type: string; area: string; coverImage: string | null } | null
    _count: { likes: number }
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Banner */}
      <div className="h-32" style={{ background: "rgb(var(--c-deep) / 0.6)" }} />

      <div className="page-narrow">
        {/* Avatar + button */}
        <div className="relative -mt-12 mb-6 flex items-end justify-between">
          <div className="w-24 h-24 rounded-full" style={{ background: "rgb(var(--c-deep))" }} />
          <div className="w-20 h-7 mb-2" style={{ background: "rgb(var(--c-deep))" }} />
        </div>

        {/* Name */}
        <div className="mb-6 space-y-2">
          <div className="h-8 w-48" style={{ background: "rgb(var(--c-deep))" }} />
          <div className="h-3 w-24" style={{ background: "rgb(var(--c-deep) / 0.6)" }} />
          <div className="h-3 w-64 mt-2" style={{ background: "rgb(var(--c-deep) / 0.4)" }} />
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-5 w-8 mx-auto" style={{ background: "rgb(var(--c-deep))" }} />
              <div className="h-2 w-12 mx-auto" style={{ background: "rgb(var(--c-deep) / 0.4)" }} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-solar-border/20 mb-6">
          {[1,2,3].map((i) => (
            <div key={i} className="h-8 w-20" style={{ background: "rgb(var(--c-deep) / 0.4)" }} />
          ))}
        </div>

        {/* Posts skeleton */}
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20" style={{ background: "rgb(var(--c-deep) / 0.3)", borderLeft: "2px solid rgb(var(--c-deep))" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { username }    = useParams() as { username: string }
  const router          = useRouter()
  const [profile,       setProfile]       = useState<UserProfile | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [myUsername,    setMyUsername]    = useState<string | null>(null)
  const [tab,           setTab]           = useState<"posts" | "interesses" | "tokens">("posts")
  const [followLoading, setFollowLoading] = useState(false)

  const loadProfile = useCallback(async () => {
    // Fetches paralelos: perfil + auth (eram sequenciais antes)
    const [profileRes, meRes] = await Promise.all([
      fetch(`/api/social/profile/${username}`),
      fetch("/api/auth/me"),
    ])

    if (!profileRes.ok) { router.push("/social"); return }

    const [profileData, meData] = await Promise.all([
      profileRes.json() as Promise<UserProfile>,
      meRes.ok ? meRes.json() as Promise<{ username: string }> : Promise.resolve(null),
    ])

    setProfile(profileData)
    if (meData) setMyUsername(meData.username)
    setLoading(false)
  }, [username, router])

  useEffect(() => { void loadProfile() }, [loadProfile])

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
        _count: { ...p._count, followers: p._count.followers + (p.isFollowing ? -1 : 1) },
      } : p)
    }
    setFollowLoading(false)
  }

  // Skeleton enquanto carrega — a estrutura já é visível, sem tela em branco
  if (loading) return <ProfileSkeleton />
  if (!profile) return null

  const isOwnProfile = myUsername === profile.username
  const accent       = profile.accentColor

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-32 relative"
        style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}05)` }}>
        <div className="absolute inset-0" style={{ borderBottom: `1px solid ${accent}20` }} />
      </div>

      <div className="page-narrow">
        {/* Avatar + botão */}
        <div className="relative -mt-12 mb-6 flex items-end justify-between">
          <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center overflow-hidden relative"
            style={{ borderColor: accent, background: `${accent}20` }}>
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt={profile.displayName} fill className="object-cover" unoptimized />
            ) : (
              <span className="font-display text-3xl font-bold" style={{ color: accent }}>
                {profile.displayName[0]?.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-2 flex-wrap">
            {isOwnProfile ? (
              <>
                <Link href="/settings" className="btn btn-ghost btn-sm">Editar perfil</Link>
                <Link href="/social/mensagens" className="btn btn-ghost btn-sm">✉ Mensagens</Link>
              </>
            ) : (
              <>
                <button onClick={() => void handleFollow()} disabled={followLoading}
                  className={`btn btn-sm ${profile.isFollowing ? "btn-ghost" : "btn-solid"}`}>
                  {profile.isFollowing ? "Seguindo" : "Seguir"}
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/social/conversations", {
                      method:  "POST",
                      headers: { "Content-Type": "application/json" },
                      body:    JSON.stringify({ participantIds: [profile.id] }),
                    })
                    if (res.ok) {
                      const conv = await res.json() as { id: string }
                      window.location.href = `/social/mensagens/${conv.id}`
                    }
                  }}
                  className="btn btn-ghost btn-sm"
                  title="Enviar mensagem"
                >
                  ✉ Mensagem
                </button>
              </>
            )}
          </div>
        </div>

        {/* Nome + bio + tags */}
        <div className="mb-6">
          <h1 className="page-title">{profile.displayName}</h1>
          <p className="font-mono text-[10px] text-solar-muted/60 mb-2">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-solar-muted/80 leading-relaxed mb-2">{profile.bio}</p>
          )}
          {profile.invitedBy && (
            <p className="font-mono text-[8px] mb-3" style={{ color: "rgb(var(--c-muted) / 0.45)" }}>
              Convidado por{" "}
              <a href={`/perfil/${profile.invitedBy.username}`} className="hover:opacity-80 transition-opacity"
                style={{ color: profile.invitedBy.accentColor }}>
                @{profile.invitedBy.username}
              </a>
            </p>
          )}
          {profile.userTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.userTags.map(({ tag }) => (
                <span key={tag} className="font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 border"
                  style={{ borderColor: `${accent}35`, color: `${accent}cc`, background: `${accent}08` }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 font-mono text-[10px]">
          {[
            { label: "posts",      value: profile._count.posts     },
            { label: "seguidores", value: profile._count.followers  },
            { label: "seguindo",   value: profile._count.following  },
            { label: "interesses", value: profile._count.interests  },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-bold text-solar-text">{s.value}</div>
              <div className="text-solar-muted/50 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-bar mb-6">
          {(["posts", "interesses", "tokens"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="tab"
              data-active={tab === t ? "true" : undefined}>{t}</button>
          ))}
        </div>

        {/* Posts */}
        {tab === "posts" && (
          <div className="space-y-4 pb-8">
            {profile.posts.length === 0 && (
              <p className="font-mono text-[10px] text-solar-muted/40 text-center py-12">Nenhum post ainda</p>
            )}
            {profile.posts.map((post) => (
              <div key={post.id} className="p-4 border border-solar-border/30 bg-solar-surface/30 space-y-3"
                style={{ borderLeft: `2px solid ${accent}40` }}>
                {post.atlasItem && (
                  <Link href={`/atlas/${post.atlasItem.slug ?? post.atlasItem.id}`}
                    className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest hover:opacity-80 transition-opacity"
                    style={{ color: AREA_COLORS[post.atlasItem.area] ?? "#C8A45A" }}>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-8">
            {profile.interests.length === 0 && (
              <p className="col-span-full font-mono text-[10px] text-solar-muted/40 text-center py-12">
                Nenhum interesse adicionado
              </p>
            )}
            {profile.interests.map((i) => (
              <Link key={i.id} href={`/atlas/${i.atlasItem.slug ?? i.atlasItem.id}`}
                className="p-3 border border-solar-border/30 bg-solar-surface/30 hover:border-solar-accent/40 transition-colors group">
                {i.atlasItem.coverImage && (
                  <div className="aspect-[3/2] overflow-hidden mb-2 relative">
                    <Image src={i.atlasItem.coverImage} alt={i.atlasItem.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                  </div>
                )}
                <p className="text-[9px] font-mono uppercase tracking-widest mb-1"
                  style={{ color: AREA_COLORS[i.atlasItem.area] ?? "#C8A45A" }}>{i.atlasItem.area}</p>
                <p className="text-xs text-solar-text/80 line-clamp-2">{i.atlasItem.title}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span key={idx} className="text-[8px]"
                      style={{ color: idx < i.rating ? accent : "#333" }}>★</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tokens */}
        {tab === "tokens" && (
          <div className="space-y-4 pb-8">
            {isOwnProfile && (
              <div className="flex justify-end">
                <Link href="/social/tokens"
                  className="text-[9px] font-mono uppercase tracking-widest py-1.5 border border-solar-border/30 text-solar-muted/50 hover:text-solar-accent hover:border-solar-accent/30 transition-colors">
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
                <div key={t.id} className="aspect-square border flex flex-col items-center justify-center gap-1 p-2"
                  style={{
                    borderColor: `${RARITY_COLORS[t.rarity] ?? "#888"}40`,
                    background:  `${RARITY_COLORS[t.rarity] ?? "#888"}08`,
                  }}>
                  {t.imageUrl ? (
                    <Image src={t.imageUrl} alt={t.name} width={48} height={48} className="object-contain" unoptimized />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ background: `${RARITY_COLORS[t.rarity] ?? "#888"}20` }}>
                      {t.tokenType === "BADGE" ? "🏅" : t.tokenType === "MONUMENT" ? "🗿" : t.tokenType === "BONECO" ? "🤖" : "✦"}
                    </div>
                  )}
                  <p className="text-[8px] font-mono text-center line-clamp-1"
                    style={{ color: RARITY_COLORS[t.rarity] }}>{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
