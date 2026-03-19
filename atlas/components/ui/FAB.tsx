"use client"

import { Plus } from "lucide-react"

type FABProps = {
  onClick: () => void
  label?: string
}

export function FAB({ onClick, label = "Novo item" }: FABProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="
        fixed bottom-6 right-6 z-30
        w-12 h-12 rounded-full
        bg-solar-amber text-solar-void
        flex items-center justify-center
        shadow-lg hover:shadow-[0_0_24px_rgba(200,164,90,0.4)]
        hover:bg-solar-amber-lt hover:scale-110
        active:scale-95
        transition-solar
        group
      "
    >
      <Plus size={20} strokeWidth={2.5} />

      {/* Tooltip */}
      <span
        className="
          pointer-events-none absolute right-14
          px-2.5 py-1 rounded-md
          bg-solar-deep border border-solar-border
          text-xs font-mono text-solar-text whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-1 group-hover:translate-x-0
          transition-all duration-150
          shadow-lg
        "
      >
        {label}
      </span>
    </button>
  )
}
