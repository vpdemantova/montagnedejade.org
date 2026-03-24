"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

import { useSolarStore } from "@/atlas/lib/store"
import { BottomNav }          from "./BottomNav"
import { OnboardingOverlay }  from "./OnboardingOverlay"

// ── Mode CSS tokens ───────────────────────────────────────────────────────────
//
// Each mode overrides ALL --c-* variables (raw RGB triplets used by Tailwind's
// solar-* color classes via `rgb(var(--c-*) / alpha)`) AND the --mode-* layout
// variables. This ensures text-solar-text, bg-solar-deep, etc. automatically
// inherit the correct palette in every mode.

const MODE_VARS: Record<string, React.CSSProperties> = {

  // ── FOCUS — paper/light reading ───────────────────────────────────────────
  FOCUS: {
    // Palette — raw RGB triplets for Tailwind
    "--c-void":       "250 250 248",  // near-white paper
    "--c-deep":       "240 240 237",
    "--c-surface":    "228 227 223",
    "--c-border":     "196 194 189",
    "--c-text":       "26 26 26",     // near-black
    "--c-muted":      "100 98 92",
    "--c-accent":     "110 86 207",   // same violet accent
    "--c-accent-lt":  "140 116 237",
    "--c-teal":       "0 148 128",
    "--c-teal-lt":    "0 178 158",
    // Layout
    "--mode-bg":          "rgb(var(--c-void))",
    "--mode-text":        "rgb(var(--c-text))",
    "--mode-accent":      "rgb(var(--c-accent))",
    "--mode-muted":       "rgb(var(--c-muted))",
    "--mode-border":      "rgb(var(--c-border))",
    "--mode-max-width":   "680px",
    "--mode-font-size":   "18px",
    "--mode-line-height": "1.8",
    "--mode-font":        "var(--font-sans)",
  } as React.CSSProperties,

  // ── CONTEMPLATION — deep night reading ────────────────────────────────────
  CONTEMPLATION: {
    // Palette
    "--c-void":       "14 11 24",     // very dark indigo
    "--c-deep":       "20 16 34",
    "--c-surface":    "30 25 48",
    "--c-border":     "50 48 70",
    "--c-text":       "232 228 220",
    "--c-muted":      "138 134 120",
    "--c-accent":     "110 86 207",
    "--c-accent-lt":  "150 120 230",
    "--c-teal":       "0 200 180",
    "--c-teal-lt":    "0 230 210",
    // Layout
    "--mode-bg":          "rgb(var(--c-void))",
    "--mode-text":        "rgb(var(--c-text))",
    "--mode-accent":      "rgb(var(--c-accent))",
    "--mode-muted":       "rgb(var(--c-muted))",
    "--mode-border":      "rgb(var(--c-border))",
    "--mode-max-width":   "62ch",
    "--mode-font-size":   "19px",
    "--mode-line-height": "2.0",
    "--mode-font":        "var(--font-sans)",
  } as React.CSSProperties,

  // ── ATLAS — default dark cosmos ───────────────────────────────────────────
  ATLAS: {
    // Palette — same as global :root defaults, explicit so switching back works
    "--c-void":       "13 13 15",
    "--c-deep":       "19 19 26",
    "--c-surface":    "28 28 38",
    "--c-border":     "42 42 58",
    "--c-text":       "232 228 220",
    "--c-muted":      "138 134 120",
    "--c-accent":     "110 86 207",
    "--c-accent-lt":  "150 120 230",
    "--c-teal":       "0 200 180",
    "--c-teal-lt":    "0 230 210",
    // Layout
    "--mode-bg":          "rgb(var(--c-void))",
    "--mode-text":        "rgb(var(--c-text))",
    "--mode-accent":      "rgb(var(--c-accent))",
    "--mode-muted":       "rgb(var(--c-muted))",
    "--mode-border":      "rgb(var(--c-border) / 0.3)",
    "--mode-max-width":   "72rem",
    "--mode-font-size":   "14px",
    "--mode-line-height": "1.6",
    "--mode-font":        "var(--font-sans)",
  } as React.CSSProperties,

  // ── PUBLIC — same as ATLAS ────────────────────────────────────────────────
  PUBLIC: {
    "--c-void":       "13 13 15",
    "--c-deep":       "19 19 26",
    "--c-surface":    "28 28 38",
    "--c-border":     "42 42 58",
    "--c-text":       "232 228 220",
    "--c-muted":      "138 134 120",
    "--c-accent":     "110 86 207",
    "--c-accent-lt":  "150 120 230",
    "--c-teal":       "0 200 180",
    "--c-teal-lt":    "0 230 210",
    // Layout
    "--mode-bg":          "rgb(var(--c-void))",
    "--mode-text":        "rgb(var(--c-text))",
    "--mode-accent":      "rgb(var(--c-accent))",
    "--mode-muted":       "rgb(var(--c-muted))",
    "--mode-border":      "rgb(var(--c-border) / 0.3)",
    "--mode-max-width":   "72rem",
    "--mode-font-size":   "14px",
    "--mode-line-height": "1.6",
    "--mode-font":        "var(--font-sans)",
  } as React.CSSProperties,
}

