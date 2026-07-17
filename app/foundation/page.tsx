import { findAll } from "@/atlas/lib/db"
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { AreaHubClient } from "@/atlas/components/portal/AreaHubClient"

export const dynamic = "force-dynamic"

export default async function FoundationPage() {
  const items = await findAll({ area: "FOUNDATION", limit: 500 }).catch(() => [])

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Escolas · Fundamentos"
        title="Fundamentos"
        subtitle="Gramática, matemática e as bases de todo conhecimento"
        actions={
          <div className="text-right">
            <p className="font-display text-2xl leading-none" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
              {items.length}
            </p>
            <p className="page-label mt-0.5">Itens</p>
          </div>
        }
      />
      <AreaHubClient area="FOUNDATION" items={items} />
    </div>
  )
}
