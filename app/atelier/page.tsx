"use client"

import { useState } from "react"
import Link from "next/link"

// ── Sistema de design — 24 direções ──────────────────────────────────────────

type Style = {
  id:     number
  name:   string
  family: string  // nome da família tipográfica
  desc:   string
  tag:    string  // palavra-chave
  // cores (CSS direto)
  bg:     string
  card:   string
  text:   string
  muted:  string
  accent: string
  border: string
  // tipografia
  headFont: string
  bodyFont: string
  monoFont: string
  headSize: string
  // bordas
  radius: string
  // personalidade
  vibe: string
}

const STYLES: Style[] = [
  // ── CLEAN / MINIMAL ──────────────────────────────────────────────────────────
  {
    id:1, name:"Swiss",       family:"Helvetica Neue",  desc:"Grade internacional, vermelho, estrutura pura",
    tag:"MINIMAL",   vibe:"precision",
    bg:"#f5f5f5",    card:"#ffffff",   text:"#111111",   muted:"#888888",  accent:"#e00000",  border:"#dddddd",
    headFont:"'Helvetica Neue', Arial, sans-serif",  bodyFont:"'Helvetica Neue', Arial, sans-serif",  monoFont:"'Courier New', monospace",
    headSize:"1.4rem", radius:"0",
  },
  {
    id:2, name:"Nordic",      family:"Inter",            desc:"Branco frio, espaço generoso, detalhe mono",
    tag:"MINIMAL",   vibe:"air",
    bg:"#fafafa",    card:"#ffffff",   text:"#1a1a2e",   muted:"#9999aa",  accent:"#3355ff",  border:"#e8e8ee",
    headFont:"'Inter', sans-serif",  bodyFont:"'Inter', sans-serif",  monoFont:"'JetBrains Mono', monospace",
    headSize:"1.3rem", radius:"4px",
  },
  {
    id:3, name:"Japonês",     family:"Cormorant",        desc:"Espaço extremo, linhas finas, serif etéreo",
    tag:"MINIMAL",   vibe:"ma",
    bg:"#f9f8f5",    card:"#f9f8f5",   text:"#2c2c2c",   muted:"#aaaaaa",  accent:"#c8a87a",  border:"#e0ddd6",
    headFont:"'Cormorant Garamond', Georgia, serif",  bodyFont:"'Cormorant Garamond', Georgia, serif",  monoFont:"'Courier New', monospace",
    headSize:"1.6rem", radius:"0",
  },
  {
    id:4, name:"Museu",       family:"DM Serif",         desc:"Branco institucional, acento único, sans austero",
    tag:"MINIMAL",   vibe:"institution",
    bg:"#f8f8f6",    card:"#f0ede8",   text:"#222222",   muted:"#888880",  accent:"#333322",  border:"#e0ddd8",
    headFont:"'DM Serif Display', Georgia, serif",  bodyFont:"'DM Sans', Arial, sans-serif",  monoFont:"'IBM Plex Mono', monospace",
    headSize:"1.5rem", radius:"0",
  },

  // ── EDITORIAL ────────────────────────────────────────────────────────────────
  {
    id:5, name:"Revue",       family:"Playfair",         desc:"Serif elegante, papel creme, ouro, colunas",
    tag:"EDITORIAL", vibe:"elegance",
    bg:"#f5f0e8",    card:"#ede8dc",   text:"#1a1408",   muted:"#786848",  accent:"#b88820",  border:"#d4c8a8",
    headFont:"'Playfair Display', Georgia, serif",  bodyFont:"'Lora', Georgia, serif",  monoFont:"'Courier Prime', monospace",
    headSize:"1.6rem", radius:"0",
  },
  {
    id:6, name:"Literário",   family:"EB Garamond",      desc:"Marfim quente, tipografia de livro, sem bordas",
    tag:"EDITORIAL", vibe:"book",
    bg:"#faf6ee",    card:"#f4ede0",   text:"#1c1408",   muted:"#7a6040",  accent:"#8c5a18",  border:"#e0d0b0",
    headFont:"'EB Garamond', Georgia, serif",  bodyFont:"'EB Garamond', Georgia, serif",  monoFont:"'Courier Prime', monospace",
    headSize:"1.5rem", radius:"0",
  },
  {
    id:7, name:"Acadêmico",   family:"Source Serif",     desc:"Publicação científica, estrutura de coluna",
    tag:"EDITORIAL", vibe:"rigor",
    bg:"#ffffff",    card:"#f8f8f8",   text:"#111111",   muted:"#666666",  accent:"#003388",  border:"#cccccc",
    headFont:"'Source Serif 4', Georgia, serif",  bodyFont:"'Source Sans 3', Arial, sans-serif",  monoFont:"'Source Code Pro', monospace",
    headSize:"1.3rem", radius:"2px",
  },
  {
    id:8, name:"Magazine",    family:"Bebas Neue",       desc:"Editorial escuro, fotos full-bleed, impacto",
    tag:"EDITORIAL", vibe:"bold editorial",
    bg:"#0a0a0a",    card:"#141414",   text:"#f0f0f0",   muted:"#808080",  accent:"#ff3333",  border:"#333333",
    headFont:"'Bebas Neue', 'Arial Black', sans-serif",  bodyFont:"'Inter', Arial, sans-serif",  monoFont:"'Space Mono', monospace",
    headSize:"2.0rem", radius:"0",
  },

  // ── DARK / DRAMATIC ──────────────────────────────────────────────────────────
  {
    id:9, name:"Nocturne",    family:"Fraunces",         desc:"Quase preto, brilho quente, sombras profundas",
    tag:"DARK",      vibe:"depth",
    bg:"#0d0b08",    card:"#16120c",   text:"#e8dcc8",   muted:"#7a6848",  accent:"#c8962a",  border:"#2a220e",
    headFont:"'Fraunces', Georgia, serif",  bodyFont:"'Lora', Georgia, serif",  monoFont:"'JetBrains Mono', monospace",
    headSize:"1.5rem", radius:"0",
  },
  {
    id:10, name:"Terminal",   family:"Space Mono",       desc:"Verde em preto, mono puro, estética de código",
    tag:"DARK",      vibe:"code",
    bg:"#000000",    card:"#050805",   text:"#33ff33",   muted:"#1a7a1a",  accent:"#66ff66",  border:"#0d300d",
    headFont:"'Space Mono', 'Courier New', monospace",  bodyFont:"'Space Mono', 'Courier New', monospace",  monoFont:"'Space Mono', monospace",
    headSize:"1.1rem", radius:"0",
  },
  {
    id:11, name:"Blueprint",  family:"Share Tech Mono",  desc:"Azul naval, grade de engenharia, arquitetônico",
    tag:"DARK",      vibe:"architecture",
    bg:"#0c2044",    card:"#102850",   text:"#dce8ff",   muted:"#7090c0",  accent:"#ffdd44",  border:"#2050a0",
    headFont:"'Share Tech Mono', 'Courier New', monospace",  bodyFont:"'Inter', Arial, sans-serif",  monoFont:"'Share Tech Mono', monospace",
    headSize:"1.2rem", radius:"0",
  },
  {
    id:12, name:"Estúdio",    family:"Plus Jakarta",     desc:"Carvão, ateliê do designer, tátil",
    tag:"DARK",      vibe:"craft",
    bg:"#1a1814",    card:"#222018",   text:"#d8d0c0",   muted:"#8a8070",  accent:"#e8a030",  border:"#383020",
    headFont:"'Plus Jakarta Sans', sans-serif",  bodyFont:"'Inter', Arial, sans-serif",  monoFont:"'JetBrains Mono', monospace",
    headSize:"1.4rem", radius:"3px",
  },

  // ── WARM / ARTISAN ───────────────────────────────────────────────────────────
  {
    id:13, name:"Atelier",    family:"DM Serif",         desc:"Cinza quente, produto físico, orgânico",
    tag:"WARM",      vibe:"tactile",
    bg:"#f2ede6",    card:"#ebe4da",   text:"#2a2018",   muted:"#8a7860",  accent:"#c06030",  border:"#d8ccbc",
    headFont:"'DM Serif Display', Georgia, serif",  bodyFont:"'DM Sans', Arial, sans-serif",  monoFont:"'IBM Plex Mono', monospace",
    headSize:"1.5rem", radius:"2px",
  },
  {
    id:14, name:"Pergaminho+","family":"Cormorant",      desc:"Papel ultra-refinado, manuscrito perfeito",
    tag:"WARM",      vibe:"manuscript",
    bg:"#f8f3e8",    card:"#f0e8d4",   text:"#080502",   muted:"#62461e",  accent:"#764e10",  border:"#d4c49a",
    headFont:"'Cormorant Garamond', Georgia, serif",  bodyFont:"'Cormorant Garamond', Georgia, serif",  monoFont:"'Courier Prime', monospace",
    headSize:"1.8rem", radius:"0",
  },
  {
    id:15, name:"Mediterrâneo","family":"Fraunces",      desc:"Ocre terroso, terracota, artesanato",
    tag:"WARM",      vibe:"terra",
    bg:"#f0e8d8",    card:"#e8dcc8",   text:"#2a1808",   muted:"#9a6840",  accent:"#c04820",  border:"#d0b890",
    headFont:"'Fraunces', Georgia, serif",  bodyFont:"'Lora', Georgia, serif",  monoFont:"'Courier Prime', monospace",
    headSize:"1.5rem", radius:"4px",
  },
  {
    id:16, name:"Botânica",   family:"Cormorant",        desc:"Verde floresta, natural, curvas orgânicas",
    tag:"WARM",      vibe:"nature",
    bg:"#e8f0e4",    card:"#dce8d4",   text:"#0e1e0a",   muted:"#5a7850",  accent:"#2d6820",  border:"#b8d0b0",
    headFont:"'Cormorant Garamond', Georgia, serif",  bodyFont:"'Source Serif 4', Georgia, serif",  monoFont:"'JetBrains Mono', monospace",
    headSize:"1.5rem", radius:"6px",
  },

  // ── BOLD / EXPRESSIVE ────────────────────────────────────────────────────────
  {
    id:17, name:"Brutal",     family:"Bebas Neue",       desc:"Cru, bordas pesadas, preto e branco puro",
    tag:"BOLD",      vibe:"raw",
    bg:"#ffffff",    card:"#ffffff",   text:"#000000",   muted:"#555555",  accent:"#000000",  border:"#000000",
    headFont:"'Bebas Neue', 'Arial Black', Impact, sans-serif",  bodyFont:"'Inter', Arial, sans-serif",  monoFont:"'Courier New', monospace",
    headSize:"2.2rem", radius:"0",
  },
  {
    id:18, name:"Construtivista","family":"Alternate Gothic","desc":"Vermelho/preto, geométrico, impacto total",
    tag:"BOLD",      vibe:"revolution",
    bg:"#f0f0f0",    card:"#e8e8e8",   text:"#111111",   muted:"#666666",  accent:"#cc0000",  border:"#cccccc",
    headFont:"'Barlow Condensed', 'Arial Narrow', sans-serif",  bodyFont:"'Barlow', Arial, sans-serif",  monoFont:"'Space Mono', monospace",
    headSize:"2.0rem", radius:"0",
  },
  {
    id:19, name:"Memphis",    family:"Work Sans",        desc:"Colorido, pós-moderno, formas geométricas",
    tag:"BOLD",      vibe:"play",
    bg:"#fffde8",    card:"#fff8cc",   text:"#1a1a1a",   muted:"#888888",  accent:"#ff6b35",  border:"#ffdd44",
    headFont:"'Work Sans', sans-serif",  bodyFont:"'Work Sans', sans-serif",  monoFont:"'Space Mono', monospace",
    headSize:"1.6rem", radius:"12px",
  },
  {
    id:20, name:"Neon Tokyo", family:"Exo 2",            desc:"Escuro com néons, cyberpunk, futurista",
    tag:"BOLD",      vibe:"cyber",
    bg:"#050510",    card:"#0a0a1a",   text:"#e0e8ff",   muted:"#5060a0",  accent:"#00ffcc",  border:"#1a1a40",
    headFont:"'Exo 2', 'Rajdhani', sans-serif",  bodyFont:"'Inter', Arial, sans-serif",  monoFont:"'Share Tech Mono', monospace",
    headSize:"1.4rem", radius:"4px",
  },

  // ── SOFISTICADO ───────────────────────────────────────────────────────────────
  {
    id:21, name:"Platina",    family:"Italiana",         desc:"Prata, premium, luxo minimal",
    tag:"PREMIUM",   vibe:"luxury",
    bg:"#f4f4f2",    card:"#ededeb",   text:"#1a1a18",   muted:"#9090a0",  accent:"#8090b0",  border:"#d8d8d4",
    headFont:"'Italiana', Georgia, serif",  bodyFont:"'Jost', sans-serif",  monoFont:"'JetBrains Mono', monospace",
    headSize:"1.8rem", radius:"0",
  },
  {
    id:22, name:"Obsidiana",  family:"Cormorant",        desc:"Preto com ouro, joia de alta joalheria",
    tag:"PREMIUM",   vibe:"jewel",
    bg:"#0a0806",    card:"#100c08",   text:"#e8d8a0",   muted:"#7a6030",  accent:"#d4a020",  border:"#2a1c08",
    headFont:"'Cormorant Garamond', Georgia, serif",  bodyFont:"'EB Garamond', Georgia, serif",  monoFont:"'Courier Prime', monospace",
    headSize:"1.8rem", radius:"0",
  },
  {
    id:23, name:"Marfim",     family:"Libre Baskerville","desc":"Creme e preto, elegância pura, sem esforço",
    tag:"PREMIUM",   vibe:"purity",
    bg:"#faf8f3",    card:"#f5f0e8",   text:"#0a0a08",   muted:"#888878",  accent:"#0a0a08",  border:"#e0dcd0",
    headFont:"'Libre Baskerville', Georgia, serif",  bodyFont:"'Libre Baskerville', Georgia, serif",  monoFont:"'Courier Prime', monospace",
    headSize:"1.5rem", radius:"0",
  },
  {
    id:24, name:"Giz",        family:"Spectral",         desc:"Branco suave com carvão, notas de artesão",
    tag:"PREMIUM",   vibe:"handmade",
    bg:"#f8f6f2",    card:"#eeece8",   text:"#1e1c18",   muted:"#7a7868",  accent:"#4a4838",  border:"#d8d4cc",
    headFont:"'Spectral', Georgia, serif",  bodyFont:"'Spectral', Georgia, serif",  monoFont:"'Inconsolata', monospace",
    headSize:"1.5rem", radius:"1px",
  },
]

