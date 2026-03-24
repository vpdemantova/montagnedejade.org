import { findAll } from "@/atlas/lib/db"
import { AtlasClient } from "@/atlas/components/views/AtlasClient"
import type { AreaType, ItemType, StatusType } from "@/atlas/types"

export default async function AtlasPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; type?: string; status?: string; view?: string; tag?: string }>
}) {
  const params = await searchParams
  const items = await findAll({
    area:   params.area   as AreaType   | undefined,
    type:   params.type   as ItemType   | undefined,
    status: params.status as StatusType | undefined,
    tags:   params.tag ? [params.tag] : undefined,
    limit:  1000,
  })

  return (
    <AtlasClient
      items={items}
      initialArea={params.area}
      initialTag={params.tag}
      defaultView={params.view ?? "HORIZONTAL"}
    />
  )
}
