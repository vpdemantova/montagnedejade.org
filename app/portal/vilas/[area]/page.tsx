import { findAll }   from "@/atlas/lib/db"
import { AtlasClient } from "@/atlas/components/views/AtlasClient"
import type { AreaType } from "@/atlas/types"

// Area → default view mapping
const AREA_DEFAULT_VIEW: Record<string, string> = {
  ACADEMIA:   "INDEX",
  ARTES:      "SHELVES",
  COMPUTACAO: "LIST",
  AULAS:      "CURSOS",
}

type Props = {
  params:      Promise<{ area: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function VilaAreaPage({ params, searchParams }: Props) {
  const { area }   = await params
  const { view }   = await searchParams
  const areaKey    = area.toUpperCase() as AreaType
  const defaultView = view ?? AREA_DEFAULT_VIEW[areaKey] ?? "LIST"

  const items = await findAll({ area: areaKey, limit: 500 })

  return (
    <AtlasClient
      items={items}
      initialArea={areaKey}
      defaultView={defaultView}
      backHref="/portal/vilas"
      backLabel="Vilas"
    />
  )
}
