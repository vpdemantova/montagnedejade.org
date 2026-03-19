import Link from "next/link"

const COMPASS_SECTIONS = [
  { href: "/compass/diario",  label: "Diário",        description: "Entrada de hoje · reflexões e intenção" },
  { href: "/compass/notas",   label: "Notas",         description: "Anotações rápidas avulsas" },
  { href: "/compass/estudos", label: "Estudos",       description: "Disciplinas PUCC e progresso" },
  { href: "/compass/metas",   label: "Metas",         description: "Objetivos e acompanhamento" },
  { href: "/compass/mapa",    label: "Mapa Interior", description: "Constelação de temas e valores" },
]

export default function CompassPage() {
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

      {/* Header editorial */}
      <header className="page-header relative z-10 border-b border-solar-border/40 pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-compass-neon-dim/60 mb-3">
            Numita Compass · Navegação interior
          </p>
          <h1 className="font-display text-[44px] leading-none text-solar-text font-semibold tracking-tight">
            Compass
          </h1>
          <p className="text-solar-muted/70 text-xs font-mono mt-2">
            Área pessoal e privada
          </p>
        </div>
      </header>

      {/* Seções */}
      <div className="relative z-10 max-w-6xl mx-auto px-12 py-6">
        <div className="flex flex-col border border-solar-border/30">
          {COMPASS_SECTIONS.map((section, i) => (
            <Link
              key={section.href}
              href={section.href}
              className="
                group flex items-center justify-between px-8 py-5
                border-b border-solar-border/20 last:border-b-0
                hover:bg-solar-surface/30 transition-solar
              "
            >
              <div className="flex items-baseline gap-8">
                <span className="text-[9px] font-mono text-solar-muted/50 w-4 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-display text-solar-text text-base transition-solar group-hover:text-solar-text">
                    {section.label}
                  </p>
                  <p className="text-[10px] font-mono text-solar-muted/65 mt-1">{section.description}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-compass-neon-dim/50 group-hover:text-compass-neon transition-solar">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
