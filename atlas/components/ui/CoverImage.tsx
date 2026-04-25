"use client"

import { useState } from "react"
import { GenerativePlaceholder } from "./GenerativePlaceholder"

interface CoverImageProps {
  src?:       string | null
  alt:        string
  name:       string          // usado como seed do placeholder generativo
  className?: string
  style?:     React.CSSProperties
  loading?:   "lazy" | "eager"
}

/**
 * CoverImage — tenta exibir a imagem real.
 * Se não houver src ou o carregamento falhar, exibe GenerativePlaceholder
 * baseado no `name` (mesmo nome = mesma arte, sempre).
 */
export function CoverImage({ src, alt, name, className, style, loading = "lazy" }: CoverImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <GenerativePlaceholder name={name} className={className} style={style} />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => setFailed(true)}
    />
  )
}
