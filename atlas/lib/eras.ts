// ─── Eras da Humanidade — periodização e classificação temporal ───────────────
// As seções da Linha do Tempo do Conhecimento Humano (roadmap §2.6).
// Classifica qualquer AtlasItem numa grande era a partir do metadata (JSON).
//
// Formatos reais encontrados no acervo:
//   PERSON:  {born: 1685, died: 1750}  |  {period: {start: -384, end: -322}}
//   WORK:    {year: 1913}
//   EVENT:   {year: 1969}  |  {period: "1914-1918"}
//   ERA:     {period: "Antiga", years: "3100–30 a.C."}  |  legado {period: "1400-1600"}
//   Escalas geológicas: years com "Ma" (milhões) ou "Ga" (bilhões de anos atrás)
//
// Anos negativos = a.C. Funções puras — usáveis no servidor e no cliente.

export type GrandEraId =
  | "PROFUNDO"
  | "PRE_HISTORIA"
  | "ANTIGA"
  | "MEDIA"
  | "MODERNA"
  | "CONTEMPORANEA"

export type GrandEra = {
  id:     GrandEraId
  label:  string
  years:  string   // rótulo de exibição
  to:     number   // limite superior exclusivo (ano); ordem crescente define os intervalos
  color:  string
  symbol: string
  desc:   string
}

// Periodização clássica. O array DEVE ficar em ordem cronológica:
// a era de um ano é a primeira cujo `to` é maior que ele.
export const GRAND_ERAS: GrandEra[] = [
  {
    id: "PROFUNDO", label: "Tempo Profundo", years: "4,6 Ga – 3,3 Ma",
    to: -3_300_000, color: "#5C6B7C", symbol: "◐",
    desc: "Éons e eras geológicas — a Terra e a vida antes da humanidade.",
  },
  {
    id: "PRE_HISTORIA", label: "Pré-História", years: "3,3 Ma – 3500 a.C.",
    to: -3500, color: "#8C6D3F", symbol: "⬡",
    desc: "Do primeiro instrumento de pedra à invenção da escrita.",
  },
  {
    id: "ANTIGA", label: "Idade Antiga", years: "3500 a.C. – 476 d.C.",
    to: 476, color: "#C8A45A", symbol: "◈",
    desc: "Escrita, impérios e filosofia — as primeiras civilizações.",
  },
  {
    id: "MEDIA", label: "Idade Média", years: "476 – 1453",
    to: 1453, color: "#6B5C9B", symbol: "⊕",
    desc: "Da queda de Roma à queda de Constantinopla.",
  },
  {
    id: "MODERNA", label: "Idade Moderna", years: "1453 – 1789",
    to: 1789, color: "#4A7C6F", symbol: "✦",
    desc: "Renascimento, navegações, imprensa e Iluminismo.",
  },
  {
    id: "CONTEMPORANEA", label: "Idade Contemporânea", years: "1789 – presente",
    to: Infinity, color: "#B85C3F", symbol: "◉",
    desc: "Revoluções, indústria, guerras mundiais e a era digital.",
  },
]

export const GRAND_ERA_BY_ID: Record<GrandEraId, GrandEra> = Object.fromEntries(
  GRAND_ERAS.map((e) => [e.id, e])
) as Record<GrandEraId, GrandEra>

// Mapeia o campo `period` textual dos itens ERA para a grande era.
const PERIOD_NAME_TO_ERA: Record<string, GrandEraId> = {
  "geológico":      "PROFUNDO",
  "geologico":      "PROFUNDO",
  "pré-história":   "PRE_HISTORIA",
  "pré-historia":   "PRE_HISTORIA",
  "pre-história":   "PRE_HISTORIA",
  "pre-historia":   "PRE_HISTORIA",
  "antiga":         "ANTIGA",
  "medieval":       "MEDIA",
  "média":          "MEDIA",
  "media":          "MEDIA",
  "moderna":        "MODERNA",
  "contemporânea":  "CONTEMPORANEA",
  "contemporanea":  "CONTEMPORANEA",
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

type Meta = Record<string, unknown>

export function parseMeta(raw?: string | null): Meta | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object" ? (parsed as Meta) : null
  } catch {
    return null
  }
}

// Extrai o primeiro ano de uma string de período.
// "1914-1918" → 1914 · "3100–30 a.C." → -3100 · "27 a.C.–476 d.C." → -27
// "66 Ma–presente" → -66e6 · "2.5–0.54 Ga" → -2.5e9 · "3,3 Ma–10000 a.C." → -3.3e6
export function yearFromString(s: string): number | null {
  const m = s.match(/(\d[\d.,]*)\s*(Ga|Ma)?/)
  if (!m?.[1]) return null
  const n = parseFloat(m[1].replace(",", "."))
  if (Number.isNaN(n)) return null
  if (m[2] === "Ga") return -n * 1e9
  if (m[2] === "Ma") return -n * 1e6
  if (/a\.?\s?C\.?/.test(s)) return -n
  return n
}

// Ano de referência de um item, para ordenar e classificar (null = sem datação).
export function itemSortYear(metadata?: string | null): number | null {
  const meta = parseMeta(metadata)
  if (!meta) return null

  if (typeof meta.born === "number") return meta.born
  if (typeof meta.year === "number") return meta.year

  const period = meta.period
  if (period && typeof period === "object" && typeof (period as Meta).start === "number") {
    return (period as Meta).start as number
  }
  if (typeof meta.years === "string") {
    const y = yearFromString(meta.years)
    if (y !== null) return y
  }
  if (typeof period === "string") {
    const y = yearFromString(period)
    if (y !== null) return y
  }
  return null
}

// ─── Classificação ────────────────────────────────────────────────────────────

export function grandEraForYear(year: number): GrandEraId {
  for (const era of GRAND_ERAS) if (year < era.to) return era.id
  return "CONTEMPORANEA"
}

export function grandEraForItem(item: { type: string; metadata: string | null }): GrandEraId | null {
  // Itens ERA declaram o período pelo nome — respeita a curadoria antes do parse numérico
  if (item.type === "ERA") {
    const meta = parseMeta(item.metadata)
    if (meta && typeof meta.period === "string") {
      const byName = PERIOD_NAME_TO_ERA[meta.period.toLowerCase().trim()]
      if (byName) return byName
    }
  }
  const year = itemSortYear(item.metadata)
  return year === null ? null : grandEraForYear(year)
}

// ─── Exibição ─────────────────────────────────────────────────────────────────

export function fmtYear(y: number): string {
  if (y <= -1e9) return `${(-y / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Ga`
  if (y <= -1e5) return `${(-y / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} Ma`
  return y < 0 ? `${-y} a.C.` : `${y}`
}

// Rótulo curto de período para o card: "1685–1750", "1913", "3100–30 a.C."
export function itemYearsLabel(metadata?: string | null): string | null {
  const meta = parseMeta(metadata)
  if (!meta) return null

  if (typeof meta.born === "number") {
    const died = typeof meta.died === "number" ? fmtYear(meta.died) : "…"
    return `${fmtYear(meta.born)} – ${died}`
  }
  const period = meta.period
  if (period && typeof period === "object") {
    const { start, end } = period as { start?: unknown; end?: unknown }
    if (typeof start === "number") {
      return typeof end === "number" ? `${fmtYear(start)} – ${fmtYear(end)}` : fmtYear(start)
    }
  }
  if (typeof meta.year === "number") return fmtYear(meta.year)
  if (typeof meta.years === "string") return meta.years
  if (typeof period === "string" && /\d/.test(period)) return period
  return null
}
