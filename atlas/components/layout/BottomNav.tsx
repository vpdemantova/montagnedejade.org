"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M17 17l-3.5-3.5" />
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
    </svg>
  )
}
// ── Nav data ───────────────────────────────────────────────────────────────────

const PORTAL_ITEMS = [
  { href: "/",               label: "Hub"     },
  { href: "/atlas",          label: "Atlas"   },
  { href: "/portal/cultura", label: "Cultura" },
]

const COMPASS_ITEMS = [
  { href: "/compass/diario", label: "Diário" },
  { href: "/compass/perfil", label: "Perfil" },
]

// ── Component ──────────────────────────────────────────────────────────────────

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
      style={{ width: "min(520px, calc(100vw - 32px))" }}
    >
      <div
        className="relative flex items-stretch h-14 rounded-2xl overflow-hidden"
        style={{
          background: "rgb(var(--c-deep) / 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgb(var(--c-border) / 0.4)",
          boxShadow: "0 8px 32px rgb(0 0 0 / 0.5), 0 2px 8px rgb(0 0 0 / 0.3), inset 0 1px 0 rgb(255 255 255 / 0.04)",
        }}
      >
        {/* ── LEFT — Portal Solar ── */}
        {PORTAL_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex-1 flex flex-col items-center justify-center gap-1.5 px-2
                transition-all duration-200
                ${active
                  ? "text-solar-accent"
                  : "text-solar-muted/50 hover:text-solar-text/80"
                }
              `}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-xl mx-1 my-1"
                  style={{ background: "rgb(var(--c-accent) / 0.08)" }}
                />
              )}
              <span className="relative text-[9px] font-mono uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* ── CENTER — Actions (isolated pill) ── */}
        <div
          className="flex items-center justify-center gap-5 px-6 mx-1 my-1 rounded-xl"
          style={{
            background: "rgb(var(--c-void) / 0.5)",
            border: "1px solid rgb(var(--c-border) / 0.25)",
          }}
        >
          <button
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
              )
            }
            className="flex items-center justify-center text-solar-muted/50 hover:text-solar-text/80 transition-colors duration-200"
          >
            <IconSearch />
          </button>

          <Link
            href="/atlas/novo"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              color: "rgb(var(--c-accent) / 0.9)",
              background: "rgb(var(--c-accent) / 0.15)",
              border: "1px solid rgb(var(--c-accent) / 0.3)",
            }}
          >
            <IconPlus />
          </Link>

          <Link
            href="/settings"
            className="flex items-center justify-center text-solar-muted/50 hover:text-solar-text/80 transition-colors duration-200"
          >
            <IconSettings />
          </Link>
        </div>

        {/* ── RIGHT — Numita Compass ── */}
        {COMPASS_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex-1 flex flex-col items-center justify-center gap-1.5 px-2
                transition-all duration-200
                ${active
                  ? "text-solar-teal"
                  : "text-solar-muted/50 hover:text-solar-text/80"
                }
              `}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-xl mx-1 my-1"
                  style={{ background: "rgb(var(--c-teal) / 0.08)" }}
                />
              )}
              <span className="relative text-[9px] font-mono uppercase tracking-widest">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
