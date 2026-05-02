import { prisma }              from "@/atlas/lib/db"
import { PeriodicTableClient } from "@/atlas/components/views/PeriodicTableClient"
import { PageHeader }          from "@/atlas/components/layout/PageHeader"

export const dynamic = "force-dynamic"
export const metadata = { title: "Tabela Periódica — Portal Solar" }

export default async function TabelaPeriodicaPage() {
  const raw = await prisma.atlasItem.findMany({
    where:  { area: "ELEMENTOS" },
    select: { id: true, title: true, slug: true, metadata: true },
  })

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Atlas · Ciências"
        title="Tabela Periódica"
        subtitle="118 elementos — interativa"
        size="wide"
      />
      <div className="py-6" style={{ paddingLeft: "var(--page-pad)", paddingRight: "var(--page-pad)" }}>
        <PeriodicTableClient elements={raw} />
      </div>
    </div>
  )
}
