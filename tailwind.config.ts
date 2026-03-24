import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./atlas/**/*.{js,ts,jsx,tsx,mdx}",
    "./studio/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs:  "480px",
      sm:  "640px",
      md:  "768px",
      lg:  "1024px",
      xl:  "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // ── Fundos ────────────────────────────────────────────────────────────
        "solar-void":         "rgb(var(--c-void)    / <alpha-value>)",
        "solar-deep":         "rgb(var(--c-deep)    / <alpha-value>)",
        "solar-surface":      "rgb(var(--c-surface) / <alpha-value>)",
        "solar-border":       "rgb(var(--c-border)  / <alpha-value>)",

        // ── Acento Principal (violet) ─────────────────────────────────────────
        "solar-amber":        "rgb(var(--c-accent)    / <alpha-value>)",
        "solar-amber-lt":     "rgb(var(--c-accent-lt) / <alpha-value>)",
        "solar-accent":       "rgb(var(--c-accent)    / <alpha-value>)",
        "solar-accent-lt":    "rgb(var(--c-accent-lt) / <alpha-value>)",

        // ── Acento Secundário (teal) ──────────────────────────────────────────
        "solar-teal":         "rgb(var(--c-teal)    / <alpha-value>)",
        "solar-teal-lt":      "rgb(var(--c-teal-lt) / <alpha-value>)",

        // ── Texto ─────────────────────────────────────────────────────────────
        "solar-text":         "rgb(var(--c-text)  / <alpha-value>)",
        "solar-muted":        "rgb(var(--c-muted) / <alpha-value>)",

        // ── Numita Compass (teal) ─────────────────────────────────────────────
        "compass-neon":       "rgb(var(--c-teal)    / <alpha-value>)",
        "compass-neon-dim":   "rgb(var(--c-teal-lt) / <alpha-value>)",
        "compass-neon-glow":  "rgb(var(--c-teal) / 0.15)",

        // ── Áreas do Atlas ────────────────────────────────────────────────────
        "area-academia":      "#C8A45A",
        "area-artes":         "#4A7C6F",
        "area-cultura":       "#4A6C7C",
        "area-studio":        "#7C4A7C",
        "area-obras":         "#8C6D3F",
        "area-pessoas":       "#6B7C8C",
        "area-compass":       "rgb(var(--c-teal) / <alpha-value>)",

        // ── Fixas ─────────────────────────────────────────────────────────────
        "solar-green":        "#4A7C6F",
        "solar-red":          "#8B3A3A",
      },
      fontFamily: {
        sans:    ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono:    ["var(--font-ibm-plex-mono)", "JetBrains Mono", "'Courier New'", "monospace"],
        body:    ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-violet": "0 0 20px rgb(110 86 207 / 0.35), 0 0 60px rgb(110 86 207 / 0.15)",
        "glow-teal":   "0 0 20px rgb(0 200 180 / 0.35), 0 0 60px rgb(0 200 180 / 0.15)",
        "card":        "0 1px 3px rgb(0 0 0 / 0.4), 0 4px 16px rgb(0 0 0 / 0.3)",
        "card-hover":  "0 4px 24px rgb(0 0 0 / 0.5), 0 0 0 1px rgb(110 86 207 / 0.2)",
        "elevated":    "0 8px 32px rgb(0 0 0 / 0.6), 0 2px 8px rgb(0 0 0 / 0.4)",
        "inner-glow":  "inset 0 1px 0 rgb(255 255 255 / 0.06)",
      },
      animation: {
        "fade-in":       "fade-in 0.3s ease-out",
        "fade-up":       "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up":      "slide-up 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1)",
        "slide-out-right": "slide-out-right 0.25s cubic-bezier(0.4,0,0.2,1)",
        "pulse-slow":    "pulse 3s ease-in-out infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "float":         "float 6s ease-in-out infinite",
        "glow-pulse":    "glow-pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
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
        "shimmer": {
          from: { backgroundPosition: "200% center" },
          to:   { backgroundPosition: "-200% center" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%":      { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        solar:      "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart":"cubic-bezier(0.25, 1, 0.5, 1)",
        spring:     "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}

export default config
