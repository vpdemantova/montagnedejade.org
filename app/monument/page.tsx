import { SolarMonument } from "@/atlas/components/3d/SolarMonument"

export const metadata = {
  title: "Monumento Solar — Portal Solar",
}

export default function MonumentPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-solar-void">
      {/* Fullscreen monument */}
      <SolarMonument variant="monument" showStats showCTA />

      {/* Top overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between px-10 pt-8 pointer-events-none">
        <div>
          <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-solar-muted/30 mb-1">
            Portal Solar · Monumento
          </p>
          <h1 className="font-display text-[28px] leading-none text-solar-text/80 font-semibold tracking-tight">
            Monumento Solar
          </h1>
          <p className="text-[10px] font-mono text-solar-muted/35 mt-1.5">
            Biblioteca viva. Escultura em crescimento.
          </p>
        </div>
      </div>
    </div>
  )
}
