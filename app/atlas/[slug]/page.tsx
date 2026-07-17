import { notFound } from "next/navigation"
import { findBySlug, findLinkedAssets } from "@/atlas/lib/db"
import { AtlasEditor } from "@/atlas/components/blocks/AtlasEditor"
import { LinkedAssetsSection } from "@/atlas/components/ui/LinkedAssetsSection"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import Link from "next/link"

type Props = { params: Promise<{ slug: string }> }

export default async function AtlasItemPage({ params }: Props) {
  const { slug } = await params
  const item = await findBySlug(slug)
  if (!item) notFound()

  const linkedAssets = await findLinkedAssets(item.id)

  const areaLabel = AREA_LABELS[item.area] ?? item.area
  const typeLabel = TYPE_LABELS[item.type] ?? item.type

  return (
    <div className="relative min-h-screen">

      {/* Breadcrumb */}
      <div className="border-b border-solar-border/20 bg-solar-void">
        <div className="max-w-4xl mx-auto py-2 flex items-center gap-2">
          <Link href="/atlas" className="text-[9px] font-mono text-solar-muted/50 hover:text-solar-amber transition-solar uppercase tracking-widest">
            Atlas
          </Link>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-muted/50 uppercase tracking-widest">{areaLabel}</span>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-muted/50 uppercase tracking-widest">{typeLabel}</span>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-text/60 truncate max-w-40">{item.title}</span>
        </div>
      </div>

      <AtlasEditor item={item} />
      <LinkedAssetsSection assets={linkedAssets} />
    </div>
  )
}
