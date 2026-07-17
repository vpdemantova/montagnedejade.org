import Link from "next/link"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"
import type { PathStep } from "@/atlas/lib/db"

type PathDetailClientProps = {
  path:  AtlasItemWithTags
  steps: Array<{ step: PathStep; item: AtlasItemWithTags | null }>
}

export function PathDetailClient({ path, steps }: PathDetailClientProps) {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-solar-border/20 bg-solar-void">
        <div className="max-w-4xl mx-auto py-2 flex items-center gap-2">
          <Link href="/academia" className="text-[9px] font-mono text-solar-muted/50 hover:text-solar-amber transition-solar uppercase tracking-widest">
            Academia
          </Link>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-muted/50 uppercase tracking-widest">Trilha</span>
          <span className="text-[9px] font-mono text-solar-muted/25">›</span>
          <span className="text-[9px] font-mono text-solar-text/60 truncate max-w-40">{path.title}</span>
        </div>
      </div>

      <div className="page-narrow py-10">
        <p className="page-label mb-3">Trilha · {steps.length} passo{steps.length !== 1 ? "s" : ""}</p>
        <h1 className="page-title mb-6">{path.title}</h1>

        <div className="flex flex-col">
          {steps.map(({ step, item }, i) => {
            if (!item) {
              return (
                <div key={step.itemId} className="flex gap-4 py-4 border-b border-solar-border/15 opacity-40">
                  <span className="font-mono text-[10px] text-solar-muted/30 flex-shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-mono text-[11px] text-solar-muted/40">Item não encontrado</p>
                </div>
              )
            }

            const areaLabel = AREA_LABELS[item.area] ?? item.area
            const typeLabel = TYPE_LABELS[item.type] ?? item.type

            return (
              <Link
                key={item.id}
                href={`/atlas/${item.slug ?? item.id}`}
                className="group flex gap-4 py-4 border-b border-solar-border/15 hover:bg-solar-surface/15 transition-colors"
              >
                <span className="font-mono text-[10px] text-solar-muted/35 flex-shrink-0 w-6 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[15px] leading-snug text-solar-text group-hover:opacity-90 transition-opacity">
                    {item.title}
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/40 mt-1">
                    {areaLabel} · {typeLabel}
                  </p>
                  {step.note && (
                    <p className="font-mono text-[10px] text-solar-muted/55 mt-1.5 leading-relaxed">{step.note}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
