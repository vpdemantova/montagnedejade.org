import { PageHeader } from "@/atlas/components/layout/PageHeader"

export const metadata = {
  title: "Quadro — Portal Solar",
}

export default function QuadroPage() {
  return (
    <main>
      <PageHeader
        label="Pessoal"
        title="Quadro"
        subtitle="Moodboard · Quadro dos sonhos · Controle de projetos"
        size="standard"
      />

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
