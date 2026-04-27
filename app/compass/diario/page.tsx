import { findAll } from "@/atlas/lib/db"
import { DiarioClient } from "@/atlas/components/compass/DiarioClient"
import { PageHeader } from "@/atlas/components/layout/PageHeader"

export const dynamic = "force-dynamic"

export default async function DiarioPage() {
  const entries = await findAll({ area: "DIARIO", limit: 365 }).catch(() => [])

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  })

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Compass · Diário"
        title="Diário"
        subtitle={today}
        size="wide"
        actions={
          <div className="text-right">
            <p className="font-display text-2xl leading-none" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
              {entries.length}
            </p>
            <p className="page-label mt-0.5">Entradas</p>
          </div>
        }
      />
      <div className="page-wide py-6">
        <DiarioClient entries={entries} />
      </div>
    </div>
  )
}
