import type { ButtonHTMLAttributes } from "react"

type ButtonVariant = "primary" | "ghost" | "subtle" | "solid" | "destructive"
type ButtonSize    = "sm" | "md"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?:    ButtonSize
}

const V: Record<ButtonVariant, string> = {
  primary:     "btn-primary",
  ghost:       "btn-ghost",
  subtle:      "btn-subtle",
  solid:       "btn-solid",
  destructive: "bg-transparent text-red-400/70 border border-red-400/25 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/50",
}

export function Button({
  variant   = "ghost",
  size      = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn ${V[variant]} btn-${size} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
