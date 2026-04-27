import { findAll } from "@/atlas/lib/db"
import { WorldClient } from "@/atlas/components/portal/WorldClient"
import { ReopenEntryCard } from "@/atlas/components/ui/ReopenEntryCard"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Academia — Portal Solar",
}

export default async function AcademiaPage() {
  const [obras, artes, pessoas] = await Promise.all([
    findAll({ area: "OBRAS",   limit: 500 }).catch(() => []),
    findAll({ area: "ARTES",   limit: 500 }).catch(() => []),
    findAll({ area: "PESSOAS", limit: 500 }).catch(() => []),
  ])

  const items = [...obras, ...artes, ...pessoas]

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(42,30,12,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 100%",
        }}
      />
      {/* Botão para rever o card de apresentação */}
      <div className="relative z-10 flex justify-end pb-2 pt-4">
        <ReopenEntryCard />
      </div>
      <WorldClient items={items} />
    </>
  )
}
