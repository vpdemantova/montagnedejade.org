"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, FileText, Music, Video, File as FileIcon } from "lucide-react"
import type { AssetWithLinks } from "@/atlas/types"
import type { SearchableItem } from "@/atlas/components/ui/ItemSearchInput"
import { AssetDrawer } from "@/atlas/components/ui/AssetDrawer"

type DirectoryClientProps = {
  assets:      AssetWithLinks[]
  initialKind?: string
}

const KIND_TABS = [
  { value: "",         label: "Todos"      },
  { value: "IMAGE",    label: "Imagens"    },
  { value: "AUDIO",    label: "Áudio"      },
  { value: "VIDEO",    label: "Vídeo"      },
  { value: "PDF",      label: "PDF"        },
  { value: "DOCUMENT", label: "Documentos" },
  { value: "OTHER",    label: "Outros"     },
]

function KindIcon({ kind }: { kind: string }) {
  if (kind === "AUDIO") return <Music size={22} />
  if (kind === "VIDEO") return <Video size={22} />
  if (kind === "PDF" || kind === "DOCUMENT") return <FileText size={22} />
  return <FileIcon size={22} />
}

export function DirectoryClient({ assets: initialAssets, initialKind }: DirectoryClientProps) {
  const router = useRouter()
  const [assets, setAssets]     = useState(initialAssets)
  const [kindFilter, setKindFilter] = useState(initialKind ?? "")
  const [activeAsset, setActiveAsset] = useState<AssetWithLinks | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = kindFilter ? assets.filter((a) => a.kind === kindFilter) : assets

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      await fetch("/api/assets", { method: "POST", body: formData }).catch(() => {})
    }
    setUploading(false)
    router.refresh()
    const res = await fetch("/api/assets?limit=500")
    if (res.ok) setAssets(await res.json())
  }

  const deleteAsset = async (id: string) => {
    await fetch(`/api/assets/${id}`, { method: "DELETE" })
    setAssets((prev) => prev.filter((a) => a.id !== id))
    setActiveAsset(null)
  }

  const handleLinked = (assetId: string, item: SearchableItem) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? { ...a, links: [...a.links, { id: `${assetId}-${item.id}`, assetId, itemId: item.id, role: "attachment", createdAt: new Date(), item }] }
          : a
      )
    )
    setActiveAsset((prev) => prev && { ...prev, links: [...prev.links, { id: `${assetId}-${item.id}`, assetId, itemId: item.id, role: "attachment", createdAt: new Date(), item }] })
  }

  const handleUnlinked = (assetId: string, itemId: string) => {
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, links: a.links.filter((l) => l.item.id !== itemId) } : a)))
    setActiveAsset((prev) => prev && { ...prev, links: prev.links.filter((l) => l.item.id !== itemId) })
  }

  return (
    <div className="page-standard py-6">
      <div className="tab-bar mb-5">
        {KIND_TABS.map((t) => (
          <button key={t.value} onClick={() => setKindFilter(t.value)} className={`tab ${kindFilter === t.value ? "active" : ""}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 h-28 mb-6 border border-dashed rounded-[6px] cursor-pointer transition-colors
          ${dragOver ? "border-solar-accent/60 bg-solar-accent/5" : "border-solar-border/30 hover:border-solar-border/50"}`}
      >
        <UploadCloud size={20} className="text-solar-muted/50" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-solar-muted/45">
          {uploading ? "Enviando..." : "Arraste arquivos ou clique para enviar"}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 border border-dashed border-solar-border/25 rounded-[6px]">
          <p className="editorial-label text-solar-muted/40">Nenhum arquivo encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((asset) => (
            <article
              key={asset.id}
              onClick={() => setActiveAsset(asset)}
              className="group cursor-pointer border border-solar-border/25 rounded-[6px] bg-solar-deep/50 overflow-hidden hover:border-solar-border/50 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              <div className="aspect-square bg-solar-void/40 flex items-center justify-center text-solar-muted/40 overflow-hidden">
                {asset.kind === "IMAGE" ? (
                  <img src={asset.path} alt={asset.originalName} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <KindIcon kind={asset.kind} />
                )}
              </div>
              <div className="px-2.5 py-2">
                <p className="font-mono text-[9px] text-solar-text/75 truncate">{asset.title || asset.originalName}</p>
                {asset.links.length > 0 && (
                  <p className="font-mono text-[7.5px] text-solar-muted/40 mt-0.5">{asset.links.length} vínculo{asset.links.length > 1 ? "s" : ""}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <AssetDrawer
        asset={activeAsset}
        onClose={() => setActiveAsset(null)}
        onDelete={deleteAsset}
        onLinked={handleLinked}
        onUnlinked={handleUnlinked}
      />
    </div>
  )
}
