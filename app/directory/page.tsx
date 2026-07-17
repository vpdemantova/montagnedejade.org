import { findAllAssets } from "@/atlas/lib/db"
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { DirectoryClient } from "@/atlas/components/portal/DirectoryClient"

export const dynamic = "force-dynamic"

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { kind } = await searchParams
  const assets = await findAllAssets({ kind, limit: 500 }).catch(() => [])

  return (
    <div className="min-h-screen">
      <PageHeader
        label="Directory"
        title="Directory"
        subtitle="Biblioteca de mídia — imagens, áudio, PDFs e outros arquivos"
        actions={
          <div className="text-right">
            <p className="font-display text-2xl leading-none" style={{ color: "rgb(var(--c-text) / 0.7)" }}>
              {assets.length}
            </p>
            <p className="page-label mt-0.5">Arquivos</p>
          </div>
        }
      />
      <DirectoryClient assets={assets} initialKind={kind} />
    </div>
  )
}
