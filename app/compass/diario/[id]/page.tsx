import { notFound } from "next/navigation"
import { findById }  from "@/atlas/lib/db"
import { AtlasEditor } from "@/atlas/components/blocks/AtlasEditor"
import { JournalMetaBar } from "@/atlas/components/compass/JournalMetaBar"
import Link from "next/link"

type Props = { params: Promise<{ id: string }> }

export default async function DiarioEntryPage({ params }: Props) {
  const { id } = await params
  const item = await findById(id)
  if (!item) notFound()

  // Extract date from title "Diário — YYYY-MM-DD"
  const dateMatch = item.title.match(/(\d{4}-\d{2}-\d{2})/)
  const dateLabel = dateMatch ? dateMatch[1] : item.title

  return (
    <div className="relative min-h-screen">

      {/* Breadcrumb */}
      <div className="border-b border-solar-border/20 bg-solar-void">
        <div className="max-w-4xl mx-auto px-4 sm:px-12 py-2 flex items-center gap-2">
          <Link href="/compass/diario" className="text-[9px] font-mono text-compass-neon-dim/50 hover:text-compass-neon transition-solar uppercase tracking-widest">
            Diário
          </Link>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-text/60">{dateLabel}</span>
        </div>
      </div>

      {/* Energy · Intention · Mood — persisted in JournalEntry */}
      {dateMatch && <JournalMetaBar date={dateMatch[1]!} />}

      <AtlasEditor item={item} redirectOnSave="/compass/diario" />
    </div>
  )
}
