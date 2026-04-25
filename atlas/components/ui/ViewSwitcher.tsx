"use client"

import {
  List, Table2, LayoutDashboard, LayoutGrid, Library, AlignLeft,
  Users, Music, GraduationCap, Disc, BookOpen, Map,
  type LucideIcon,
} from "lucide-react"
import { ViewType } from "@/atlas/types"
import { UI } from "@/portal.config"

type ViewSwitcherProps = {
  current:  string
  onChange: (view: string) => void
}

type ViewDef = {
  value: string
  label: string
  icon:  LucideIcon
}

const GENERAL_VIEWS: ViewDef[] = [
  { value: ViewType.LIST,       label: "Lista",      icon: List            },
  { value: ViewType.TABLE,      label: "Tabela",     icon: Table2          },
  { value: ViewType.KANBAN,     label: "Kanban",     icon: LayoutDashboard },
  { value: ViewType.GALLERY,    label: "Galeria",    icon: LayoutGrid      },
  { value: ViewType.SHELVES,    label: "Estante",    icon: Library         },
  { value: ViewType.INDEX,      label: "Índice",     icon: AlignLeft       },
]

const SPECIAL_VIEWS: ViewDef[] = [
  { value: ViewType.AUTORES,    label: "Autores",    icon: Users           },
  { value: ViewType.PARTITURAS, label: "Partituras", icon: Music           },
  { value: ViewType.CURSOS,     label: "Cursos",     icon: GraduationCap   },
  { value: ViewType.REPERTORIO, label: "Repertório", icon: Disc            },
  { value: ViewType.READINGS,   label: "Leituras",   icon: BookOpen        },
  { value: ViewType.ATLAS_MAP,  label: "Mapa",       icon: Map             },
]

export function ViewSwitcher({ current, onChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap" role="group" aria-label="Alternar visualização">
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
  view:    ViewDef
  active:  boolean
  onClick: (v: string) => void
}) {
  const Icon = view.icon
  return (
    <button
      onClick={() => onClick(view.value)}
      title={view.label}
      aria-label={view.label}
      aria-pressed={active}
      className={`
        flex items-center justify-center w-7 h-7 rounded-sm transition-colors
        ${active
          ? "text-solar-text bg-solar-surface border border-solar-border/60"
          : "text-solar-muted/40 hover:text-solar-text/70"
        }
      `}
    >
      {UI.SHOW_ICONS && <Icon size={13} strokeWidth={1.5} />}
    </button>
  )
}
