"use client"

import { useState } from "react"
import { MarkdownRender } from "./MarkdownRender"

type Tab = "visao" | "arquitetura" | "stack"

type Doc = {
  key: Tab
  label: string
  content: string
}

const TAB_LABELS: Record<Tab, string> = {
  visao:       "Visão & Manifesto",
  arquitetura: "Arquitetura",
  stack:       "Stack",
}

export function SobreClient({ docs }: { docs: Doc[] }) {
  const [active, setActive] = useState<Tab>("visao")

  const current = docs.find((d) => d.key === active)

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Tabs */}
      <div className="flex gap-0 border-b border-solar-border/20 flex-shrink-0">
        {docs.map((doc) => (
          <button
            key={doc.key}
            onClick={() => setActive(doc.key)}
            className={`
              px-5 py-3 text-[11px] font-mono uppercase tracking-widest transition-colors
              ${active === doc.key
                ? "text-solar-text border-b-2 border-solar-accent -mb-px"
                : "text-solar-text/35 hover:text-solar-text/60"
              }
            `}
          >
            {TAB_LABELS[doc.key]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {current && <MarkdownRender content={current.content} />}
        </div>
      </div>

    </div>
  )
}
