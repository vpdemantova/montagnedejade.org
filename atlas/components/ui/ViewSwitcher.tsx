"use client"

import { ViewType } from "@/atlas/types"

type ViewSwitcherProps = {
  current:  string
  onChange: (view: string) => void
}

// Símbolo mono para cada view — sem dependência de lucide
const VIEWS = [
  // Vistas gerais
  { value: ViewType.LIST,       label: "Lista",      symbol: "≡"  },
  { value: ViewType.TABLE,      label: "Tabela",     symbol: "⊟"  },
  { value: ViewType.KANBAN,     label: "Kanban",     symbol: "⫼"  },
  { value: ViewType.GALLERY,    label: "Galeria",    symbol: "⊞"  },
  { value: ViewType.SHELVES,    label: "Estante",    symbol: "▐▐" },
  { value: ViewType.INDEX,      label: "Índice",     symbol: "⊳"  },
  // Vistas especializadas
  { value: ViewType.AUTORES,    label: "Autores",    symbol: "◉"  },
  { value: ViewType.PARTITURAS, label: "Partituras", symbol: "♩"  },
  { value: ViewType.CURSOS,     label: "Cursos",     symbol: "▶"  },
  { value: ViewType.REPERTORIO, label: "Repertório", symbol: "♪"  },
  { value: ViewType.READINGS,   label: "Leituras",   symbol: "▤"  },
  { value: ViewType.ATLAS_MAP,  label: "Mapa",       symbol: "◎"  },
] as const

// Separador entre vistas gerais e especializadas
const GENERAL_VIEWS   = VIEWS.slice(0, 6)
const SPECIAL_VIEWS   = VIEWS.slice(6)

export function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5" role="group" aria-label="Alternar visualização">
      {GENERAL_VIEWS.map((view) => (
        <ViewBtn key={view.value} view={view} active={current === view.value} onClick={onChange} />
      ))}

      <span className="w-px h-4 bg-solar-border/40 mx-1" />

      {SPECIAL_VIEWS.map((view) => (
        <ViewBtn key={view.value} view={view} active={current === view.value} onClick={onChange} />
      ))}
    </div>
  )
}

function ViewBtn({
  view,
  active,
  onClick,
}: {
  view:    { value: string; label: string; symbol: string }
  active:  boolean
  onClick: (v: string) => void
}) {
  return (
    <button
      onClick={() => onClick(view.value)}
      title={view.label}
      aria-label={view.label}
      aria-pressed={active}
      className={`
        flex items-center justify-center w-7 h-7 rounded-sm
        font-mono text-[11px] transition-solar
        ${active
          ? "text-solar-text bg-solar-surface border border-solar-border/60"
          : "text-solar-muted/50 hover:text-solar-muted/90"
        }
      `}
    >
      {view.symbol}
    </button>
  )
}
