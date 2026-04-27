import { MapaInterior } from "@/atlas/components/compass/MapaInterior"
import { PageHeader } from "@/atlas/components/layout/PageHeader"

export default function MapaPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        label="Numita Compass · Mapa"
        title="Mapa Interior"
        subtitle="Constelação de temas, valores e conexões pessoais"
        size="wide"
      />
      <div className="page-wide py-6">
        <MapaInterior />
      </div>
    </div>
  )
}
