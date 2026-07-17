import { findAll } from "@/atlas/lib/db"
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { AreaHubClient } from "@/atlas/components/portal/AreaHubClient"

export const dynamic = "force-dynamic"

export default async function ExpressionPage() {
  const items = await findAll({ area: "EXPRESSION", limit: 500 }).catch(() => [])

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Escolas · Expressão"
        title="Expressão"
        subtitle="Música, escrita, teatro e as artes criativas"
        actions={
          <div className="text-right">
            <p className="font-display text-2xl leading-none" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
              {items.length}
            </p>
            <p className="page-label mt-0.5">Itens</p>
          </div>
        }
      />
      <AreaHubClient area="EXPRESSION" items={items} />
    </div>
  )
}
