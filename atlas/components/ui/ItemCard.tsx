"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS, STATUS_LABELS } from "@/atlas/types"
import { Tag } from "./Tag"

type ItemCardProps = {
  item: AtlasItemWithTags
  onClick?: (item: AtlasItemWithTags) => void
}

function itemCode(id: string): string {
  const n = Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
  return `SOL-${n.toString().padStart(3, "0")}`
}

function parseMetadata(raw?: string | null) {
  if (!raw) return {} as Record<string, unknown>
  try { return JSON.parse(raw) as Record<string, unknown> } catch { return {} }
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const areaLabel   = AREA_LABELS[item.area as keyof typeof AREA_LABELS]   ?? item.area
  const typeLabel   = TYPE_LABELS[item.type as keyof typeof TYPE_LABELS]   ?? item.type
  const statusLabel = STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] ?? item.status
  const code        = itemCode(item.id)

  const isFavorite = item.status === "FAVORITE"
  const isActive   = item.status === "ACTIVE"

  const meta     = parseMetadata(item.metadata)
  const imageUrl = ((item as Record<string, unknown>).coverImage ?? meta.imageUrl ?? meta.coverImage ?? "") as string

  const updatedAt = new Date(item.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  })

  return (
    <article
      onClick={() => onClick?.(item)}
      className="
        group hover:bg-solar-surface/30
        transition-solar cursor-pointer overflow-hidden
        stagger-item
      "
      style={{ animationDelay: "var(--stagger-delay, 0ms)" }}
    >
      {/* Cover image */}
      {imageUrl && (
        <div className="aspect-[16/6] overflow-hidden bg-solar-surface/30">
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
        </div>
      )}

      {/* Barra de metadados */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-solar-border/30">
        <span className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/75">
          {areaLabel}
          <span className="mx-1 text-solar-border">·</span>
          {typeLabel}
        </span>
        <span className="text-[9px] font-mono text-solar-muted/55 tracking-wider">
          {code}
        </span>
      </div>

      {/* Corpo */}
      <div className="px-3 py-3">
        <h3 className="
          font-display text-solar-text text-[14px] leading-snug mb-2
          group-hover:text-solar-amber-lt transition-solar line-clamp-2
        ">
          {item.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            {item.tags.slice(0, 2).map((tag) => (
              <Tag key={tag.id} name={tag.name} />
            ))}
            {item.tags.length > 2 && (
              <span className="text-[9px] font-mono text-solar-muted/40">
                +{item.tags.length - 2}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            {isFavorite && (
              <span className="text-solar-amber text-[9px]">★</span>
            )}
            <span className="text-[9px] font-mono text-solar-muted/65">{updatedAt}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
