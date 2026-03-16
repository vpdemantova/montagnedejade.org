import { findAll } from "@/atlas/lib/db"
import { AtlasClient } from "@/atlas/components/views/AtlasClient"
import type { AreaType, ItemType, StatusType } from "@/atlas/types"

export default async function AtlasPage({
  searchParams,
}: {
  searchParams: { area?: string; type?: string; status?: string }
}) {
  const items = await findAll({
    area:   searchParams.area   as AreaType   | undefined,
    type:   searchParams.type   as ItemType   | undefined,
    status: searchParams.status as StatusType | undefined,
  })

  return (
    <AtlasClient
      items={items}
      initialArea={searchParams.area}
    />
  )
}
