"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSolarStore, useViewStore } from "@/atlas/lib/store"
import type { InterfaceMode, SolarTheme, CssVar, PatternId, HomeSectionId } from "@/atlas/lib/store"
import { ViewSwitcher } from "@/atlas/components/ui/ViewSwitcher"

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = "perfil" | "senha" | "interface" | "home" | "categorias" | "rss" | "exportacao" | "sobre"

const TABS: { id: TabId; label: string; symbol: string }[] = [
  { id: "perfil",     label: "Perfil",     symbol: "◉" },
  { id: "senha",      label: "Senha",      symbol: "⚿" },
  { id: "interface",  label: "Interface",  symbol: "⬡" },
  { id: "home",       label: "Home",       symbol: "⊞" },
  { id: "categorias", label: "Categorias", symbol: "◈" },
  { id: "rss",        label: "RSS",        symbol: "⊕" },
  { id: "exportacao", label: "Exportação", symbol: "↑" },
  { id: "sobre",      label: "Sobre",      symbol: "◈" },
]

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-solar-border/25 bg-solar-deep/20">
      <div className="px-5 py-3 border-b border-solar-border/20">
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 py-3 border-b border-solar-border/15 last:border-0">
      <span className="text-[10px] font-mono text-solar-muted/60 pt-0.5 flex-shrink-0 w-36">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full bg-solar-deep/50 border border-solar-border/30
        px-3 py-1.5 text-xs font-mono text-solar-text
        placeholder:text-solar-muted/30
        focus:outline-none focus:border-solar-amber/40
        transition-all duration-150
      "
    />
  )
}

// ── Senha tab ─────────────────────────────────────────────────────────────────

