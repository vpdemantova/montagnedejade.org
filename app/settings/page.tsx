import { SettingsClient } from "@/atlas/components/settings/SettingsClient"
import { countByArea } from "@/atlas/lib/db"

export const metadata = { title: "Configurações — Portal Solar" }

export default async function SettingsPage() {
  const areaCounts = await countByArea()
  const total = Object.values(areaCounts).reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />
      <SettingsClient areaCounts={areaCounts} total={total} />
    </>
  )
}
