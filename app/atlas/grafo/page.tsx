import { RelationGraphClient } from "@/atlas/components/views/RelationGraphClient"

export const metadata = { title: "Grafo de Relações — Portal Solar" }

export default function GrafoPage() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-aligned" />
      <RelationGraphClient />
    </>
  )
}
