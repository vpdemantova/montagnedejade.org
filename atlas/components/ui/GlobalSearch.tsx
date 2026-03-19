"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useGlobalSearch } from "@/atlas/hooks/useGlobalSearch"
import type { SearchResult } from "@/atlas/types"
import { AREA_LABELS } from "@/atlas/types"

// ── Mode hint ─────────────────────────────────────────────────────────────────

const MODE_HINTS = {
  normal:  null,
  notas:   "Buscando em Notas",
  autores: "Buscando em Pessoas",
  tag:     "Buscando por Tag",
}

// ── Result row ────────────────────────────────────────────────────────────────

function ResultRow({
  result,
  isActive,
  onClick,
  onHover,
}: {
  result:   SearchResult
  isActive: boolean
  onClick:  () => void
  onHover:  () => void
}) {
  const { item } = result
  const isCompass = item.hemisphere === "COMPASS"
  const accentCls = isCompass ? "text-compass-neon" : "text-solar-amber"

  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
        ${isActive ? "bg-solar-surface/60" : "hover:bg-solar-surface/30"}`}
    >
      {/* Active indicator */}
      <span className={`w-0.5 h-4 flex-shrink-0 rounded-full transition-colors
        ${isActive ? (isCompass ? "bg-compass-neon" : "bg-solar-amber") : "bg-transparent"}`}
      />

      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-mono truncate ${isActive ? "text-solar-text" : "text-solar-text/80"}`}>
          {item.title}
        </p>
        <p className="text-[8px] font-mono text-solar-muted/40 uppercase tracking-widest">
          {AREA_LABELS[item.area] ?? item.area} · {item.type}
        </p>
      </div>

      {item.tags.slice(0, 2).map((t) => (
        <span key={t.id} className={`text-[8px] font-mono uppercase tracking-widest ${accentCls} opacity-50`}>
          #{t.name}
        </span>
      ))}

      {isActive && (
        <span className="text-[8px] font-mono text-solar-muted/40 flex-shrink-0">↵</span>
      )}
    </button>
  )
}

// ── Group label ───────────────────────────────────────────────────────────────

function GroupLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-solar-border/20 bg-solar-deep/30">
      <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-solar-muted/40">{label}</span>
      <span className="text-[8px] font-mono text-solar-muted/25">{count}</span>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function GlobalSearch() {
  const router                                      = useRouter()
  const { open, close, query, setQuery, grouped, mode, loaded } = useGlobalSearch()
  const inputRef                                    = useRef<HTMLInputElement>(null)
  const listRef                                     = useRef<HTMLDivElement>(null)

  // Flat list of results for keyboard nav
  const flat: SearchResult[] = [...grouped.portal, ...grouped.compass]
  const [activeIdx, setActiveIdx] = useState(0)

  // Reset active idx when results change
  useEffect(() => { setActiveIdx(0) }, [query])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else setQuery("")
  }, [open, setQuery])

  const navigate = useCallback((result: SearchResult) => {
    const { item } = result
    const base = item.hemisphere === "COMPASS"
      ? item.area === "NOTAS"   ? "/compass/notas"
      : item.area === "DIARIO"  ? "/compass/diario"
      : "/compass"
      : "/atlas"
    router.push(`${base}/${item.id}`)
    close()
  }, [router, close])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flat.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === "Enter" && flat[activeIdx]) navigate(flat[activeIdx]!)
    if (e.key === "Escape") close()
  }, [flat, activeIdx, navigate, close])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  const modeHint = MODE_HINTS[mode.type]
  const totalCount = flat.length

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-solar-void/70 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl"
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.0, 0.0, 0.2, 1] }}
          >
            <div className="border border-solar-border/50 bg-solar-deep/95 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-solar-border/30">
                <span className="text-solar-muted/40 font-mono text-sm flex-shrink-0">⌘K</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar… › notas  @ autores  # tag"
                  className="flex-1 bg-transparent text-[13px] font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none"
                />
                {modeHint && (
                  <span className="text-[8px] font-mono text-solar-amber/70 uppercase tracking-widest flex-shrink-0">
                    {modeHint}
                  </span>
                )}
                {!loaded && query && (
                  <span className="text-[8px] font-mono text-solar-muted/40 animate-pulse">carregando…</span>
                )}
              </div>

              {/* Results */}
              {query.trim() && (
                <div ref={listRef} className="max-h-80 overflow-y-auto">
                  {totalCount === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[10px] font-mono text-solar-muted/40">
                        Nenhum resultado para &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <>
                      {grouped.portal.length > 0 && (
                        <div>
                          <GroupLabel label="Portal Solar" count={grouped.portal.length} />
                          {grouped.portal.map((r, i) => (
                            <div key={r.item.id} data-idx={i}>
                              <ResultRow
                                result={r}
                                isActive={activeIdx === i}
                                onClick={() => navigate(r)}
                                onHover={() => setActiveIdx(i)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {grouped.compass.length > 0 && (
                        <div>
                          <GroupLabel label="Numita Compass" count={grouped.compass.length} />
                          {grouped.compass.map((r, i) => {
                            const globalIdx = grouped.portal.length + i
                            return (
                              <div key={r.item.id} data-idx={globalIdx}>
                                <ResultRow
                                  result={r}
                                  isActive={activeIdx === globalIdx}
                                  onClick={() => navigate(r)}
                                  onHover={() => setActiveIdx(globalIdx)}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Footer shortcuts */}
              {!query.trim() && (
                <div className="px-4 py-3 flex items-center gap-4 border-t border-solar-border/20">
                  {[
                    { key: "›",  hint: "notas" },
                    { key: "@",  hint: "autores" },
                    { key: "#",  hint: "tag" },
                    { key: "↑↓", hint: "navegar" },
                    { key: "↵",  hint: "abrir" },
                    { key: "Esc",hint: "fechar" },
                  ].map(({ key, hint }) => (
                    <div key={key} className="flex items-center gap-1">
                      <kbd className="text-[8px] font-mono px-1 py-0.5 bg-solar-surface/50 border border-solar-border/40 text-solar-muted/60">
                        {key}
                      </kbd>
                      <span className="text-[8px] font-mono text-solar-muted/35">{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
