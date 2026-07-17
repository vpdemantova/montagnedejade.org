"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import type { AssetWithLinks } from "@/atlas/types"
import { ItemSearchInput, type SearchableItem } from "./ItemSearchInput"

type AssetDrawerProps = {
  asset:      AssetWithLinks | null
  onClose:    () => void
  onDelete:   (id: string) => void
  onLinked:   (assetId: string, item: SearchableItem) => void
  onUnlinked: (assetId: string, itemId: string) => void
}

export function AssetDrawer({ asset, onClose, onDelete, onLinked, onUnlinked }: AssetDrawerProps) {
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (asset) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [asset, onClose])

  useEffect(() => {
    document.body.style.overflow = asset ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [asset])

  if (!asset) return null

  const linkItem = async (item: SearchableItem) => {
    await fetch(`/api/assets/${asset.id}/links`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ itemId: item.id }),
    })
    onLinked(asset.id, item)
    setLinking(false)
  }

  const unlinkItem = async (itemId: string) => {
    await fetch(`/api/assets/${asset.id}/links?itemId=${itemId}`, { method: "DELETE" })
    onUnlinked(asset.id, itemId)
  }

  return (
    <>
      <div className="fixed inset-0 z-[45] bg-solar-void/70" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-[46] w-full max-w-md bg-solar-deep border-l border-solar-border/30 overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-solar-border/25">
          <p className="page-label truncate pr-4">{asset.originalName}</p>
          <button onClick={onClose} aria-label="Fechar" className="text-solar-muted/50 hover:text-solar-text transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div className="aspect-video bg-solar-void/40 flex items-center justify-center border-b border-solar-border/20">
          {asset.kind === "IMAGE" ? (
            <img src={asset.path} alt={asset.originalName} className="w-full h-full object-contain" />
          ) : asset.kind === "AUDIO" ? (
            <audio controls src={asset.path} className="w-11/12" />
          ) : asset.kind === "VIDEO" ? (
            <video controls src={asset.path} className="w-full h-full object-contain" />
          ) : (
            <a href={asset.path} target="_blank" rel="noreferrer" className="font-mono text-xs text-solar-accent underline underline-offset-2">
              Abrir {asset.kind}
            </a>
          )}
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-widest text-solar-muted/45">{asset.kind} · {(asset.size / 1024).toFixed(0)} KB</span>
            <button
              onClick={() => onDelete(asset.id)}
              className="font-mono text-[9px] uppercase tracking-widest text-solar-muted/40 hover:text-red-400 transition-colors"
            >
              Excluir
            </button>
          </div>

          {/* Linked items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[9px] uppercase tracking-widest text-solar-muted/50">
                Vinculado a {asset.links.length > 0 && `· ${asset.links.length}`}
              </p>
              <button
                onClick={() => setLinking((v) => !v)}
                className="font-mono text-[8px] uppercase tracking-widest text-solar-muted/35 hover:text-solar-accent transition-colors"
              >
                {linking ? "Cancelar" : "+ Vincular"}
              </button>
            </div>

            {linking && (
              <div className="mb-3">
                <ItemSearchInput onSelect={linkItem} />
              </div>
            )}

            {asset.links.length === 0 ? (
              <p className="font-mono text-[10px] text-solar-muted/30">Nenhum item vinculado ainda.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {asset.links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 group">
                    <a
                      href={`/atlas/${link.item.slug ?? link.item.id}`}
                      className="flex-1 min-w-0 font-mono text-[10px] text-solar-text/75 hover:text-solar-accent truncate transition-colors"
                    >
                      {link.item.title}
                    </a>
                    <button
                      onClick={() => unlinkItem(link.item.id)}
                      className="font-mono text-[9px] text-solar-muted/25 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
