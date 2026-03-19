import { notFound } from "next/navigation"
import { findById }  from "@/atlas/lib/db"
import { AtlasEditor } from "@/atlas/components/blocks/AtlasEditor"
import Link from "next/link"

type Props = { params: Promise<{ id: string }> }

export default async function NotaPage({ params }: Props) {
  const { id } = await params
  const item = await findById(id)
  if (!item) notFound()

  return (
    <div className="relative min-h-screen">

      {/* Breadcrumb Compass */}
      <div className="border-b border-solar-border/20 bg-solar-void">
        <div className="max-w-4xl mx-auto px-12 py-2 flex items-center gap-2">
          <Link href="/compass/notas" className="text-[9px] font-mono text-compass-neon-dim/50 hover:text-compass-neon transition-solar uppercase tracking-widest">
            Notas
          </Link>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-text/60 truncate max-w-60">{item.title}</span>
        </div>
      </div>

      <AtlasEditor item={item} redirectOnSave="/compass/notas" />
    </div>
  )
}
