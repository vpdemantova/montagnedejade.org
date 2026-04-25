export const metadata = {
  title: "Quadro — Portal Solar",
}

export default function QuadroPage() {
  return (
    <main className="editorial-page">
      <div
        className="py-12 md:py-16 border-b"
        style={{ borderColor: "rgb(var(--c-border) / 0.15)" }}
      >
        <p
          className="font-mono text-[7.5px] uppercase tracking-[0.4em] mb-3"
          style={{ color: "rgb(var(--c-muted) / 0.5)" }}
        >
          Pessoal
        </p>
        <h1
          className="font-display text-4xl md:text-5xl leading-none"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text))" }}
        >
          Quadro
        </h1>
        <p
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgb(var(--c-muted) / 0.55)" }}
        >
          Moodboard · Quadro dos sonhos · Controle de projetos
        </p>
      </div>

      <div
        className="flex flex-col items-center justify-center py-32"
        style={{ color: "rgb(var(--c-muted) / 0.3)" }}
      >
        <span className="font-mono text-3xl mb-6">◈</span>
        <p className="font-mono text-[9px] uppercase tracking-[0.35em]">
          Em desenvolvimento
        </p>
        <p
          className="mt-2 font-mono text-[8px] tracking-[0.15em] text-center max-w-xs"
          style={{ color: "rgb(var(--c-muted) / 0.22)" }}
        >
          Moodboard · visão de futuro · controle de projetos · cadernos e anotações
        </p>
      </div>
    </main>
  )
}
