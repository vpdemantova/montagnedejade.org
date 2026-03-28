import { findAll } from "@/atlas/lib/db"
import { DiarioClient } from "@/atlas/components/compass/DiarioClient"

export const dynamic = 'force-dynamic'

export default async function DiarioPage() {
  const entries = await findAll({ area: "DIARIO", limit: 365 })

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Diário
          </p>
          <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
            Diário
          </h1>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-12 py-6">
        <DiarioClient entries={entries} />
      </div>
    </div>
  )
}
