"use client"

import { useState } from "react"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS } from "@/atlas/types"
import { ItemDrawer } from "@/atlas/components/layout/ItemDrawer"
import { CoverImage } from "@/atlas/components/ui/CoverImage"

type Props = { items: AtlasItemWithTags[] }

function parseMetadata(raw?: string | null) {
  if (!raw) return {} as Record<string, unknown>
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

function itemCode(id: string) {
  const n = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
  return `SOL-${n.toString().padStart(3, "0")}`
}

export function DisplayClient({ items }: Props) {
  const [selected, setSelected] = useState<AtlasItemWithTags | null>(null)

  return (
    <main className="editorial-page">

      {/* Header */}
      <div
        className="py-12 md:py-16 border-b"
        style={{ borderColor: "rgb(var(--c-border) / 0.15)" }}
      >
        <p
          className="font-mono text-[7.5px] uppercase tracking-[0.4em] mb-3"
          style={{ color: "rgb(var(--c-muted) / 0.5)" }}
        >
          Curadoria
        </p>
        <h1
          className="font-display text-4xl md:text-5xl leading-none"
          style={{ letterSpacing: "-0.02em", color: "rgb(var(--c-text))" }}
        >
          Display
        </h1>
        <p
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "rgb(var(--c-muted) / 0.55)" }}
        >
          {items.length} {items.length === 1 ? "item destacado" : "itens destacados"} do Atlas
        </p>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-32"
          style={{ color: "rgb(var(--c-muted) / 0.35)" }}
        >
          <span className="font-mono text-2xl mb-4">★</span>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em]">
            Nenhum item fixado ainda
          </p>
          <p
            className="mt-2 font-mono text-[8px] tracking-[0.15em]"
            style={{ color: "rgb(var(--c-muted) / 0.25)" }}
          >
            Fixe itens no Atlas para exibi-los aqui
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-0 border-b border-solar-border/10">
          {items.map((item, i) => {
            const meta     = parseMetadata(item.metadata)
            const imageUrl = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? meta.coverImage ?? "") as string
            const areaLabel = AREA_LABELS[item.area as keyof typeof AREA_LABELS] ?? item.area
            const code     = itemCode(item.id)

            return (
              <article
                key={item.id}
                onClick={() => setSelected(item)}
                className="group cursor-pointer flex flex-col border-r border-b border-solar-border/15 hover:bg-solar-surface/20 transition-colors duration-150 overflow-hidden"
                style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}
              >
                {/* Imagem / placeholder */}
                <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
                  <CoverImage
                    src={imageUrl}
                    alt={item.title}
                    name={item.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                  />
                  {/* Pin indicator */}
                  <span
                    className="absolute top-2 right-2 font-mono text-[8px]"
                    style={{ color: "rgb(var(--c-accent) / 0.7)" }}
                  >
                    ★
                  </span>
                </div>

                {/* Meta */}
                <div className="flex-1 p-3 flex flex-col gap-1.5">
                  <p
                    className="font-mono text-[7px] uppercase tracking-[0.2em] leading-none"
                    style={{ color: "rgb(var(--c-muted) / 0.45)" }}
                  >
                    {code} · {areaLabel}
                  </p>
                  <h3
                    className="font-display leading-tight line-clamp-2"
                    style={{
                      fontSize: "clamp(0.78rem, 1.5vw, 0.92rem)",
                      color: "rgb(var(--c-text) / 0.85)",
                    }}
                  >
                    {item.title}
                  </h3>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ItemDrawer item={selected} onClose={() => setSelected(null)} />
    </main>
  )
}
