import { findRecent, findAll, countByArea, findAllNotices } from "@/atlas/lib/db"

export const dynamic = 'force-dynamic'
import { DashboardClient } from "@/atlas/components/views/DashboardClient"
import { WorldHero }       from "@/atlas/components/views/WorldHero"

// Seleciona um item com seed = data atual — mesmo item o dia todo
function getDailyDiscovery<T>(items: T[]): T | null {
  if (!items.length) return null
  const today = new Date().toISOString().split("T")[0]!         // "2026-03-16"
  const seed  = today.replace(/-/g, "")                         // "20260316"
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return items[seed % items.length]!
}

export default async function DashboardPage() {
  const [recentItems, allItems, areaCounts, notices] = await Promise.all([
    findRecent(5),
    findAll({ limit: 200 }),
    countByArea(),
    findAllNotices(20),
  ])

  // Filtra apenas itens do Portal (hemisphere PORTAL) para a descoberta
  const portalItems = allItems.filter((i) => i.hemisphere === "PORTAL")
  const discoveryItem = getDailyDiscovery(portalItems)

  const totalItems = Object.values(areaCounts).reduce((a, b) => a + b, 0)

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  })

  return (
    <div className="relative min-h-screen">

      {/* Grade de fundo */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(42,42,58,0.18) 1px, transparent 1px)",
          backgroundSize: "80px 100%",
        }}
      />

      {/* Hero — mundo interativo com toggle Constelação / Globo / Mapa */}
      <div className="relative z-10">
        <WorldHero items={allItems} showStats showCTA />
      </div>

      {/* Dashboard client — saudação, GSAP, seções */}
      <DashboardClient
        recentItems={recentItems}
        discoveryItem={discoveryItem}
        areaCounts={areaCounts}
        totalItems={totalItems}
        today={today}
        notices={notices}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-solar-border/15 mt-12 px-4 sm:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3 text-center">
          <p className="text-[10px] font-mono text-solar-muted/30 tracking-widest uppercase">
            Made with love by{" "}
            <a
              href="https://github.com/vitordemantova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-solar-amber/50 hover:text-solar-amber transition-solar"
            >
              Vitor de Mantova
            </a>
            {" "}· Since 2020 · Alone, with love, with A.I.
          </p>
          <p className="text-[9px] font-mono text-solar-muted/18 italic tracking-wide">
            And all of humanity on the mind — building a cathedral, one stone at a time.
          </p>
          <p className="text-[8px] font-mono text-solar-muted/15 tracking-[0.3em] uppercase mt-1">
            ☀ Portal Solar · MMXX–MMXXVI
          </p>
        </div>
      </footer>
    </div>
  )
}
