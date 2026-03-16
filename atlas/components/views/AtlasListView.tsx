"use client"

import type { AtlasItemWithTags } from "@/atlas/types"
import { ItemCard } from "@/atlas/components/ui/ItemCard"

type AtlasListViewProps = {
  items: AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

export function AtlasListView({ items, onItemClick }: AtlasListViewProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div
          key={item.id}
          className="stagger-item"
          style={{ "--stagger-delay": `${i * 35}ms` } as React.CSSProperties}
        >
          <ItemCard item={item} onClick={onItemClick} />
        </div>
      ))}
    </div>
  )
}
