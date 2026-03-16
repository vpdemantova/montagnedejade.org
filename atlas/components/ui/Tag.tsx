type TagProps = {
  name: string
  color?: string
  onRemove?: () => void
  size?: "sm" | "md"
}

export function Tag({ name, onRemove, size = "sm" }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded font-mono
        bg-transparent border border-solar-border/60 text-solar-muted/70
        ${size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"}
      `}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-40 hover:opacity-80 transition-solar"
          aria-label={`Remover tag ${name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
