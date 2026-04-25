import { findAll } from "@/atlas/lib/db"
import { DiarioClient } from "@/atlas/components/compass/DiarioClient"

export const dynamic = "force-dynamic"

export default async function DiarioPage() {
  const entries = await findAll({ area: "DIARIO", limit: 365 }).catch(() => [])

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  })

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="relative z-10 border-b border-solar-border/30 pt-10 pb-6">
        <div className="max-w-6xl mx-auto">
          <p className="editorial-label text-solar-muted/35 mb-3">COMPASS / DIÁRIO</p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="page-hero text-solar-text leading-none">DIÁRIO</h1>
              <p className="font-mono text-[10px] text-solar-muted/40 mt-1 capitalize">{today}</p>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="font-display text-[2rem] leading-none text-solar-text/80">{entries.length}</p>
                <p className="editorial-label text-solar-muted/30">ENTRADAS</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto py-6">
        <DiarioClient entries={entries} />
      </div>
    </div>
  )
}
