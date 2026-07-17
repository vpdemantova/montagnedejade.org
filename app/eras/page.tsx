import { findAll } from "@/atlas/lib/db"
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { ErasClient } from "@/atlas/components/portal/ErasClient"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Eras da Humanidade — Portal Solar",
}

// Tipos do acervo que carregam datação e entram na linha do tempo
const TIMELINE_TYPES = ["PERSON", "WORK", "EVENT", "MOVEMENT"] as const

export default async function ErasPage() {
  const [eras, ...byType] = await Promise.all([
    findAll({ type: "ERA", limit: 200 }).catch(() => []),
    ...TIMELINE_TYPES.map((type) => findAll({ type, limit: 500 }).catch(() => [])),
  ])
  const items = byType.flat()

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Atlas · Linha do Tempo"
        title="Eras da Humanidade"
        subtitle="Todo o conhecimento organizado no tempo — pessoas, obras, eventos e movimentos, do Tempo Profundo à era digital"
        actions={
          <div className="text-right">
            <p className="font-display text-2xl leading-none" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
              {eras.length + items.length}
            </p>
            <p className="page-label mt-0.5">Itens datados</p>
          </div>
        }
      />
      <ErasClient eras={eras} items={items} />
    </div>
  )
}
