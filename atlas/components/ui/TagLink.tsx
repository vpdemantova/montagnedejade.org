"use client"

import Link from "next/link"

interface TagLinkProps {
  tag: string
  className?: string
  onDelete?: () => void
}

export function TagLink({ tag, className, onDelete }: TagLinkProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest border border-solar-border/50 transition-colors
        ${className ?? "px-1.5 py-0.5 text-solar-muted/70"}`}
    >
      <Link
        href={`/atlas?tag=${encodeURIComponent(tag)}`}
        className="hover:text-solar-accent transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {tag}
      </Link>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-solar-muted/40 hover:text-solar-red transition-solar leading-none"
        >
          ×
        </button>
      )}
    </span>
  )
}
