import { countByArea, findAll } from "@/atlas/lib/db"
import { VilasClient } from "@/atlas/components/portal/VilasClient"

export const dynamic = 'force-dynamic'

export default async function VilasPage() {
  const [counts, recents] = await Promise.all([
    countByArea().catch(() => ({} as Record<string, number>)),
    findAll({ limit: 200 }).catch(() => []),
  ])

  // Último item adicionado por área
  const lastByArea: Record<string, string | null> = {}
  for (const item of recents) {
    if (!lastByArea[item.area]) lastByArea[item.area] = item.title
  }

  return <VilasClient counts={counts} lastByArea={lastByArea} />
}
