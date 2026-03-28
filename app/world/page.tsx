import { findAll } from "@/atlas/lib/db"
import { WorldClient } from "@/atlas/components/portal/WorldClient"

export const dynamic = 'force-dynamic'
export const metadata = {
  title: "Mundo — Portal Solar",
}

export default async function WorldPage() {
  const [obras, artes, pessoas] = await Promise.all([
    findAll({ area: "OBRAS",   limit: 500 }),
    findAll({ area: "ARTES",   limit: 500 }),
    findAll({ area: "PESSOAS", limit: 500 }),
  ])

  const items = [...obras, ...artes, ...pessoas]

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(42,42,58,0.18) 1px, transparent 1px)",
          backgroundSize: "80px 100%",
        }}
      />
      <WorldClient items={items} />
    </>
  )
}