function SenhaTab() {
  const [current,  setCurrent]  = useState("")
  const [next,     setNext]     = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState<{ ok: boolean; text: string } | null>(null)

  const save = async () => {
    if (!current || !next || !confirm) { setMsg({ ok: false, text: "Preencha todos os campos" }); return }
    if (next !== confirm) { setMsg({ ok: false, text: "As senhas não coincidem" }); return }
    setSaving(true)
    setMsg(null)
    const res = await fetch("/api/auth/password", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    const data = await res.json() as { ok?: boolean; error?: string }
    if (res.ok) {
      setCurrent(""); setNext(""); setConfirm("")
      setMsg({ ok: true, text: "Senha alterada com sucesso" })
    } else {
      setMsg({ ok: false, text: data.error ?? "Erro ao alterar senha" })
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <Section title="Alterar senha">
        <Field label="Senha atual">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-1.5 text-xs font-mono text-solar-text focus:outline-none focus:border-solar-amber/40 transition-all duration-150"
          />
        </Field>
        <Field label="Nova senha">
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-1.5 text-xs font-mono text-solar-text focus:outline-none focus:border-solar-amber/40 transition-all duration-150"
          />
        </Field>
        <Field label="Confirmar nova senha">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void save() }}
            className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-1.5 text-xs font-mono text-solar-text focus:outline-none focus:border-solar-amber/40 transition-all duration-150"
          />
        </Field>
      </Section>

      <div className="flex items-center gap-4">
        <button
          onClick={() => void save()}
          disabled={saving}
          className="px-5 py-2 bg-solar-amber/10 border border-solar-amber/40 text-[10px] font-mono text-solar-amber uppercase tracking-widest hover:bg-solar-amber/20 transition-solar disabled:opacity-30"
        >
          {saving ? "Salvando…" : "Alterar senha →"}
        </button>
        {msg && (
          <p className={`text-[10px] font-mono ${msg.ok ? "text-solar-green" : "text-solar-red"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Perfil tab ────────────────────────────────────────────────────────────────

type SocialProfile = {
  id: string; username: string; displayName: string
  bio: string | null; avatarUrl: string | null; accentColor: string
}

const ACCENT_PRESETS = [
  "#C8A45A","#9B59B6","#4A90D9","#2ECC71","#E91E63","#E67E22","#1ABC9C","#F39C12",
]

function PerfilTab() {
  const [profile,     setProfile]     = useState<SocialProfile | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [bio,         setBio]         = useState("")
  const [accentColor, setAccentColor] = useState("#C8A45A")
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data: SocialProfile | null) => {
        if (!data) return
        setProfile(data)
        setDisplayName(data.displayName)
        setBio(data.bio ?? "")
        setAccentColor(data.accentColor)
      })
  }, [])

  const save = async () => {
    if (!profile) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/social/profile/${profile.username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: displayName.trim() || profile.displayName, bio: bio.trim() || null, accentColor }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      const d = await res.json() as { error?: string }
      setError(d.error ?? "Erro ao salvar")
    }
    setSaving(false)
  }

  if (!profile) {
    return <p className="text-[10px] font-mono text-solar-muted/40">Carregando…</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Conta">
        <Field label="Usuário">
          <p className="text-[11px] font-mono text-solar-muted/60">@{profile.username}</p>
        </Field>
      </Section>

      <Section title="Identidade">
        <Field label="Nome de exibição">
          <TextInput value={displayName} onChange={setDisplayName} placeholder="Seu nome" />
        </Field>
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Uma linha sobre você"
            rows={2}
            className="w-full bg-solar-surface/20 border border-solar-border/30 px-3 py-2 text-[11px] font-mono text-solar-text/80 placeholder:text-solar-muted/30 outline-none resize-none focus:border-solar-amber/40 transition-colors"
          />
        </Field>
      </Section>

      <Section title="Cor de destaque">
        <div className="flex gap-2 flex-wrap">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className="w-8 h-8 rounded-full border-2 transition-all"
              style={{
                background: color,
                borderColor: accentColor === color ? "white" : "transparent",
                transform: accentColor === color ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-8 h-8 rounded-full border border-solar-border/30 cursor-pointer bg-transparent"
            title="Cor personalizada"
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
               style={{ background: `${accentColor}25`, color: accentColor }}>
            {displayName[0]?.toUpperCase() ?? "?"}
          </div>
          <p className="text-[9px] font-mono text-solar-muted/40">Prévia do avatar</p>
        </div>
      </Section>

      {error && <p className="text-[9px] font-mono text-red-400/70">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="self-end px-5 py-2 border border-solar-amber/40 text-[10px] font-mono uppercase tracking-widest text-solar-amber hover:bg-solar-amber/10 transition-all disabled:opacity-40"
      >
        {saving ? "Salvando…" : saved ? "Salvo ✓" : "Salvar perfil"}
      </button>
    </div>
  )
}

// ── Themes metadata ───────────────────────────────────────────────────────────

const THEMES: { id: SolarTheme; label: string; bg: string; accent: string; light?: boolean }[] = [
  { id: "default",        label: "Cosmos Escuro",         bg: "#0D0D0F", accent: "#C8A45A" },
  { id: "papel-amarelo",  label: "Papel & Tinta",         bg: "#F5EDBB", accent: "#783C19", light: true },
  { id: "terminal",       label: "Terminal Fósforo",      bg: "#000000", accent: "#33FF33" },
  { id: "blueprint",      label: "Blueprint",             bg: "#0C2044", accent: "#FFE050" },
  { id: "academia",       label: "Academia",              bg: "#0C0A12", accent: "#B48C3C" },
  { id: "azulejo",        label: "Azulejo Lisboa",        bg: "#0A182D", accent: "#DCC06E" },
  { id: "floresta",       label: "Floresta Noturna",      bg: "#08120C", accent: "#7CFC6A" },
  { id: "aurora",         label: "Aurora Boreal",         bg: "#08081C", accent: "#50DCC8" },
  { id: "jazz",           label: "Jazz Club",             bg: "#0C0508", accent: "#D2AA3C" },
  { id: "manuscrito",     label: "Manuscrito",            bg: "#C8B99B", accent: "#5A3012", light: true },
  { id: "neon-tokyo",     label: "Neon Tokyo",            bg: "#05000C", accent: "#FF1EB4" },
  { id: "mercurio",       label: "Mercúrio",              bg: "#0F0F12", accent: "#B9C3D7" },
  { id: "vulcao",         label: "Vulcão",                bg: "#0E0805", accent: "#FF5A1E" },
  { id: "gelo",           label: "Gelo Ártico",           bg: "#C8D7E6", accent: "#3282C8", light: true },
  { id: "carvao",         label: "Carvão",                bg: "#12100F", accent: "#F0EBE4" },
  { id: "museu",          label: "Museu",                 bg: "#F8F6F2", accent: "#B43C50", light: true },
  { id: "submarino",      label: "Submarino",             bg: "#0A0E08", accent: "#B4A550" },
  { id: "botanica",       label: "Botânica",              bg: "#081212", accent: "#C3AF64" },
  { id: "cosmos-violeta", label: "Cosmos Violeta",        bg: "#0A0616", accent: "#B464FF" },
  { id: "mapa-antigo",    label: "Mapa Antigo",           bg: "#B9A582", accent: "#8C4119", light: true },
  { id: "mogno",          label: "Mogno",                 bg: "#0F0805", accent: "#C89641" },
  { id: "jardim",         label: "Jardim Noturno",        bg: "#08060A", accent: "#D2825F" }, // rose
  { id: "deserto",        label: "Deserto",               bg: "#1C120A", accent: "#DC8C37" },
  { id: "cibernetico",    label: "Cibernético",           bg: "#030008", accent: "#00FFD2" },
  { id: "dusk",           label: "Crepúsculo",            bg: "#0C0812", accent: "#EB8250" },
  { id: "laboratorio",    label: "Laboratório",           bg: "#F2F0EB", accent: "#1941A8", light: true },
  { id: "tinta-china",    label: "Tinta da China",        bg: "#FFFCF8", accent: "#C31C23", light: true },
  { id: "oceano",         label: "Oceano Profundo",       bg: "#050C1C", accent: "#1ED7BE" },
  { id: "sakura",         label: "Sakura",                bg: "#0C060A", accent: "#EB82A5" },
  { id: "arcade",         label: "Arcade",                bg: "#000000", accent: "#00FF80" },
  { id: "solar-inverso",  label: "Solar Invertido",       bg: "#F8F4EB", accent: "#A86C1C", light: true },
  { id: "platina",        label: "Platina",               bg: "#050506", accent: "#D2D2E1" },
]

// ── Color Editor ──────────────────────────────────────────────────────────────

type ColorSlot = {
  variable:    CssVar
  label:       string
  description: string
  swatches:    string[]  // RGB triplets "R G B"
}

const COLOR_SLOTS: ColorSlot[] = [
  {
    variable:    "--c-void",
    label:       "Fundo Profundo",
    description: "Cor mais escura da UI",
    swatches: [
      "13 13 15", "0 0 0", "10 10 20", "18 12 8",
      "8 12 18",  "15 8 20", "245 237 195", "248 246 242",
      "200 215 230", "255 252 248",
    ],
  },
  {
    variable:    "--c-deep",
    label:       "Superfície",
    description: "Cards e painéis",
    swatches: [
      "20 20 26", "10 10 10", "15 15 30", "28 18 12",
      "12 18 28", "22 12 30", "235 225 180", "240 238 232",
      "185 200 218", "248 244 238",
    ],
  },
  {
    variable:    "--c-surface",
    label:       "Superfície Alta",
    description: "Tooltips e popovers",
    swatches: [
      "30 30 38", "20 20 20", "22 22 44", "38 26 18",
      "18 26 38", "30 18 42", "220 210 165", "228 224 215",
      "170 185 205", "238 232 225",
    ],
  },
  {
    variable:    "--c-border",
    label:       "Bordas",
    description: "Linhas divisórias",
    swatches: [
      "60 60 75", "40 40 40", "45 45 80", "70 50 35",
      "35 50 70", "55 35 75", "160 145 110", "180 170 155",
      "120 140 165", "190 180 165",
    ],
  },
  {
    variable:    "--c-text",
    label:       "Texto",
    description: "Corpo de texto principal",
    swatches: [
      "245 243 238", "255 255 255", "230 235 245", "245 238 228",
      "228 235 245", "240 232 250", "30 25 18", "20 18 14",
      "18 22 30", "40 35 28",
    ],
  },
  {
    variable:    "--c-muted",
    label:       "Texto Secundário",
    description: "Metadados, labels",
    swatches: [
      "140 135 125", "100 100 100", "120 120 145", "140 118 95",
      "105 125 145", "130 105 148", "110 100 75", "90 85 75",
      "80 95 112", "120 108 90",
    ],
  },
  {
    variable:    "--c-accent",
    label:       "Acento Portal Solar",
    description: "Cor de destaque principal",
    swatches: [
      "110 86 207", "200 164 90", "255 90 30",  "30 215 190",
      "235 130 165","80 220 200", "51 255 51",  "255 30 180",
      "185 195 215","255 220 80",
    ],
  },
  {
    variable:    "--c-teal",
    label:       "Acento Compass",
    description: "Cor de destaque do Compass",
    swatches: [
      "0 200 180",  "80 220 80",  "30 215 255", "155 100 255",
      "255 180 30", "255 100 100","120 220 255","200 255 120",
      "255 150 200","220 200 180",
    ],
  },
]

const PATTERNS: { id: PatternId; label: string; symbol: string }[] = [
  { id: "none",       label: "Sem textura",   symbol: "○" },
  { id: "grid",       label: "Grade",          symbol: "⊞" },
  { id: "dots",       label: "Pontos",         symbol: "⠿" },
  { id: "horizontal", label: "Horizontal",     symbol: "≡" },
  { id: "diagonal",   label: "Diagonal",       symbol: "⋰" },
  { id: "grain",      label: "Ruído",          symbol: "◫" },
]

function ColorEditor() {
  const customColors      = useSolarStore((s) => s.customColors)
  const setCustomColor    = useSolarStore((s) => s.setCustomColor)
  const deleteCustomColor = useSolarStore((s) => s.deleteCustomColor)
  const resetCustomColors = useSolarStore((s) => s.resetCustomColors)
  const customPattern     = useSolarStore((s) => s.customPattern)
  const setCustomPattern  = useSolarStore((s) => s.setCustomPattern)

  return (
    <div className="flex flex-col gap-5">
      {/* Color slots */}
      {COLOR_SLOTS.map((slot) => {
        const active = customColors[slot.variable]
        return (
          <div key={slot.variable} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-mono text-solar-text/80 uppercase tracking-widest">{slot.label}</span>
                <span className="text-[8px] font-mono text-solar-muted/40 ml-2">{slot.description}</span>
              </div>
              {active && (
                <button
                  onClick={() => deleteCustomColor(slot.variable)}
                  className="text-[7px] font-mono text-solar-muted/30 hover:text-solar-muted/70 transition-colors flex-shrink-0"
                >
                  reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {slot.swatches.map((rgb) => {
                const isSelected = active === rgb
                return (
                  <button
                    key={rgb}
                    onClick={() => setCustomColor(slot.variable, rgb)}
                    title={`rgb(${rgb})`}
                    className="relative transition-all duration-150 hover:scale-110"
                    style={{
                      width:        isSelected ? "22px" : "18px",
                      height:       isSelected ? "22px" : "18px",
                      borderRadius: "50%",
                      background:   `rgb(${rgb})`,
                      border:       isSelected
                        ? "2px solid rgb(var(--c-accent))"
                        : "1px solid rgb(var(--c-border)/0.4)",
                      boxShadow:    isSelected ? "0 0 0 2px rgb(var(--c-void))" : "none",
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Pattern picker */}
      <div className="flex flex-col gap-2 pt-3 border-t border-solar-border/20">
        <span className="text-[10px] font-mono text-solar-text/80 uppercase tracking-widest">Textura de Fundo</span>
        <div className="flex items-center gap-2 flex-wrap">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setCustomPattern(p.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 border transition-all duration-150
                ${customPattern === p.id
                  ? "border-solar-accent/60 bg-solar-accent/8 text-solar-accent"
                  : "border-solar-border/20 text-solar-muted/40 hover:border-solar-border/50"
                }
              `}
            >
              <span className="text-base leading-none">{p.symbol}</span>
              <span className="text-[7px] font-mono uppercase tracking-widest">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset all */}
      <button
        onClick={resetCustomColors}
        className="self-start text-[9px] font-mono text-solar-muted/30 hover:text-solar-muted/70 transition-colors uppercase tracking-widest border border-solar-border/20 px-3 py-1.5 hover:border-solar-border/50"
      >
        ↺ Restaurar cores padrão do tema
      </button>
    </div>
  )
}

// ── Theme groups ──────────────────────────────────────────────────────────────

type ThemeGroup = {
  id:     string
  label:  string
  symbol: string
  themes: typeof THEMES
}

const THEME_GROUPS: ThemeGroup[] = [
  {
    id: "claros", label: "Claros", symbol: "☀",
    themes: THEMES.filter((t) => t.light),
  },
  {
    id: "cosmos", label: "Cosmos & Espaço", symbol: "◎",
    themes: THEMES.filter((t) =>
      !t.light && ["default","aurora","cosmos-violeta","oceano","platina","academia"].includes(t.id)
    ),
  },
  {
    id: "neon", label: "Neon & Urbano", symbol: "⚡",
    themes: THEMES.filter((t) =>
      !t.light && ["terminal","neon-tokyo","cibernetico","arcade","blueprint"].includes(t.id)
    ),
  },
  {
    id: "natureza", label: "Orgânico & Natureza", symbol: "◈",
    themes: THEMES.filter((t) =>
      !t.light && ["floresta","botanica","jardim","submarino","deserto"].includes(t.id)
    ),
  },
  {
    id: "classico", label: "Clássico & Materiais", symbol: "◉",
    themes: THEMES.filter((t) =>
      !t.light && ["azulejo","jazz","carvao","mogno","vulcao","mercurio","sakura","dusk"].includes(t.id)
    ),
  },
]

// ── Theme card ────────────────────────────────────────────────────────────────

function ThemeCard({
  t,
  active,
  onSelect,
}: {
  t: { id: string; label: string; bg: string; accent: string; light?: boolean }
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      title={t.label}
      className="relative flex flex-col overflow-hidden transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
      style={{
        height:      "56px",
        background:  t.bg,
        boxShadow:   active
          ? `0 0 0 2px ${t.accent}, 0 0 0 4px ${t.bg}`
          : "0 1px 3px rgba(0,0,0,0.35)",
      }}
    >
      {/* Accent stripe */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: active ? "3px" : "2px", background: t.accent, opacity: active ? 1 : 0.7 }}
      />
      {/* Active checkmark */}
      {active && (
        <div
          className="absolute top-1.5 right-1.5 w-3.5 h-3.5 flex items-center justify-center rounded-full text-[7px] font-bold"
          style={{ background: t.accent, color: t.bg }}
        >
          ✓
        </div>
      )}
      {/* Label at bottom */}
      <div className="absolute bottom-3 left-2 right-5">
        <span
          className="text-[6.5px] font-mono uppercase tracking-wider leading-none truncate block"
          style={{ color: t.light ? t.accent : `${t.accent}e0` }}
        >
          {t.label}
        </span>
      </div>
    </button>
  )
}