// ── Mini preview de cada estilo ──────────────────────────────────────────────

function StylePreview({ s, onSelect, selected }: { s: Style; onSelect: (id: number) => void; selected: boolean }) {
  return (
    <button
      onClick={() => onSelect(s.id)}
      className="relative text-left w-full transition-all duration-200"
      style={{
        outline: selected ? `2px solid ${s.accent}` : "2px solid transparent",
        outlineOffset: "3px",
      }}
    >
      <div style={{ background: s.bg, fontFamily: s.bodyFont, overflow: "hidden" }}>

        {/* ── Mini nav ── */}
        <div style={{ background: s.card, borderBottom: `1px solid ${s.border}`, padding: "7px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 8, color: s.accent, fontFamily: s.monoFont }}>☀</span>
            <span style={{ fontSize: 7, color: s.text, fontFamily: s.monoFont, letterSpacing: "0.2em", textTransform: "uppercase" }}>Portal Solar</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["Atlas","Display","≡"].map((l) => (
              <span key={l} style={{ fontSize: 6, color: s.muted, fontFamily: s.monoFont, letterSpacing: "0.15em" }}>{l}</span>
            ))}
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div style={{ padding: "10px 12px 8px" }}>

          {/* Título */}
          <p style={{ fontFamily: s.headFont, fontSize: s.headSize, color: s.text, marginBottom: 4, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            Atlas do Conhecimento
          </p>
          <p style={{ fontFamily: s.monoFont, fontSize: 6, color: s.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
            {s.tag} · {s.vibe}
          </p>

          {/* Mini cards inline */}
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {["Beethoven","Carbono","Cosmos"].map((t, i) => (
              <div key={t} style={{
                flex: 1, background: s.card, border: `1px solid ${s.border}`,
                borderRadius: s.radius, padding: "6px 5px", overflow: "hidden",
              }}>
                <div style={{ height: 28, background: `${s.accent}18`, marginBottom: 4, borderRadius: `calc(${s.radius} - 1px)` }} />
                <p style={{ fontFamily: s.headFont, fontSize: 7.5, color: s.text, lineHeight: 1.2 }}>{t}</p>
                <p style={{ fontFamily: s.monoFont, fontSize: 5.5, color: s.muted, marginTop: 2 }}>
                  {["Músico","Elemento","Cosmos"][i]}
                </p>
              </div>
            ))}
          </div>

          {/* Linha de texto */}
          <p style={{ fontFamily: s.bodyFont, fontSize: 7.5, color: s.muted, lineHeight: 1.5, marginBottom: 8 }}>
            Índice enciclopédico — cosmos, natureza, ciências e pessoas.
          </p>

          {/* Paleta */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[s.bg, s.card, s.text, s.muted, s.accent, s.border].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: `1px solid ${s.border}` }} />
            ))}
            <span style={{ marginLeft: 4, fontFamily: s.monoFont, fontSize: 5.5, color: s.muted, letterSpacing: "0.1em" }}>
              {s.family}
            </span>
          </div>
        </div>

        {/* Label */}
        <div style={{ padding: "5px 12px 7px", borderTop: `1px solid ${s.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: s.headFont, fontSize: 10, color: s.text, fontWeight: 600 }}>{s.name}</span>
          <span style={{ fontFamily: s.monoFont, fontSize: 5.5, color: s.muted, letterSpacing: "0.15em", textTransform: "uppercase" }}>{s.tag}</span>
        </div>

      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
        style={{ background: `${s.accent}15` }}>
        <span style={{ fontFamily: s.monoFont, fontSize: 8, color: s.accent, letterSpacing: "0.2em" }}>
          {selected ? "✓ SELECIONADO" : "SELECIONAR"}
        </span>
      </div>
    </button>
  )
}

// ── Painel de detalhe do estilo selecionado ──────────────────────────────────

function StyleDetail({ s }: { s: Style }) {
  const [copied, setCopied] = useState(false)

  const code = `// design-token.ts — aplique este estilo ao Portal Solar
export const CHOSEN_STYLE = {
  name:      "${s.name}",
  headFont:  "${s.headFont}",
  bodyFont:  "${s.bodyFont}",
  monoFont:  "${s.monoFont}",
  bg:        "${s.bg}",
  card:      "${s.card}",
  text:      "${s.text}",
  muted:     "${s.muted}",
  accent:    "${s.accent}",
  border:    "${s.border}",
  radius:    "${s.radius}",
}`

  return (
    <div className="border-t" style={{ borderColor: "rgb(var(--c-border) / 0.2)", padding: "24px 0" }}>
      <div className="grid grid-cols-2 gap-8">

        <div className="space-y-3">
          <p className="font-mono text-[7px] uppercase tracking-[0.3em]" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
            {s.id.toString().padStart(2, "0")} / 24 — Selecionado
          </p>
          <h2 className="font-display text-2xl" style={{ color: "rgb(var(--c-text) / 0.9)" }}>{s.name}</h2>
          <p className="font-mono text-[8.5px]" style={{ color: "rgb(var(--c-muted) / 0.65)" }}>{s.desc}</p>

          <div className="flex gap-2 pt-2">
            {[s.bg, s.card, s.text, s.muted, s.accent, s.border].map((c, i) => (
              <div key={i} title={c} style={{ width: 20, height: 20, background: c, border: "1px solid #0002", borderRadius: 2 }} />
            ))}
          </div>

          <p className="font-mono text-[7px]" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
            Head: {(s.headFont.split(",")[0] ?? "").replace(/'/g, "")}<br />
            Body: {(s.bodyFont.split(",")[0] ?? "").replace(/'/g, "")}<br />
            Mono: {(s.monoFont.split(",")[0] ?? "").replace(/'/g, "")}
          </p>
        </div>

        <div>
          <div className="relative">
            <pre className="font-mono text-[7px] p-3 overflow-auto" style={{ background: "rgb(var(--c-deep))", border: "1px solid rgb(var(--c-border) / 0.2)", color: "rgb(var(--c-muted) / 0.8)", lineHeight: 1.6, maxHeight: 180 }}>
              {code}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
              className="absolute top-2 right-2 font-mono text-[6.5px] uppercase tracking-widest px-2 py-1 transition-colors"
              style={{ background: "rgb(var(--c-surface) / 0.8)", color: copied ? "rgb(var(--c-teal))" : "rgb(var(--c-muted) / 0.6)", border: "1px solid rgb(var(--c-border) / 0.3)" }}
            >
              {copied ? "✓" : "Copiar"}
            </button>
          </div>
          <p className="font-mono text-[7px] mt-2" style={{ color: "rgb(var(--c-muted) / 0.4)" }}>
            Cole em <code style={{ color: "rgb(var(--c-accent) / 0.8)" }}>atlas/lib/design-token.ts</code> e aplique via CSS variables.
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

const TAGS = ["TODOS", "MINIMAL", "EDITORIAL", "DARK", "WARM", "BOLD", "PREMIUM"]

export default function AtelierPage() {
  const [selected,  setSelected]  = useState<number | null>(null)
  const [filter,    setFilter]    = useState("TODOS")

  const visible = filter === "TODOS"
    ? STYLES
    : STYLES.filter((s) => s.tag === filter)

  const selectedStyle = STYLES.find((s) => s.id === selected)

  return (
    <div className="min-h-screen" style={{ background: "rgb(var(--c-void))" }}>

      {/* ── Header ── */}
      <div className="border-b px-0 pt-8 pb-6" style={{ borderColor: "rgb(var(--c-border) / 0.15)" }}>
        <p className="font-mono text-[7.5px] uppercase tracking-[0.3em] mb-2" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
          Portal Solar · Atelier de Interfaces
        </p>
        <h1 className="font-display text-3xl font-bold leading-none mb-2" style={{ color: "rgb(var(--c-text) / 0.9)" }}>
          24 Direções de Design
        </h1>
        <p className="font-mono text-[9px] max-w-2xl" style={{ color: "rgb(var(--c-muted) / 0.6)" }}>
          Cada cartão é uma direção visual completa e autônoma. Clique para selecionar, copie o token e aplique no site.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <Link href="/docs/design-plan" className="font-mono text-[7.5px] uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-accent) / 0.8)" }}>
            Plano de Execução →
          </Link>
          <span style={{ color: "rgb(var(--c-border) / 0.5)" }}>·</span>
          <Link href="/" className="font-mono text-[7.5px] uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "rgb(var(--c-muted) / 0.5)" }}>
            ← Atlas
          </Link>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex gap-1 py-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="font-mono text-[7px] uppercase tracking-widest px-3 py-1.5 flex-shrink-0 transition-colors"
            style={{
              border:          "1px solid rgb(var(--c-border) / 0.25)",
              background:      filter === t ? "rgb(var(--c-text))" : "transparent",
              color:           filter === t ? "rgb(var(--c-void))" : "rgb(var(--c-text) / 0.55)",
            }}
          >
            {t} {t === "TODOS" ? `(${STYLES.length})` : `(${STYLES.filter(s => s.tag === t).length})`}
          </button>
        ))}
      </div>

      {/* ── Painel do selecionado ── */}
      {selectedStyle && <StyleDetail s={selectedStyle} />}

      {/* ── Grade 24 interfaces ── */}
      <div className="grid gap-3 pb-16"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {visible.map((s) => (
          <StylePreview
            key={s.id}
            s={s}
            onSelect={setSelected}
            selected={selected === s.id}
          />
        ))}
      </div>

    </div>
  )
}
