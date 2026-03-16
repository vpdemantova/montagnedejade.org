import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./atlas/**/*.{js,ts,jsx,tsx,mdx}",
    "./studio/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Fundos ─────────────────────────────────────────────────────────
        "solar-void":         "#0D0D0F", // Fundo principal
        "solar-deep":         "#13131A", // Fundo de painéis
        "solar-surface":      "#1C1C26", // Cards e elementos
        "solar-border":       "#2A2A3A", // Bordas sutis

        // ── Acentos Portal Solar (âmbar) ───────────────────────────────────
        "solar-amber":        "#C8A45A", // Destaque principal (dourado)
        "solar-amber-light":  "#E8C87A", // Hover states
        "solar-accent":       "#4A7C6F", // Verde-musgo (status ativos)

        // ── Acentos Numita Compass (neon) ───────────────────────────────────
        "compass-neon":       "#7CFC6A", // Verde neon suavizado (Compass)
        "compass-neon-dim":   "#4DB84A", // Neon dimmed (textos secundários)
        "compass-neon-glow":  "rgba(124,252,106,0.15)", // Glow do neon

        // ── Texto ──────────────────────────────────────────────────────────
        "solar-text":         "#E8E4DC", // Texto principal
        "solar-muted":        "#8A8678", // Texto secundário

        // ── Áreas do Atlas ─────────────────────────────────────────────────
        "area-academia":      "#C8A45A",
        "area-artes":         "#4A7C6F",
        "area-cultura":       "#4A6C7C",
        "area-studio":        "#7C4A7C",
        "area-obras":         "#8C6D3F",
        "area-pessoas":       "#6B7C8C",
        "area-compass":       "#7CFC6A",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-source-serif)", "Georgia", "serif"],
        mono:    ["var(--font-ibm-plex-mono)", "'Courier New'", "monospace"],
        sans:    ["var(--font-source-serif)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":      "fade-in 0.3s ease-out",
        "slide-up":     "slide-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1)",
        "slide-out-right": "slide-out-right 0.25s cubic-bezier(0.4,0,0.2,1)",
        "pulse-slow":   "pulse 3s ease-in-out infinite",
        "stagger-in":   "fade-in 0.4s ease-out both",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { opacity: "1", transform: "translateX(0)" },
          to:   { opacity: "0", transform: "translateX(100%)" },
        },
      },
      transitionTimingFunction: {
        solar: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
}

export default config
