import type { ButtonHTMLAttributes } from "react"

type ButtonVariant = "primary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-solar-amber text-solar-void font-semibold hover:bg-solar-amber-light active:scale-[0.98]",
  ghost:
    "bg-transparent text-solar-muted border border-solar-border hover:text-solar-text hover:border-solar-amber/40",
  destructive:
    "bg-transparent text-red-400 border border-red-400/30 hover:bg-red-400/10 hover:border-red-400/60",
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-md",
  lg: "px-6 py-3 text-base rounded-lg",
}

export function Button({
  variant = "ghost",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        transition-solar select-none
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
