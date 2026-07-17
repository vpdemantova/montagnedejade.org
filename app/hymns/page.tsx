import { findAll } from "@/atlas/lib/db"
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { AreaHubClient } from "@/atlas/components/portal/AreaHubClient"

export const dynamic = "force-dynamic"

export default async function HymnsPage() {
  const items = await findAll({ area: "HYMNS", limit: 500 }).catch(() => [])

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Escolas · Hinos"
        title="Hinos"
        subtitle="Cânticos, odes e orações — uma coleção devocional"
        actions={
          <div className="text-right">
            <p className="font-display text-2xl leading-none" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
              {items.length}
            </p>
            <p className="page-label mt-0.5">Itens</p>
          </div>
        }
      />
      <AreaHubClient area="HYMNS" items={items} />
    </div>
  )
}
