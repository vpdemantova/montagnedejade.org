"use client"

import { LayoutList, Table2, Columns3, LayoutGrid, Network } from "lucide-react"
import { ViewType } from "@/atlas/types"

type ViewSwitcherProps = {
  current: string
  onChange: (view: string) => void
}

const VIEWS = [
  { value: ViewType.LIST,      label: "Lista",   icon: <LayoutList size={13} /> },
  { value: ViewType.TABLE,     label: "Tabela",  icon: <Table2 size={13} />     },
  { value: ViewType.KANBAN,    label: "Kanban",  icon: <Columns3 size={13} />   },
  { value: ViewType.GALLERY,   label: "Galeria", icon: <LayoutGrid size={13} /> },
  { value: ViewType.ATLAS_MAP, label: "Mapa",    icon: <Network size={13} />    },
]

export function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label="Alternar visualização"
    >
      {VIEWS.map((view) => (
        <button
          key={view.value}
          onClick={() => onChange(view.value)}
          title={view.label}
          aria-label={view.label}
          aria-pressed={current === view.value}
          className={`
            flex items-center justify-center w-7 h-7 rounded-sm transition-solar
            ${current === view.value
              ? "text-solar-text bg-solar-surface border border-solar-border/60"
              : "text-solar-muted/40 hover:text-solar-muted"
            }
          `}
        >
          {view.icon}
        </button>
      ))}
    </div>
  )
}
