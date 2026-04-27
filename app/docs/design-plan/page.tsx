import Link from "next/link"

const PROBLEMS = [
  { n:"01", title:"Sem sistema tipográfico", desc:"Tamanhos, pesos e famílias de fontes variam arbitrariamente entre páginas. Não existe escala definida (h1→h6, body, caption, mono)." },
  { n:"02", title:"Hierarquia visual inconsistente", desc:"Elementos importantes não se destacam dos secundários. Tudo parece ter o mesmo peso visual, gerando fadiga de leitura." },
  { n:"03", title:"Espaçamentos não sistematizados", desc:"Cada componente usa values ad hoc (px-3, px-6, px-7, px-8). Sem um grid de 4px ou 8px base, o layout parece 'tremido'." },
  { n:"04", title:"Contraste baixo em texto secundário", desc:"Opacidades como /0.35, /0.3 tornam texto ilegível. Contraste mínimo WCAG AA é 4.5:1 para texto normal." },
  { n:"05", title:"Interatividade não sinalizada", desc:"Usuário não sabe o que é clicável. Botões misturam-se com texto estático. Sem hover states consistentes." },
  { n:"06", title:"Cards sem identidade visual", desc:"Cards de Atlas, Cultura e Compass parecem feitos por pessoas diferentes. Sem padrão de imagem, título, meta, ação." },
  { n:"07", title:"Navegação fragmentada", desc:"3 sistemas de nav (top, bottom, overlay) com comportamentos diferentes. Usuário perde-se entre Atlas, Compass e portais." },
  { n:"08", title:"Ausência de grid de layout", desc:"Conteúdo ora vai edge-to-edge, ora tem max-w, ora tem padding variável. Nada se alinha visualmente." },
]

const STEPS = [
  {
    n:"01", title:"Escolher a direção no Atelier",
    desc:"Acesse /atelier, navegue pelas 24 opções, selecione uma. Copie o token gerado.",
    action:"→ /atelier"
  },
  {
    n:"02", title:"Aplicar o token de design",
    desc:"Cole o token em atlas/lib/design-token.ts. Execute o script de conversão que transforma o token em CSS variables no globals.css.",
    action:"→ npm run apply-style"
  },
  {
    n:"03", title:"Definir escala tipográfica",
    desc:"6 níveis: display (2.5rem), h1 (1.8rem), h2 (1.3rem), h3 (1rem), body (0.875rem), caption (0.75rem). Aplicar como classes Tailwind ou CSS variables.",
    action:"→ tailwind.config.ts"
  },
  {
    n:"04", title:"Grid de 8px base",
    desc:"Todos os espaçamentos devem ser múltiplos de 8 (ou 4 para micro-ajustes). Remover todos os valores arbitrários e padronizar.",
    action:"→ globals.css"
  },
  {
    n:"05", title:"Padronizar o card",
    desc:"Um único componente AtlasCard que funciona em todos os contextos: galeria, lista, horizontal, home. Props: size (sm/md/lg), variant (default/featured).",
    action:"→ atlas/components/ui/Card.tsx"
  },
  {
    n:"06", title:"Corrigir contraste",
    desc:"Nenhum texto informativo abaixo de 60% de opacidade. Títulos: 90%+. Labels: 70%+. Muted: 55%+ (mínimo). Eliminar /0.3, /0.35.",
    action:"→ busca global por '/ 0.3'"
  },
  {
    n:"07", title:"Sistema de interatividade",
    desc:"Todo elemento clicável: border ou underline no hover. Cursor pointer. Transição 150ms. Nada mais, nada menos.",
    action:"→ globals.css :hover rules"
  },
  {
    n:"08", title:"Revisar página por página",
    desc:"Atlas → Academia → Cultura → Compass → Display. Cada página deve usar os mesmos tokens, nenhum valor hardcoded.",
    action:"→ audit checklist"
  },
]

