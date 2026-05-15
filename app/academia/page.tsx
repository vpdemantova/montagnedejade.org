import { findAll }         from "@/atlas/lib/db"
import { AcademiaClient } from "@/atlas/components/portal/AcademiaClient"
import { ReopenEntryCard } from "@/atlas/components/ui/ReopenEntryCard"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Academia — Portal Solar",
}

export default async function AcademiaPage() {
  // Livros para a seção de Curadoria (dialoga com o Atlas)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const books = await findAll({ area: "BIBLIOTECA" as any, type: "READING" as any, limit: 20 }).catch(() => [])

  return (
    <div className="min-h-screen relative">
      {/* Grade de fundo */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(42,30,12,0.05) 1px, transparent 1px)",
          backgroundSize:  "80px 100%",
        }}
      />

      {/* Botão para rever card — canto superior direito */}
      <div className="absolute top-2 right-0 z-50 pr-4">
        <ReopenEntryCard />
      </div>

      {/* Cliente com menu dinâmico e todas as seções */}
      <div className="relative z-10">
        <AcademiaClient books={books} />
      </div>
    </div>
  )
}
