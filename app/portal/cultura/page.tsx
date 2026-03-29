import { findAllNotices } from "@/atlas/lib/db"
import { findAll }        from "@/atlas/lib/db"
import { CulturaClient }  from "@/atlas/components/portal/CulturaClient"

export const dynamic = 'force-dynamic'

export default async function CulturaPage() {
  const [notices, eventos] = await Promise.all([
    findAllNotices(50).catch(() => []),
    findAll({ area: "CULTURA", limit: 100 }).catch(() => []),
  ])

  return <CulturaClient notices={notices} eventos={eventos} />
}
