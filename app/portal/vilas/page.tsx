import { countByArea, findAll } from "@/atlas/lib/db"
import { VilasClient } from "@/atlas/components/portal/VilasClient"

export default async function VilasPage() {
  const [counts, recents] = await Promise.all([
    countByArea(),
    findAll({ limit: 200 }),
  ])

  // Último item adicionado por área
  const lastByArea: Record<string, string | null> = {}
  for (const item of recents) {
    if (!lastByArea[item.area]) lastByArea[item.area] = item.title
  }

  return <VilasClient counts={counts} lastByArea={lastByArea} />
}
