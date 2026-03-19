"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { AtlasItemWithTags } from "@/atlas/types"
import { AREA_LABELS, TYPE_LABELS } from "@/atlas/types"

type Props = {
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}

export function IndexView({ items, onItemClick }: Props) {
  // Agrupa: Area → Type → items
  const tree = items.reduce<Record<string, Record<string, AtlasItemWithTags[]>>>(
    (acc, item) => {
      const area = item.area
      const type = item.type
      if (!acc[area]) acc[area] = {}
      if (!acc[area]![type]) acc[area]![type] = []
      acc[area]![type]!.push(item)
      return acc
    },
    {}
  )

  return (
    <div className="flex flex-col border border-solar-border/20">
      {Object.entries(tree).map(([area, types]) => (
        <AreaNode
          key={area}
          area={area}
          types={types}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  )
}

function AreaNode({
  area, types, onItemClick,
}: {
  area:        string
  types:       Record<string, AtlasItemWithTags[]>
  onItemClick: (item: AtlasItemWithTags) => void
}) {
  const [open, setOpen] = useState(true)
  const total = Object.values(types).flat().length

  return (
    <div className="border-b border-solar-border/20 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-solar-surface/20 transition-solar group"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-[10px] text-solar-muted/40 group-hover:text-solar-muted/70"
        >
          ›
        </motion.span>
        <span className="font-display text-solar-text/80 text-sm flex-1 text-left">
          {AREA_LABELS[area] ?? area}
        </span>
        <span className="text-[9px] font-mono text-solar-muted/40">{total}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {Object.entries(types).map(([type, typeItems]) => (
              <TypeNode
                key={type}
                type={type}
                items={typeItems}
                onItemClick={onItemClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TypeNode({
  type, items, onItemClick,
}: {
  type:        string
  items:       AtlasItemWithTags[]
  onItemClick: (item: AtlasItemWithTags) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-b border-solar-border/10 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 pl-10 pr-5 py-2 hover:bg-solar-surface/10 transition-solar group"
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono text-[9px] text-solar-muted/30 group-hover:text-solar-muted/60"
        >
          ›
        </motion.span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-solar-muted/60 flex-1 text-left">
          {TYPE_LABELS[type] ?? type}
        </span>
        <span className="text-[9px] font-mono text-solar-muted/30">{items.length}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className="w-full flex items-center gap-3 pl-16 pr-5 py-1.5 hover:bg-solar-surface/20 transition-solar group text-left"
              >
                <span className="font-mono text-[9px] text-solar-muted/25 flex-shrink-0">—</span>
                <span className="text-[11px] font-mono text-solar-text/75 group-hover:text-solar-text flex-1 truncate transition-solar">
                  {item.title}
                </span>
                <span className="text-[8px] font-mono text-solar-muted/30 flex-shrink-0">
                  {new Date(item.updatedAt).toLocaleDateString("pt-BR")}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
