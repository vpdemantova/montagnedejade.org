import { findPinned } from "@/atlas/lib/db"
import { DisplayClient } from "@/atlas/components/views/DisplayClient"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Display — Portal Solar",
}

export default async function DisplayPage() {
  const items = await findPinned().catch(() => [])
  return <DisplayClient items={items} />
}
