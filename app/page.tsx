import { findRecent, countByArea } from "@/atlas/lib/db"
import { ItemCard } from "@/atlas/components/ui/ItemCard"
import { AREA_LABELS, AREA_COLORS } from "@/atlas/types"

export default async function DashboardPage() {
  const [recentItems, areaCounts] = await Promise.all([
    findRecent(5),
    countByArea(),
  ])

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Saudação */}
      <header className="mb-10">
        <p className="font-mono text-xs text-solar-muted uppercase tracking-widest mb-1">
          {today}
        </p>
        <h1 className="font-display text-3xl text-solar-text">
          Bem-vindo ao Portal Solar
        </h1>
        <p className="text-solar-muted mt-2 text-sm">
          Sua biblioteca cósmica de conhecimento.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-lg text-solar-text mb-4">
              Continuar de onde parou
            </h2>
            {recentItems.length === 0 ? (
              <p className="text-solar-muted text-sm">
                Nenhum item ainda.{" "}
                <a href="/atlas" className="text-solar-amber hover:underline">
                  Criar o primeiro item →
                </a>
              </p>
            ) : (
              <div className="grid gap-3">
                {recentItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">
          {/* Estatísticas por área */}
          <section className="bg-solar-surface border border-solar-border rounded-lg p-4">
            <h3 className="font-mono text-xs text-solar-muted uppercase tracking-widest mb-4">
              Atlas — Itens por área
            </h3>
            <ul className="space-y-2">
              {Object.entries(AREA_LABELS).map(([key, label]) => {
                const count = areaCounts[key] ?? 0
                const color = AREA_COLORS[key as keyof typeof AREA_COLORS] ?? "#C8A45A"
                const maxCount = Math.max(...Object.values(areaCounts), 1)

                return (
                  <li key={key} className="flex items-center gap-2">
                    <span className="text-xs text-solar-muted w-20 shrink-0">{label}</span>
                    <div className="flex-1 bg-solar-border rounded-full h-1">
                      <div
                        className="h-1 rounded-full transition-solar"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-mono w-4 text-right"
                      style={{ color }}
                    >
                      {count}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Links rápidos */}
          <section className="bg-solar-surface border border-solar-border rounded-lg p-4">
            <h3 className="font-mono text-xs text-solar-muted uppercase tracking-widest mb-3">
              Ações rápidas
            </h3>
            <nav className="space-y-1">
              {[
                { href: "/atlas",           label: "Ver o Atlas completo" },
                { href: "/compass/journal", label: "Abrir diário de hoje" },
                { href: "/world",           label: "Quadro Mundial" },
                { href: "/monument",        label: "Monumento Solar 🌌" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="block text-sm text-solar-muted hover:text-solar-amber transition-solar py-0.5"
                >
                  → {label}
                </a>
              ))}
            </nav>
          </section>
        </div>
      </div>
    </div>
  )
}
