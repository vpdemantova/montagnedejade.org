import type { ReactNode } from "react"

type Props = {
  label?:    string
  title:     string
  subtitle?: string
  actions?:  ReactNode
  size?:     "narrow" | "standard" | "wide"
}

export function PageHeader({ label, title, subtitle, actions, size = "standard" }: Props) {
  const cls =
    size === "narrow" ? "page-narrow" :
    size === "wide"   ? "page-wide"   :
    "page-standard"

  return (
    <header className="ph">
      <div className={`${cls} flex items-end justify-between gap-6`}>
        <div>
          {label && <p className="page-label mb-3">{label}</p>}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 mb-1">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