// ── Interface tab ─────────────────────────────────────────────────────────────

const MODE_INFO: Record<InterfaceMode, { symbol: string; label: string; hint: string }> = {
  ATLAS:         { symbol: "⬡", label: "Atlas",       hint: "Interface completa de exploração" },
  FOCUS:         { symbol: "✍", label: "Foco",         hint: "Editor limpo e centralizado" },
  CONTEMPLATION: { symbol: "◎", label: "Contemplação", hint: "Leitura imersiva, tipografia ampliada" },
  PUBLIC:        { symbol: "⊕", label: "Público",      hint: "Visão de visitante, sem ferramentas" },
}

function InterfaceTab() {
  const { mode, setMode, theme, setTheme } = useSolarStore()
  const { getViewForRoute, setViewForRoute } = useViewStore()
  const atlasView     = getViewForRoute("/atlas", "GALLERY")
  const activeTheme   = THEMES.find((t) => t.id === theme)
  const [colorsOpen, setColorsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5">

      {/* ── TEMAS ── */}
      <div className="border border-solar-border/25 bg-solar-deep/20">

        {/* Header with active theme pill */}
        <div className="px-5 py-3 border-b border-solar-border/20 flex items-center justify-between">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50">Tema Visual</p>
          {activeTheme && (
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: activeTheme.accent }}
              />
              <span className="text-[8px] font-mono text-solar-text/60">
                {activeTheme.label}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col gap-6">
          {THEME_GROUPS.map((group) => (
            <div key={group.id}>
              {/* Group label */}
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[8px] font-mono uppercase tracking-[0.18em] text-solar-muted/45">
                  {group.symbol} {group.label}
                </span>
                <div className="flex-1 h-px bg-solar-border/15" />
                <span className="text-[7px] font-mono text-solar-muted/25">
                  {group.themes.length}
                </span>
              </div>
              {/* Cards */}
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {group.themes.map((t) => (
                  <ThemeCard
                    key={t.id}
                    t={t}
                    active={theme === t.id}
                    onSelect={() => setTheme(t.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODO DE INTERFACE ── */}
      <Section title="Modo de Interface">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MODE_INFO) as InterfaceMode[]).map((m) => {
            const info   = MODE_INFO[m]
            const active = mode === m
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`
                  flex items-start gap-3 p-3.5 border text-left transition-all duration-150
                  ${active
                    ? "border-solar-accent/50 bg-solar-accent/8"
                    : "border-solar-border/25 hover:border-solar-border/50 bg-solar-deep/20"
                  }
                `}
              >
                <span className={`text-base mt-0.5 ${active ? "text-solar-accent" : "text-solar-muted/40"}`}>
                  {info.symbol}
                </span>
                <div>
                  <p className={`text-[10px] font-mono uppercase tracking-widest mb-0.5 ${active ? "text-solar-accent" : "text-solar-text/70"}`}>
                    {info.label}
                  </p>
                  <p className="text-[9px] font-mono text-solar-muted/40 leading-snug">{info.hint}</p>
                </div>
              </button>
            )
          })}
        </div>
        <p className="text-[8px] font-mono text-solar-muted/25 mt-3">Atalhos: ⌘⇧F · ⌘⇧C · ⌘⇧A · ⌘⇧P</p>
      </Section>

      {/* ── VISUALIZAÇÃO PADRÃO DO ATLAS ── */}
      <Section title="Atlas — Visualização Padrão">
        <p className="text-[9px] font-mono text-solar-muted/40 mb-4">
          Escolha como os itens são exibidos por padrão no Atlas.
        </p>
        <ViewSwitcher current={atlasView} onChange={(v) => setViewForRoute("/atlas", v)} />
      </Section>

      {/* ── EDITOR DE CORES — colapsável ── */}
      <div className="border border-solar-border/25 bg-solar-deep/20">
        <button
          onClick={() => setColorsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-solar-surface/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/50">
              Editor de Cores
            </p>
            <span className="text-[7px] font-mono text-solar-muted/25 uppercase tracking-widest">
              Personalização granular
            </span>
          </div>
          <span className="text-[9px] font-mono text-solar-muted/30">
            {colorsOpen ? "▲" : "▼"}
          </span>
        </button>
        {colorsOpen && (
          <div className="px-5 pb-5 border-t border-solar-border/20 pt-4">
            <ColorEditor />
          </div>
        )}
      </div>

    </div>
  )
}

// ── RSS tab ───────────────────────────────────────────────────────────────────

type FeedRow = { id: string; url: string; label: string; area: string; isActive: boolean }

function RSSTab() {
  const [feeds,     setFeeds]     = useState<FeedRow[]>([])
  const [loading,   setLoading]   = useState(true)
  const [newUrl,    setNewUrl]    = useState("")
  const [newLabel,  setNewLabel]  = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [status,    setStatus]    = useState<string | null>(null)

  // Load feeds
  useEffect(() => {
    fetch("/api/rss?mode=feeds")
      .then((r) => r.json() as Promise<FeedRow[]>)
      .then((data) => { setFeeds(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addFeed = async () => {
    if (!newUrl.trim()) return
    const res  = await fetch("/api/rss", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: newUrl.trim(), label: newLabel.trim() }),
    })
    const feed = await res.json() as FeedRow
    setFeeds((f) => [...f.filter((x) => x.id !== feed.id), feed])
    setNewUrl("")
    setNewLabel("")
  }

  const removeFeed = async (id: string) => {
    await fetch(`/api/rss?id=${id}`, { method: "DELETE" })
    setFeeds((f) => f.filter((x) => x.id !== id))
  }

  const refresh = async () => {
    setRefreshing(true)
    const res  = await fetch("/api/rss", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "refresh" }),
    })
    const data = await res.json() as { refreshed: Record<string, number> }
    const total = Object.values(data.refreshed).reduce((a, b) => a + b, 0)
    setStatus(`${total} itens atualizados`)
    setRefreshing(false)
    setTimeout(() => setStatus(null), 3000)
  }

  return (
    <div className="flex flex-col gap-4">
      <Section title="Fontes RSS">
        {loading ? (
          <p className="text-[9px] font-mono text-solar-muted/30 animate-pulse">Carregando...</p>
        ) : (
          <>
            <div className="flex flex-col gap-0">
              {feeds.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-solar-border/15 last:border-0">
                  <div className="flex-1 min-w-0">
                    {feed.label && (
                      <p className="text-[10px] font-mono text-solar-text/70 mb-0.5">{feed.label}</p>
                    )}
                    <p className="text-[9px] font-mono text-solar-muted/40 truncate">{feed.url}</p>
                  </div>
                  <span className="text-[7px] font-mono text-solar-muted/25 uppercase border border-solar-border/15 px-1 py-0.5 flex-shrink-0">
                    {feed.area}
                  </span>
                  <button
                    onClick={() => removeFeed(feed.id)}
                    className="text-[9px] font-mono text-solar-muted/25 hover:text-solar-red/60 transition-colors flex-shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              {feeds.length === 0 && (
                <p className="text-[9px] font-mono text-solar-muted/25 py-2">Nenhuma fonte cadastrada.</p>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <div className="flex gap-2">
                <TextInput value={newUrl}   onChange={setNewUrl}   placeholder="https://example.com/rss" />
                <TextInput value={newLabel} onChange={setNewLabel} placeholder="Nome (opcional)" />
              </div>
              <button
                onClick={addFeed}
                className="
                  self-start px-3 py-1.5 border border-solar-border/30 text-[9px] font-mono
                  text-solar-muted/60 hover:border-solar-amber/40 hover:text-solar-amber
                  transition-all
                "
              >
                + Adicionar fonte
              </button>
            </div>
          </>
        )}
      </Section>

      <Section title="Atualização">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-solar-text/60 mb-1">
              Busca novos itens em todas as fontes ativas.
            </p>
            <p className="text-[9px] font-mono text-solar-muted/35">
              Cache salvo no banco — disponível offline.
            </p>
            {status && (
              <p className="text-[9px] font-mono text-solar-amber/70 mt-1">{status}</p>
            )}
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="
              px-4 py-2 border border-solar-border/30 text-[9px] font-mono
              uppercase tracking-widest text-solar-muted/60
              hover:border-solar-amber/40 hover:text-solar-amber
              transition-all disabled:opacity-40 flex-shrink-0
            "
          >
            {refreshing ? "Atualizando..." : "↺ Atualizar"}
          </button>
        </div>
      </Section>
    </div>
  )
}

// ── Exportação tab ────────────────────────────────────────────────────────────

function ExportacaoTab({ total, areaCounts }: { total: number; areaCounts: Record<string, number> }) {
  const [exporting, setExporting] = useState<string | null>(null)

  const trigger = async (label: string, url: string, filename: string) => {
    setExporting(label)
    try {
      const res  = await fetch(url)
      const blob = await res.blob()
      const a    = document.createElement("a")
      a.href     = URL.createObjectURL(blob)
      a.download = filename
      a.click()
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(null)
    }
  }

  const areas = Object.entries(areaCounts).filter(([, n]) => n > 0)

  return (
    <div className="flex flex-col gap-4">
      <Section title="Backup Completo">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-solar-text/70 mb-1">
              {total} itens → backup.zip
            </p>
            <p className="text-[9px] font-mono text-solar-muted/40">
              Inclui todos os .md + index.json
            </p>
          </div>
          <button
            disabled={!!exporting}
            onClick={() => trigger("backup", "/api/portability/export/all", "portal-solar-backup.zip")}
            className="
              px-4 py-2 border border-solar-amber/40 text-[9px] font-mono
              uppercase tracking-widest text-solar-amber
              hover:bg-solar-amber/10 transition-all disabled:opacity-40
            "
          >
            {exporting === "backup" ? "Exportando..." : "↓ Exportar Tudo"}
          </button>
        </div>
      </Section>

      <Section title="Por Área">
        <div className="flex flex-col gap-0">
          {areas.map(([area, count]) => (
            <div key={area} className="flex items-center justify-between py-2.5 border-b border-solar-border/15 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono uppercase tracking-widest text-solar-muted/60 w-24">{area}</span>
                <span className="text-[8px] font-mono text-solar-muted/30">{count} itens</span>
              </div>
              <button
                disabled={!!exporting}
                onClick={() => trigger(area, `/api/portability/export/area/${area}`, `${area.toLowerCase()}.zip`)}
                className="text-[9px] font-mono text-solar-muted/40 hover:text-solar-amber transition-colors disabled:opacity-40"
              >
                ↓ .zip
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Importar">
        <p className="text-[10px] font-mono text-solar-muted/50 mb-3">
          Arquivo .md com frontmatter YAML — upsert por ID.
        </p>
        <input
          type="file"
          accept=".md"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const fd = new FormData()
            fd.append("file", file)
            await fetch("/api/portability/import", { method: "POST", body: fd })
            e.target.value = ""
          }}
          className="text-[10px] font-mono text-solar-muted/50 file:mr-3 file:py-1 file:px-3 file:border file:border-solar-border/30 file:bg-solar-deep file:text-solar-muted/50 file:text-[9px] file:font-mono file:uppercase file:cursor-pointer"
        />
      </Section>
    </div>
  )
}

// ── Home Sections tab ─────────────────────────────────────────────────────────

function HomeSectionsTab() {
  const { homeSections, toggleHomeSection, reorderHomeSections } = useSolarStore()
  const [dragging, setDragging] = useState<HomeSectionId | null>(null)
  const [over,     setOver]     = useState<HomeSectionId | null>(null)

  const handleDrop = (targetId: HomeSectionId) => {
    if (!dragging || dragging === targetId) return
    const ids = homeSections.map((s) => s.id)
    const fromIdx = ids.indexOf(dragging)
    const toIdx   = ids.indexOf(targetId)
    const next = [...ids]
    next.splice(fromIdx, 1)
    next.splice(toIdx, 0, dragging)
    reorderHomeSections(next)
    setDragging(null)
    setOver(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Section title="Seções da Home">
        <p className="text-[9px] font-mono text-solar-muted/45 mb-4">
          Ative, desative e reordene as seções que aparecem na página inicial. Arraste para reordenar.
        </p>
        <div className="flex flex-col gap-px">
          {homeSections.map((section) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => setDragging(section.id)}
              onDragOver={(e) => { e.preventDefault(); setOver(section.id) }}
              onDragLeave={() => setOver(null)}
              onDrop={() => handleDrop(section.id)}
              onDragEnd={() => { setDragging(null); setOver(null) }}
              className={`
                flex items-center justify-between px-4 py-3 border
                transition-colors cursor-grab active:cursor-grabbing select-none
                ${over === section.id
                  ? "border-solar-amber/40 bg-solar-amber/5"
                  : "border-solar-border/20 bg-solar-void hover:bg-solar-surface/20"}
                ${dragging === section.id ? "opacity-40" : "opacity-100"}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-solar-muted/20 font-mono text-[10px] select-none">⠿</span>
                <span className="text-[10px] font-mono text-solar-muted/70">{section.label}</span>
              </div>
              <button
                onClick={() => toggleHomeSection(section.id)}
                className={`
                  relative w-8 h-4 rounded-full transition-colors flex-shrink-0
                  ${section.visible ? "bg-solar-amber/60" : "bg-solar-border/40"}
                `}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-solar-text transition-all"
                  style={{ left: section.visible ? "1rem" : "0.125rem" }}
                />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ── Sobre tab ─────────────────────────────────────────────────────────────────

function SobreTab() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="SOLARIS">
        <div className="flex flex-col gap-3 text-[10px] font-mono text-solar-muted/60 leading-relaxed">
          <p>Ecossistema local-first de gestão de conhecimento.</p>
          <p>Stack: Next.js 14 · Prisma · SQLite · Tailwind · Framer Motion · GSAP · R3F</p>
          <p>Criado por Diamantov — Design Digital, PUCC · 2026</p>
        </div>
      </Section>

      <Section title="Módulos">
        {[
          ["1–6",  "Core, Atlas CRUD, Editor BlockNote, Sidebar"],
          ["7",    "Numita Compass — Diário, Perfil, Notas"],
          ["8",    "Portal Solar — Vilas, Cultura, WorldBoard"],
          ["9",    "Portabilidade — mirrors .md, export/import"],
          ["10",   "Busca Global ⌘K, DimensionFilterPanel"],
          ["11",   "Sistema de Modos — FOCUS/CONTEMPLATION/ATLAS/PUBLIC"],
          ["12",   "SolarMonument — React Three Fiber"],
          ["13",   "Autenticação — NextAuth.js (pendente)"],
        ].map(([num, desc]) => (
          <div key={num} className="flex items-start gap-4 py-2 border-b border-solar-border/10 last:border-0">
            <span className="text-[9px] font-mono text-solar-amber/50 w-6 flex-shrink-0">{num}</span>
            <span className="text-[9px] font-mono text-solar-muted/45">{desc}</span>
          </div>
        ))}
      </Section>
    </div>
  )
}

// ── Categorias tab ────────────────────────────────────────────────────────────

function CategoriasTab() {
  const { atlasCategories, toggleCategory, addCategory, removeCategory } = useSolarStore()
  const [newLabel, setNewLabel] = useState("")
  const [newParent, setNewParent] = useState("")
  const [search, setSearch] = useState("")

  const rootCats = atlasCategories.filter((c) => !c.parent)
  const filtered = atlasCategories.filter((c) =>
    !search || c.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    if (!newLabel.trim()) return
    addCategory({
      id: newLabel.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      label: newLabel.trim(),
      parent: newParent || undefined,
      enabled: true,
    })
    setNewLabel("")
    setNewParent("")
  }

  return (
    <div className="space-y-5">
      <Section title="Categorias do Atlas da Humanidade">
        <p className="text-[10px] font-mono text-solar-muted/50 mb-4">
          Estas categorias são usadas como tags nos itens do Atlas. Você pode ativar, desativar, adicionar e remover categorias.
        </p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoria..."
          className="w-full bg-solar-deep/50 border border-solar-border/30 px-3 py-1.5 text-xs font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-amber/40 mb-4"
        />

        {/* Category list */}
        <div className="space-y-px max-h-96 overflow-y-auto">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2 bg-solar-deep/20 border border-solar-border/15 group"
            >
              {cat.parent && (
                <span className="text-solar-muted/20 text-[10px] font-mono">└</span>
              )}
              <span className={`flex-1 text-[10px] font-mono ${cat.parent ? "text-solar-muted/60" : "text-solar-text/80 font-semibold"}`}>
                {cat.label}
              </span>
              {cat.parent && (
                <span className="text-[8px] font-mono text-solar-muted/30 uppercase">
                  {atlasCategories.find((c) => c.id === cat.parent)?.label}
                </span>
              )}
              <button
                onClick={() => toggleCategory(cat.id)}
                className={`text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 border transition-colors ${
                  cat.enabled
                    ? "border-solar-amber/30 text-solar-amber/70 hover:bg-solar-amber/10"
                    : "border-solar-border/20 text-solar-muted/30 hover:border-solar-border/50"
                }`}
              >
                {cat.enabled ? "Ativo" : "Off"}
              </button>
              <button
                onClick={() => removeCategory(cat.id)}
                className="text-[8px] font-mono text-solar-muted/20 hover:text-solar-red/60 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Adicionar Categoria">
        <div className="flex gap-3">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Nome da categoria"
            className="flex-1 bg-solar-deep/50 border border-solar-border/30 px-3 py-1.5 text-xs font-mono text-solar-text placeholder:text-solar-muted/30 focus:outline-none focus:border-solar-amber/40"
          />
          <select
            value={newParent}
            onChange={(e) => setNewParent(e.target.value)}
            className="bg-solar-deep/50 border border-solar-border/30 px-2 py-1.5 text-xs font-mono text-solar-text focus:outline-none focus:border-solar-amber/40"
          >
            <option value="">Raiz</option>
            {rootCats.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim()}
            className="px-4 py-1.5 border border-solar-amber/30 text-[9px] font-mono text-solar-amber uppercase tracking-widest hover:bg-solar-amber/10 transition-solar disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </Section>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function SettingsClient({
  areaCounts,
  total,
}: {
  areaCounts: Record<string, number>
  total:      number
}) {
  const [tab, setTab] = useState<TabId>("perfil")

  return (
    <div className="relative min-h-screen">
      <header className="relative z-10 border-b border-solar-border/40 pt-12 pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-solar-muted/70 mb-3">
            Portal Solar · Configurações
          </p>
          <h1 className="font-display text-[28px] sm:text-[36px] md:text-[44px] leading-none text-solar-text font-semibold tracking-tight mb-5">
            Configurações
          </h1>

          {/* Tab nav */}
          <div className="flex items-center gap-0 border-b border-solar-border/0 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-mono uppercase tracking-widest
                  border-b-2 transition-all duration-150
                  ${tab === t.id
                    ? "border-solar-amber text-solar-amber"
                    : "border-transparent text-solar-muted/45 hover:text-solar-muted"
                  }
                `}
              >
                <span>{t.symbol}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === "perfil"      && <PerfilTab />}
            {tab === "senha"       && <SenhaTab />}
            {tab === "interface"   && <InterfaceTab />}
            {tab === "home"        && <HomeSectionsTab />}
            {tab === "categorias"  && <CategoriasTab />}
            {tab === "rss"         && <RSSTab />}
            {tab === "exportacao"  && <ExportacaoTab total={total} areaCounts={areaCounts} />}
            {tab === "sobre"       && <SobreTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
