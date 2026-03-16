import Link from "next/link"

const COMPASS_SECTIONS = [
  { href: "/compass/journal",    label: "Diário",      description: "Entradas diárias e reflexões" },
  { href: "/compass/learn",      label: "Projetos",    description: "Aprendizados em andamento" },
  { href: "/compass/readings",   label: "Leituras",    description: "Livros e textos catalogados" },
  { href: "/compass/repertoire", label: "Repertório",  description: "Obras musicais em estudo" },
  { href: "/compass/favorites",  label: "Favoritos",   description: "Itens marcados como favoritos" },
]

export default function CompassPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <p className="font-mono text-xs text-solar-muted uppercase tracking-widest mb-1">🧭</p>
        <h1 className="font-display text-2xl text-solar-text">Numita Compass</h1>
        <p className="text-solar-muted text-sm mt-1">Área pessoal e privada</p>
      </header>

      <div className="grid gap-3">
        {COMPASS_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center justify-between p-4 bg-solar-surface border border-solar-border rounded-lg hover:border-solar-amber/40 transition-solar group"
          >
            <div>
              <p className="text-solar-text font-display group-hover:text-solar-amber-light transition-solar">
                {section.label}
              </p>
              <p className="text-solar-muted text-xs mt-0.5">{section.description}</p>
            </div>
            <span className="text-solar-muted group-hover:text-solar-amber transition-solar">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