// ── Contemplation: reading progress bar ───────────────────────────────────────

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-px bg-transparent">
      <div
        className="h-full transition-[width] duration-100"
        style={{ width: `${progress}%`, background: "var(--mode-accent, #C8A45A)" }}
      />
    </div>
  )
}

// ── Contemplation: GSAP paragraph reveal ─────────────────────────────────────

function ContemplationReveal() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)

      const paras = document.querySelectorAll("[data-mode-shell] p, [data-mode-shell] h1, [data-mode-shell] h2, [data-mode-shell] h3")

      gsap.fromTo(paras,
        { opacity: 0, y: 12 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.05,
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            toggleActions: "play none none none",
          },
        }
      )

      cleanup = () => ScrollTrigger.getAll().forEach((t) => t.kill())
    }).catch(console.error)

    return () => cleanup?.()
  }, [])

  return <div ref={containerRef} />
}

// ── Public header ─────────────────────────────────────────────────────────────

function PublicHeader() {
  return (
    <header className="border-b border-solar-border/30 bg-solar-deep/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-display text-[20px] text-solar-text/90 tracking-tight">Portal Solar</span>
          <span className="text-[9px] font-mono text-solar-muted/40 uppercase tracking-widest">
            Ecossistema de Conhecimento
          </span>
        </div>
        <nav className="flex items-center gap-5">
          {[
            { href: "/",              label: "Home"    },
            { href: "/portal/vilas",  label: "Vilas"   },
            { href: "/portal/cultura",label: "Cultura" },
            { href: "/atlas",         label: "Atlas"   },
            { href: "/world",         label: "World"   },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[10px] font-mono text-solar-muted/60 hover:text-solar-amber transition-solar uppercase tracking-widest"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/atlas"
            className="px-3 py-1.5 border border-solar-amber/40 text-[9px] font-mono text-solar-amber hover:bg-solar-amber/10 transition-solar uppercase tracking-widest"
          >
            Entrar no Atlas
          </a>
        </nav>
      </div>
    </header>
  )
}

// ── Focus mode footer ─────────────────────────────────────────────────────────

function FocusFooter({ title }: { title: string }) {
  const [stats, setStats] = useState({ words: 0, minutes: 1 })

  useEffect(() => {
    const countWords = () => {
      const text = document.querySelector("[data-mode-shell]")?.textContent ?? ""
      const words = text.trim().split(/\s+/).filter(Boolean).length
      setStats({ words, minutes: Math.max(1, Math.round(words / 200)) })
    }
    countWords()
    const observer = new MutationObserver(countWords)
    const el = document.querySelector("[data-mode-shell]")
    if (el) observer.observe(el, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-between px-10 py-3"
      style={{ background: "var(--mode-bg)", borderTop: "1px solid var(--mode-border)" }}
    >
      <span className="text-[10px] font-mono truncate max-w-xs" style={{ color: "var(--mode-muted)" }}>
        {title}
      </span>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono" style={{ color: "var(--mode-muted)" }}>
          {stats.words} palavras
        </span>
        <span className="text-[10px] font-mono" style={{ color: "var(--mode-muted)" }}>
          ~{stats.minutes} min
        </span>
      </div>
    </div>
  )
}

// ── Main shell ────────────────────────────────────────────────────────────────

export function ModeAwareShell({ children }: { children: React.ReactNode }) {
  const { mode, setMode, pushVisited } = useSolarStore()
  const pathname = usePathname()

  // Track visited routes
  useEffect(() => { pushVisited(pathname) }, [pathname, pushVisited])

  // Contemplation cursor tracking
  useEffect(() => {
    if (mode !== "CONTEMPLATION") return
    const onMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`)
      document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mode])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return
      if (!e.shiftKey) return
      if (e.key === "F" || e.key === "f") { e.preventDefault(); setMode("FOCUS") }
      if (e.key === "C" || e.key === "c") { e.preventDefault(); setMode("CONTEMPLATION") }
      if (e.key === "A" || e.key === "a") { e.preventDefault(); setMode("ATLAS") }
      if (e.key === "P" || e.key === "p") { e.preventDefault(); setMode("PUBLIC") }
      if (e.key === "Escape" && mode !== "ATLAS") setMode("ATLAS")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [mode, setMode])

  const isFocus        = mode === "FOCUS"
  const isContemplation = mode === "CONTEMPLATION"
  const isPublic        = mode === "PUBLIC"

  // Extract page title from DOM for Focus footer
  const [pageTitle, setPageTitle] = useState("")
  useEffect(() => {
    const el = document.querySelector("h1")
    setPageTitle(el?.textContent ?? document.title)
  }, [pathname])

  const modeVars = MODE_VARS[mode] ?? MODE_VARS.ATLAS!

  return (
    <div
        data-mode={mode}
        style={{
          ...modeVars,
          background: `var(--mode-bg)`,
          color:      `var(--mode-text)`,
          minHeight:  "100vh",
          transition: "background 0.4s ease, color 0.4s ease",
          position:   "relative",
          overflow:   "hidden",
        }}
      >
        {/* Ambient gradient orbs — Atlas / Contemplation only */}
        {!isFocus && (
          <>
            <div
              aria-hidden
              style={{
                position: "fixed",
                top: "-200px",
                left: "-200px",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(110,86,207,0.10) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(40px)",
                zIndex: 0,
              }}
            />
            <div
              aria-hidden
              style={{
                position: "fixed",
                bottom: "-150px",
                right: "-150px",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,200,180,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
                filter: "blur(40px)",
                zIndex: 0,
              }}
            />
          </>
        )}

        {/* Reading progress bar — Contemplation only */}
        {isContemplation && <ReadingProgressBar />}
        {isContemplation && <ContemplationReveal />}

        {/* Public header — topo em mobile quando modo Public */}
        {isPublic && (
          <div className="lg:hidden">
            <PublicHeader />
          </div>
        )}

        {/* Cursor dot — Contemplation */}
        {isContemplation && (
          <style>{`
            *, *::before, *::after { cursor: none !important; }
            body::after {
              content: '';
              position: fixed;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #6E56CF;
              pointer-events: none;
              z-index: 9999;
              transform: translate(-50%, -50%);
              transition: opacity 0.2s;
              top: var(--cursor-y, 50%);
              left: var(--cursor-x, 50%);
            }
          `}</style>
        )}

        {/* Main content */}
        <div
          data-mode-shell
          className={`
            transition-all duration-300
            ${isFocus || isContemplation
              ? "flex flex-col items-center py-12 px-6"
              : ""}
            pb-24
          `}
        >
          {(isFocus || isContemplation) ? (
            /* Centered narrow column for reading/writing */
            <div
              className="w-full"
              style={{
                maxWidth:    `var(--mode-max-width)`,
                fontSize:    `var(--mode-font-size)`,
                lineHeight:  `var(--mode-line-height)`,
                fontFamily:  `var(--mode-font)`,
              }}
            >
              {children}
            </div>
          ) : (
            children
          )}
        </div>

        {/* Focus mode footer */}
        {isFocus && <FocusFooter title={pageTitle} />}

        {/* BottomNav — mobile only (md:hidden está no próprio componente) */}
        <BottomNav />

        {/* Onboarding — shows only on first visit */}
        <OnboardingOverlay />
      </div>
  )
}