export default function DesignPlanPage() {
  return (
    <div className="min-h-screen" style={{ maxWidth: 780 }}>

      <div className="border-b pt-8 pb-6" style={{ borderColor: "rgb(var(--c-border) / 0.15)" }}>
        <p className="font-mono text-[7.5px] uppercase tracking-[0.3em] mb-2" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
          Portal Solar · Documento de Execução
        </p>
        <h1 className="font-display text-3xl font-bold leading-none mb-2" style={{ color: "rgb(var(--c-text) / 0.9)" }}>
          Plano de Design Final
        </h1>
        <p className="font-mono text-[9px]" style={{ color: "rgb(var(--c-muted) / 0.65)" }}>
          O que está errado, por quê, e como consertar em ordem de prioridade.
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/atelier" className="font-mono text-[7.5px] uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-accent) / 0.8)" }}>
            ← Atelier de Interfaces
          </Link>
          <Link href="/" className="font-mono text-[7.5px] uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
            Atlas
          </Link>
        </div>
      </div>

      {/* Problemas */}
      <div className="py-8 space-y-1">
        <h2 className="font-mono text-[8px] uppercase tracking-[0.3em] mb-6" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
          Diagnóstico — O que está quebrado
        </h2>
        {PROBLEMS.map((p) => (
          <div key={p.n} className="flex gap-6 py-4" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}>
            <span className="font-mono text-[7px] tabular-nums flex-shrink-0 mt-0.5" style={{ color: "rgb(var(--c-accent) / 0.6)" }}>{p.n}</span>
            <div>
              <p className="font-display text-[0.95rem] mb-1" style={{ color: "rgb(var(--c-text) / 0.88)" }}>{p.title}</p>
              <p className="font-mono text-[8px] leading-relaxed" style={{ color: "rgb(var(--c-muted) / 0.62)" }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plano de execução */}
      <div className="py-8 space-y-1" style={{ borderTop: "1px solid rgb(var(--c-border) / 0.15)" }}>
        <h2 className="font-mono text-[8px] uppercase tracking-[0.3em] mb-6" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
          Execução — Ordem de prioridade
        </h2>
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-6 py-4" style={{ borderBottom: "1px solid rgb(var(--c-border) / 0.1)" }}>
            <span className="font-mono text-[7px] tabular-nums flex-shrink-0 mt-0.5" style={{ color: "rgb(var(--c-teal) / 0.6)" }}>{s.n}</span>
            <div className="flex-1">
              <p className="font-display text-[0.95rem] mb-1" style={{ color: "rgb(var(--c-text) / 0.88)" }}>{s.title}</p>
              <p className="font-mono text-[8px] leading-relaxed mb-1.5" style={{ color: "rgb(var(--c-muted) / 0.62)" }}>{s.desc}</p>
              <span className="font-mono text-[7px]" style={{ color: "rgb(var(--c-accent) / 0.6)" }}>{s.action}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Regras de ouro */}
      <div className="py-8" style={{ borderTop: "1px solid rgb(var(--c-border) / 0.15)" }}>
        <h2 className="font-mono text-[8px] uppercase tracking-[0.3em] mb-6" style={{ color: "rgb(var(--c-muted) / 0.55)" }}>
          Regras de Ouro — Não quebre estas
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["Um card, uma regra", "AtlasCard é o único card do sistema. Não crie variantes arbitrárias."],
            ["Texto sempre legível", "Nenhum texto informativo abaixo de 55% de opacidade."],
            ["Grid de 8px", "Todos os espaçamentos: múltiplos de 8. Sem valores arbitrários."],
            ["Hover sempre visível", "Todo elemento interativo tem feedback visual no hover."],
            ["Três fontes apenas", "Head, body, mono — só essas. Sem importações extras."],
            ["Cores via token", "Nenhuma cor hardcoded nos componentes. Apenas CSS variables."],
          ].map(([title, desc]) => (
            <div key={title} className="p-4" style={{ background: "rgb(var(--c-deep))", border: "1px solid rgb(var(--c-border) / 0.15)" }}>
              <p className="font-mono text-[8px] uppercase tracking-widest mb-1.5" style={{ color: "rgb(var(--c-text) / 0.8)" }}>{title}</p>
              <p className="font-mono text-[7.5px] leading-relaxed" style={{ color: "rgb(var(--c-muted) / 0.58)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
