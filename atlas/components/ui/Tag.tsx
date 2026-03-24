"use client"

import Link from "next/link"

type TagProps = {
  name: string
  color?: string
  onRemove?: () => void
  size?: "sm" | "md"
  clickable?: boolean
}

export function Tag({ name, onRemove, size = "sm", clickable = true }: TagProps) {
  const cls = `
    inline-flex items-center gap-1 rounded font-mono
    bg-transparent border border-solar-border/60 text-solar-muted/70
    ${size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}
  `

  const inner = (
    <>
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove() }}
          className="ml-0.5 opacity-40 hover:opacity-80 transition-solar"
          aria-label={`Remover tag ${name}`}
        >
          ×
        </button>
      )}
    </>
  )

  if (clickable && !onRemove) {
    return (
      <Link
        href={`/atlas?tag=${encodeURIComponent(name)}`}
        onClick={(e) => e.stopPropagation()}
        className={`${cls} hover:border-solar-accent/60 hover:text-solar-accent transition-colors`}
      >
        {inner}
      </Link>
    )
  }

  return <span className={cls}>{inner}</span>
}
