import { MapaInterior } from "@/atlas/components/compass/MapaInterior"

export default function MapaPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />

      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Mapa
          </p>
          <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
            Mapa Interior
          </h1>
          <p className="text-[10px] font-mono text-solar-muted/40 mt-2">
            Constelação de temas, valores e conexões pessoais
          </p>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-12 py-6">
        <MapaInterior />
      </div>
    </div>
  )
}
