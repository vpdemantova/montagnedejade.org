"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"

type UserToken = {
  id: string; tokenType: string; name: string
  imageUrl: string | null; rarity: string; isEquipped: boolean
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
  liked?:    boolean
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

type MemberUser = {
  id:          string
  username:    string
  displayName: string
  bio:         string | null
  avatarUrl:   string | null
  accentColor: string
  createdAt:   string
  _count:      { followers: number; posts: number; interests: number }
}

// Area labels for posts — use monochrome accent instead of per-area colors
const AREA_LABELS_MAP: Record<string, string> = {
  ACADEMIA: "Academia", ARTES: "Artes", CULTURA: "Cultura",
  OBRAS: "Obras", PESSOAS: "Pessoas", STUDIO: "Studio",
  COMPUTACAO: "Computação", AULAS: "Aulas", ATLAS: "Atlas",
  COMPASS: "Compass",
}

export default function SocialPage() {
  const [feed,         setFeed]         = useState<Post[]>([])
  const [nextCursor,   setNextCursor]   = useState<string | null>(null)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [matches,      setMatches]      = useState<MatchUser[]>([])
  const [me,           setMe]           = useState<Me | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [posting,      setPosting]      = useState(false)
  const [postText,     setPostText]     = useState("")
  const [tab,          setTab]          = useState<"feed" | "descobrir" | "tokens" | "comunidade">("feed")
  const [tokens,       setTokens]       = useState<UserToken[]>([])
  const [tokensLoaded, setTokensLoaded] = useState(false)
  const [members,      setMembers]      = useState<MemberUser[]>([])
  const [membersLoaded,setMembersLoaded] = useState(false)
  const [likingIds,    setLikingIds]    = useState<Set<string>>(new Set())

  const loadData = useCallback(async () => {
    const [feedRes, matchRes, meRes] = await Promise.all([
      fetch("/api/social/feed?limit=20"),
      fetch("/api/social/match"),
      fetch("/api/auth/me"),
    ])
    const [feedData, matchData, meData] = await Promise.all([
      feedRes.json() as Promise<{ posts: Post[]; nextCursor: string | null }>,
      matchRes.json() as Promise<MatchUser[]>,
      meRes.json() as Promise<Me>,
    ])
    setFeed(feedData.posts ?? [])
    setNextCursor(feedData.nextCursor ?? null)
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

  useEffect(() => {
    if (tab === "comunidade" && !membersLoaded) {
      fetch("/api/social/members?limit=100")
        .then((r) => r.ok ? r.json() : { users: [] })
        .then((data: { users: MemberUser[] }) => {
          setMembers(data.users ?? [])
          setMembersLoaded(true)
        })
    }
  }, [tab, membersLoaded])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    const res  = await fetch(`/api/social/feed?limit=20&cursor=${nextCursor}`)
    const data = await res.json() as { posts: Post[]; nextCursor: string | null }
    setFeed((prev) => [...prev, ...(data.posts ?? [])])
    setNextCursor(data.nextCursor ?? null)
    setLoadingMore(false)
  }

  const toggleLike = async (post: Post) => {
    if (likingIds.has(post.id)) return
    setLikingIds((s) => new Set(s).add(post.id))

    // Optimistic update
    const wasLiked = post.liked ?? false
    setFeed((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, liked: !wasLiked, _count: { likes: p._count.likes + (wasLiked ? -1 : 1) } }
          : p,
      ),
    )

    try {
      await fetch(`/api/social/feed/${post.id}/like`, { method: "POST" })
    } catch {
      // revert on error
      setFeed((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked: wasLiked, _count: { likes: p._count.likes + (wasLiked ? 1 : -1) } }
            : p,
        ),
      )
    } finally {
      setLikingIds((s) => { const next = new Set(s); next.delete(post.id); return next })
    }
  }

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
      <header className="ph">
        <div className="page-narrow">
          <p className="page-label mb-3">Portal Solar · Rede</p>
          <h1 className="page-hero text-solar-text leading-none">REDE<br/>SOLAR</h1>
        </div>
      </header>

      <div className="page-narrow py-6 space-y-6">

        {/* Compose */}
        {me && (
          <div className="border border-solar-border/30 bg-solar-surface/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Link href={`/perfil/${me.username}`}>
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0 text-sm font-bold overflow-hidden relative border border-solar-border/25"
                  style={{ background: `${me.accentColor}25`, color: me.accentColor }}
                >
                  {me.avatarUrl
                    ? <Image src={me.avatarUrl} alt="" fill className="object-cover" unoptimized />
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
              <button onClick={handlePost} disabled={posting || !postText.trim()} className="btn btn-primary btn-sm">
                {posting ? "Publicando…" : "Publicar →"}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar scrollbar-hide">
          {([
            { key: "feed",       label: "Feed"           },
            { key: "comunidade", label: "Comunidade"     },
            { key: "descobrir",  label: "Descobrir"      },
            { key: "tokens",     label: "Minha coleção"  },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="tab"
              data-active={tab === t.key ? "true" : undefined}>
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
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden relative border border-solar-border/20"
                      style={{ background: `${post.author.accentColor}25`, color: post.author.accentColor }}
                    >
                      {post.author.avatarUrl
                        ? <Image src={post.author.avatarUrl} alt="" fill className="object-cover" unoptimized />
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
                    className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-solar-accent/60 hover:text-solar-accent transition-colors"
                  >
                    <span>{AREA_LABELS_MAP[post.atlasItem.area] ?? post.atlasItem.area}</span>
                    <span className="text-solar-muted/20">·</span>
                    <span className="text-solar-text/50 normal-case tracking-normal text-[10px]">{post.atlasItem.title}</span>
                  </Link>
                )}

                <p className="text-sm text-solar-text/80 leading-relaxed">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-1">
                  {me && (
                    <button
                      onClick={() => toggleLike(post)}
                      disabled={likingIds.has(post.id)}
                      className={`flex items-center gap-1.5 text-[9px] font-mono transition-all disabled:opacity-40 ${
                        post.liked
                          ? "text-solar-accent"
                          : "text-solar-muted/35 hover:text-solar-muted"
                      }`}
                    >
                      <span>{post.liked ? "♥" : "♡"}</span>
                      <span>{post._count.likes}</span>
                    </button>
                  )}
                  {!me && (
                    <span className="text-[8px] font-mono text-solar-muted/30">{post._count.likes} curtidas</span>
                  )}
                </div>
              </div>
            ))}

            {/* Load more */}
            {nextCursor && (
              <div className="pt-2 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 border border-solar-border/30 text-[9px] font-mono uppercase tracking-widest text-solar-muted/50 hover:text-solar-text hover:border-solar-border/60 transition-all disabled:opacity-40"
                >
                  {loadingMore ? "Carregando…" : "Carregar mais →"}
                </button>
              </div>
            )}
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
                    className="inline-block mt-2 py-2 text-[10px] font-mono uppercase tracking-widest border border-solar-accent/30 text-solar-accent hover:bg-solar-accent/10 transition-colors"
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
                    className="w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden relative border border-solar-border/20"
                    style={{ background: `${u.accentColor}25`, color: u.accentColor }}
                  >
                    {u.avatarUrl
                      ? <Image src={u.avatarUrl} alt="" fill className="object-cover" unoptimized />
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
                  <div className="text-[9px] font-mono py-1 border border-solar-border/25 text-solar-muted/50">
                    {u.commonInterests} em comum
                  </div>
                  <p className="text-[8px] font-mono text-solar-muted/30 mt-1">{u._count.followers} seguidores</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comunidade — todos os perfis registrados */}
        {tab === "comunidade" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[7.5px] uppercase tracking-[0.3em]" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
                {members.length} {members.length === 1 ? "membro" : "membros"} · Portal Solar
              </p>
            </div>

            {!membersLoaded && (
              <p className="font-mono text-[8px] animate-pulse" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>Carregando membros…</p>
            )}

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {members.map((u) => (
                <Link
                  key={u.id}
                  href={`/perfil/${u.username}`}
                  className="group flex flex-col overflow-hidden transition-all duration-150 hover:scale-[1.01]"
                  style={{ border: "1px solid rgb(var(--c-border) / 0.2)", background: "rgb(var(--c-deep))" }}
                >
                  {/* Topo colorido com avatar */}
                  <div className="relative h-16" style={{ background: `linear-gradient(135deg, ${u.accentColor}22, ${u.accentColor}08)` }}>
                    <div
                      className="absolute bottom-0 left-4 translate-y-1/2 w-10 h-10 rounded-full overflow-hidden"
                      style={{ border: `2px solid ${u.accentColor}50`, background: "rgb(var(--c-deep))" }}
                    >
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" />
                        : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-sm"
                            style={{ background: `${u.accentColor}30`, color: u.accentColor }}>
                            {u.displayName[0]?.toUpperCase()}
                          </div>
                        )
                      }
                    </div>
                    {/* Acento */}
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full" style={{ background: u.accentColor }} />
                  </div>

                  {/* Info */}
                  <div className="px-4 pt-7 pb-4">
                    <p className="font-display text-[13px] leading-tight group-hover:opacity-80 transition-opacity" style={{ color: "rgb(var(--c-text) / 0.88)" }}>
                      {u.displayName}
                    </p>
                    <p className="font-mono text-[7.5px] mb-2" style={{ color: u.accentColor + "99" }}>
                      @{u.username}
                    </p>
                    {u.bio && (
                      <p className="font-mono text-[7.5px] line-clamp-2 mb-3" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
                        {u.bio}
                      </p>
                    )}
                    <div className="flex gap-3">
                      {[
                        { val: u._count.followers, label: "seg" },
                        { val: u._count.posts,     label: "posts" },
                        { val: u._count.interests, label: "atlas" },
                      ].map((m) => (
                        <div key={m.label}>
                          <span className="font-mono text-[9px] tabular-nums" style={{ color: "rgb(var(--c-text) / 0.65)" }}>{m.val} </span>
                          <span className="font-mono text-[7px]" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {members.length === 0 && membersLoaded && (
              <div className="py-16 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "rgb(var(--c-muted) / 0.35)" }}>
                  Nenhum membro ainda
                </p>
                <Link href="/register" className="font-mono text-[8px] mt-2 block" style={{ color: "rgb(var(--c-accent) / 0.7)" }}>
                  Criar o primeiro perfil →
                </Link>
              </div>
            )}
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
                  className={`relative aspect-square border flex flex-col items-center justify-center gap-1.5 p-2 transition-all ${
                    t.isEquipped
                      ? "border-solar-accent/40 bg-solar-surface/40"
                      : "border-solar-border/20 hover:border-solar-border/40 opacity-60 hover:opacity-90"
                  }`}
                >
                  {t.isEquipped && (
                    <span className="absolute top-1 right-1 font-mono text-[7px] text-solar-accent/60">✓</span>
                  )}
                  {t.imageUrl
                    ? <Image src={t.imageUrl} alt={t.name} width={32} height={32} className="object-contain" unoptimized />
                    : <span className="text-xl">{TOKEN_EMOJI[t.tokenType] ?? "✦"}</span>
                  }
                  <p className="text-[7px] font-mono text-solar-muted/50 text-center line-clamp-1">{t.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
