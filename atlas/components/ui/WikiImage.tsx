"use client"

import { useState, useEffect } from "react"
import { GenerativePlaceholder } from "./GenerativePlaceholder"

// Prioridade: src manual → Wikipedia auto-fetch → GenerativePlaceholder
// Cache em memória para evitar fetches repetidos na mesma sessão

const cache = new Map<string, string | null>()

interface WikiImageProps {
  src?:        string | null
  name:        string
  alt:         string
  className?:  string
  style?:      React.CSSProperties
  loading?:    "lazy" | "eager"
  wikiSearch?: boolean
}

export function WikiImage({
  src,
  name,
  alt,
  className,
  style,
  loading = "lazy",
  wikiSearch = true,
}: WikiImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(src ?? null)
  const [failed,      setFailed]      = useState(false)

  useEffect(() => {
    if (src) { setResolvedSrc(src); return }
    if (!wikiSearch || !name) return

    if (cache.has(name)) {
      setResolvedSrc(cache.get(name) ?? null)
      return
    }

    const ctrl = new AbortController()
    fetch(`/api/wikimedia?title=${encodeURIComponent(name)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { imageUrl?: string | null } | null) => {
        const url = data?.imageUrl ?? null
        cache.set(name, url)
        setResolvedSrc(url)
      })
      .catch(() => cache.set(name, null))

    return () => ctrl.abort()
  }, [src, name, wikiSearch])

  if (!resolvedSrc || failed) {
    return <GenerativePlaceholder name={name} className={className} style={style} />
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => setFailed(true)}
    />
  )
}
