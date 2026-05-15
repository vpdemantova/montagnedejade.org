import { findAllNotices } from "@/atlas/lib/db"
import { SocialClient }  from "@/atlas/components/portal/SocialClient"

export const dynamic = "force-dynamic"
export const metadata = { title: "Social — Portal Solar" }

export default async function SocialPage() {
  const notices = await findAllNotices(12).catch(() => [])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="ph">
        <div className="page-standard">
          <p className="page-label mb-2">Portal Solar · Rede</p>
          <h1 className="page-title mb-1">Social</h1>
          <p className="page-subtitle">Radar · Feed · Grupos · Crises · Avanços · Comunidade</p>
        </div>
      </header>

      <SocialClient notices={notices} />
    </div>
  )
}
