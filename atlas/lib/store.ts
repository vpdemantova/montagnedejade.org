import { create } from "zustand"
import { persist } from "zustand/middleware"

// ─── Custom color/texture types ───────────────────────────────────────────────

export type CssVar =
  | "--c-void" | "--c-deep" | "--c-surface" | "--c-border"
  | "--c-text" | "--c-muted" | "--c-accent" | "--c-teal"

export type PatternId = "none" | "grid" | "dots" | "horizontal" | "diagonal" | "grain"

// ─── Interface modes ──────────────────────────────────────────────────────────

export type InterfaceMode = "FOCUS" | "CONTEMPLATION" | "ATLAS" | "PUBLIC"

export type SolarTheme =
  | "default" | "papel-amarelo" | "terminal" | "blueprint" | "academia"
  | "azulejo" | "floresta" | "aurora" | "jazz" | "manuscrito"
  | "neon-tokyo" | "mercurio" | "vulcao" | "gelo" | "carvao"
  | "museu" | "submarino" | "botanica" | "cosmos-violeta" | "mapa-antigo"
  | "mogno" | "jardim" | "deserto" | "cibernetico" | "dusk"
  | "laboratorio" | "tinta-china" | "oceano" | "sakura" | "arcade"
  | "solar-inverso" | "platina"

// ─── Home sections config ─────────────────────────────────────────────────────

export type HomeSectionId =
  | "monument"
  | "saudacao"
  | "escola"
  | "hub"
  | "plataforma"
  | "consciencia"
  | "artes"
  | "recentes"
  | "rss"
  | "stats"
  | "worldboard"

export type HomeSectionConfig = {
  id:      HomeSectionId
  label:   string
  visible: boolean
}

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { id: "monument",    label: "Monumento Solar",     visible: true  },
  { id: "saudacao",    label: "Saudação & Títulos",  visible: true  },
  { id: "escola",      label: "Escola das Artes 3D", visible: true  },
  { id: "hub",         label: "Hub — O que é isso",  visible: true  },
  { id: "plataforma",  label: "Sobre a Plataforma",  visible: true  },
  { id: "consciencia", label: "Consciência",         visible: true  },
  { id: "artes",       label: "Acervo de Artes",     visible: false },
  { id: "recentes",    label: "Recentes & Descoberta", visible: false },
  { id: "rss",         label: "Notícias & Feeds",    visible: false },
  { id: "stats",       label: "Estatísticas",        visible: false },
  { id: "worldboard",  label: "WorldBoard",          visible: false },
]

// ─── Atlas da Humanidade — Categories ────────────────────────────────────────

export type AtlasCategory = {
  id:      string
  label:   string
  parent?: string   // id of parent category (for nesting)
  color?:  string
  enabled: boolean
}

export const DEFAULT_ATLAS_CATEGORIES: AtlasCategory[] = [
  // ── Natureza ──────────────────────────────────────────
  { id: "natureza",          label: "Natureza",           enabled: true  },
  { id: "animais",           label: "Animais",            parent: "natureza", enabled: true  },
  { id: "plantas",           label: "Plantas",            parent: "natureza", enabled: true  },
  { id: "fungos",            label: "Fungos",             parent: "natureza", enabled: true  },
  { id: "minerais",          label: "Minerais",           parent: "natureza", enabled: true  },
  { id: "biomas",            label: "Biomas",             parent: "natureza", enabled: true  },
  { id: "oceanos",           label: "Oceanos",            parent: "natureza", enabled: true  },
  { id: "rios",              label: "Rios",               parent: "natureza", enabled: true  },
  { id: "montanhas",         label: "Montanhas",          parent: "natureza", enabled: true  },
  { id: "fenomenos",         label: "Fenômenos Naturais", parent: "natureza", enabled: true  },

  // ── Humanidade ────────────────────────────────────────
  { id: "humanidade",        label: "Humanidade",         enabled: true  },
  { id: "civilizacoes",      label: "Civilizações",       parent: "humanidade", enabled: true  },
  { id: "culturas",          label: "Culturas",           parent: "humanidade", enabled: true  },
  { id: "linguas",           label: "Línguas",            parent: "humanidade", enabled: true  },
  { id: "religioes",         label: "Religiões",          parent: "humanidade", enabled: true  },
  { id: "mitologias",        label: "Mitologias",         parent: "humanidade", enabled: true  },
  { id: "filosofias",        label: "Filosofias",         parent: "humanidade", enabled: true  },
  { id: "povos",             label: "Povos",              parent: "humanidade", enabled: true  },
  { id: "costumes",          label: "Costumes",           parent: "humanidade", enabled: true  },

  // ── Ciências ──────────────────────────────────────────
  { id: "ciencias",          label: "Ciências",           enabled: true  },
  { id: "astronomia",        label: "Astronomia",         parent: "ciencias", enabled: true  },
  { id: "fisica",            label: "Física",             parent: "ciencias", enabled: true  },
  { id: "quimica",           label: "Química",            parent: "ciencias", enabled: true  },
  { id: "biologia",          label: "Biologia",           parent: "ciencias", enabled: true  },
  { id: "medicina",          label: "Medicina",           parent: "ciencias", enabled: true  },
  { id: "matematica",        label: "Matemática",         parent: "ciencias", enabled: true  },
  { id: "geologia",          label: "Geologia",           parent: "ciencias", enabled: true  },
  { id: "computacao-cat",    label: "Computação",         parent: "ciencias", enabled: true  },
  { id: "psicologia",        label: "Psicologia",         parent: "ciencias", enabled: true  },
  { id: "arqueologia",       label: "Arqueologia",        parent: "ciencias", enabled: true  },

  // ── Artes ─────────────────────────────────────────────
  { id: "artes",             label: "Artes",              enabled: true  },
  { id: "musica",            label: "Música",             parent: "artes", enabled: true  },
  { id: "pintura",           label: "Pintura",            parent: "artes", enabled: true  },
  { id: "escultura",         label: "Escultura",          parent: "artes", enabled: true  },
  { id: "literatura",        label: "Literatura",         parent: "artes", enabled: true  },
  { id: "arquitetura-cat",   label: "Arquitetura",        parent: "artes", enabled: true  },
  { id: "cinema",            label: "Cinema",             parent: "artes", enabled: true  },
  { id: "teatro",            label: "Teatro",             parent: "artes", enabled: true  },
  { id: "danca",             label: "Dança",              parent: "artes", enabled: true  },
  { id: "fotografia",        label: "Fotografia",         parent: "artes", enabled: true  },
  { id: "design",            label: "Design",             parent: "artes", enabled: true  },
  { id: "artesanato",        label: "Artesanato",         parent: "artes", enabled: true  },

  // ── Técnica ───────────────────────────────────────────
  { id: "tecnica",           label: "Técnica",            enabled: true  },
  { id: "invencoes",         label: "Invenções",          parent: "tecnica", enabled: true  },
  { id: "maquinas",          label: "Máquinas",           parent: "tecnica", enabled: true  },
  { id: "estruturas",        label: "Estruturas",         parent: "tecnica", enabled: true  },
  { id: "materiais",         label: "Materiais",          parent: "tecnica", enabled: true  },
  { id: "instrumentos",      label: "Instrumentos",       parent: "tecnica", enabled: true  },
  { id: "ferramentas",       label: "Ferramentas",        parent: "tecnica", enabled: true  },
  { id: "tecnologias",       label: "Tecnologias",        parent: "tecnica", enabled: true  },

  // ── História ──────────────────────────────────────────
  { id: "historia",          label: "História",           enabled: true  },
  { id: "eras",              label: "Eras",               parent: "historia", enabled: true  },
  { id: "eventos",           label: "Eventos",            parent: "historia", enabled: true  },
  { id: "batalhas",          label: "Batalhas",           parent: "historia", enabled: true  },
  { id: "tratados",          label: "Tratados",           parent: "historia", enabled: true  },
  { id: "revolucoes",        label: "Revoluções",         parent: "historia", enabled: true  },
  { id: "descobertas",       label: "Descobertas",        parent: "historia", enabled: true  },
  { id: "documentos",        label: "Documentos",         parent: "historia", enabled: true  },

  // ── Geografia ─────────────────────────────────────────
  { id: "geografia",         label: "Geografia",          enabled: true  },
  { id: "paises",            label: "Países",             parent: "geografia", enabled: true  },
  { id: "cidades",           label: "Cidades",            parent: "geografia", enabled: true  },
  { id: "monumentos-cat",    label: "Monumentos",         parent: "geografia", enabled: true  },
  { id: "paisagens",         label: "Paisagens",          parent: "geografia", enabled: true  },
  { id: "sitios-unesco",     label: "Sítios UNESCO",      parent: "geografia", enabled: true  },
  { id: "regioes",           label: "Regiões",            parent: "geografia", enabled: true  },

  // ── Pessoas ───────────────────────────────────────────
  { id: "pessoas-cat",       label: "Pessoas",            enabled: true  },
  { id: "cientistas",        label: "Cientistas",         parent: "pessoas-cat", enabled: true  },
  { id: "artistas",          label: "Artistas",           parent: "pessoas-cat", enabled: true  },
  { id: "filosofos",         label: "Filósofos",          parent: "pessoas-cat", enabled: true  },
  { id: "exploradores",      label: "Exploradores",       parent: "pessoas-cat", enabled: true  },
  { id: "lideres",           label: "Líderes",            parent: "pessoas-cat", enabled: true  },
  { id: "compositores",      label: "Compositores",       parent: "pessoas-cat", enabled: true  },
  { id: "pintores",          label: "Pintores",           parent: "pessoas-cat", enabled: true  },
  { id: "escritores",        label: "Escritores",         parent: "pessoas-cat", enabled: true  },
  { id: "santos",            label: "Santos",             parent: "pessoas-cat", enabled: true  },
  { id: "matematicos",       label: "Matemáticos",        parent: "pessoas-cat", enabled: true  },
  { id: "arquitetos",        label: "Arquitetos",         parent: "pessoas-cat", enabled: true  },
  { id: "inventores",        label: "Inventores",         parent: "pessoas-cat", enabled: true  },
  { id: "musicos",           label: "Músicos",            parent: "pessoas-cat", enabled: true  },
  { id: "botanicos",         label: "Botânicos",          parent: "pessoas-cat", enabled: true  },
  { id: "arqueologos",       label: "Arqueólogos",        parent: "pessoas-cat", enabled: true  },
  { id: "fisicos",           label: "Físicos",            parent: "pessoas-cat", enabled: true  },

  // ── Criações ──────────────────────────────────────────
  { id: "criacoes",          label: "Criações",           enabled: true  },
  { id: "obras-cat",         label: "Obras",              parent: "criacoes", enabled: true  },
  { id: "livros",            label: "Livros",             parent: "criacoes", enabled: true  },
  { id: "partituras-cat",    label: "Partituras",         parent: "criacoes", enabled: true  },
  { id: "planos",            label: "Planos",             parent: "criacoes", enabled: true  },
  { id: "objetos",           label: "Objetos",            parent: "criacoes", enabled: true  },
  { id: "guias",             label: "Guias",              parent: "criacoes", enabled: true  },
]

interface SolarStore {
  // User profile
  userName:    string
  userTagline: string
  setUserProfile: (name: string, tagline: string) => void
  // Interface
  mode:            InterfaceMode
  setMode:         (m: InterfaceMode) => void
  theme:           SolarTheme
  setTheme:        (t: SolarTheme) => void
  sidebarExpanded: { portal: boolean; compass: boolean }
  toggleSection:   (s: "portal" | "compass") => void
  lastVisited:     string[]
  pushVisited:     (path: string) => void
  atlasCategories:    AtlasCategory[]
  setAtlasCategories: (cats: AtlasCategory[]) => void
  toggleCategory:     (id: string) => void
  addCategory:        (cat: AtlasCategory) => void
  removeCategory:     (id: string) => void
  // Custom colors & texture
  customColors:       Partial<Record<CssVar, string>>
  setCustomColor:     (variable: CssVar, value: string) => void
  deleteCustomColor:  (variable: CssVar) => void
  resetCustomColors:  () => void
  customPattern:      PatternId
  setCustomPattern:   (p: PatternId) => void
  // Home sections
  homeSections:          HomeSectionConfig[]
  toggleHomeSection:     (id: HomeSectionId) => void
  reorderHomeSections:   (ids: HomeSectionId[]) => void
}

export const useSolarStore = create<SolarStore>()(
  persist(
    (set, get) => ({
      userName:       "Diamantov",
      userTagline:    "Design Digital · PUCC",
      setUserProfile: (userName, userTagline) => set({ userName, userTagline }),

      mode:     "ATLAS",
      setMode:  (mode) => set({ mode }),

      theme:    "papel-amarelo",
      setTheme: (theme) => set({ theme }),

      sidebarExpanded: { portal: true, compass: true },
      toggleSection: (s) =>
        set((state) => ({
          sidebarExpanded: {
            ...state.sidebarExpanded,
            [s]: !state.sidebarExpanded[s],
          },
        })),

      lastVisited: [],
      pushVisited: (path) => {
        const prev = get().lastVisited.filter((p) => p !== path)
        set({ lastVisited: [path, ...prev].slice(0, 20) })
      },

      atlasCategories: DEFAULT_ATLAS_CATEGORIES,
      setAtlasCategories: (cats) => set({ atlasCategories: cats }),
      toggleCategory: (id) =>
        set((state) => ({
          atlasCategories: state.atlasCategories.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
          ),
        })),
      addCategory: (cat) =>
        set((state) => ({
          atlasCategories: [...state.atlasCategories, cat],
        })),
      removeCategory: (id) =>
        set((state) => ({
          atlasCategories: state.atlasCategories.filter((c) => c.id !== id),
        })),

      customColors: {},
      setCustomColor: (variable, value) =>
        set((state) => ({ customColors: { ...state.customColors, [variable]: value } })),
      deleteCustomColor: (variable) =>
        set((state) => {
          const next = { ...state.customColors }
          delete next[variable]
          return { customColors: next }
        }),
      resetCustomColors: () => set({ customColors: {} }),
      customPattern: "none",
      setCustomPattern: (p) => set({ customPattern: p }),

      homeSections: DEFAULT_HOME_SECTIONS,
      toggleHomeSection: (id) =>
        set((state) => ({
          homeSections: state.homeSections.map((s) =>
            s.id === id ? { ...s, visible: !s.visible } : s
          ),
        })),
      reorderHomeSections: (ids) =>
        set((state) => ({
          homeSections: ids
            .map((id) => state.homeSections.find((s) => s.id === id))
            .filter((s): s is HomeSectionConfig => Boolean(s)),
        })),
    }),
    {
      name:    "solaris-store",
      version: 2,
      migrate: (persisted: unknown, fromVersion: number) => {
        const s = persisted as Partial<SolarStore> & { _version?: number }
        // v0→v1: force light paper theme for users that had dark cosmos stored
        if (fromVersion < 2) {
          return { ...s, theme: "papel-amarelo" as const, mode: "ATLAS" as const }
        }
        return s
      },
    }
  )
)

// ─── Sidebar state (kept for compatibility) ───────────────────────────────────

interface SidebarStore {
  expandedGroups: Record<string, boolean>
  toggleGroup:    (group: string) => void
  setGroup:       (group: string, open: boolean) => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      expandedGroups: { portal: true, compass: true },
      toggleGroup: (group) =>
        set((state) => ({
          expandedGroups: {
            ...state.expandedGroups,
            [group]: !state.expandedGroups[group],
          },
        })),
      setGroup: (group, open) =>
        set((state) => ({
          expandedGroups: { ...state.expandedGroups, [group]: open },
        })),
    }),
    { name: "solaris-sidebar" }
  )
)

// ─── View per route ───────────────────────────────────────────────────────────

interface ViewRouteStore {
  viewPerRoute:    Record<string, string>
  setViewForRoute: (route: string, view: string) => void
  getViewForRoute: (route: string, fallback: string) => string
}

export const useViewStore = create<ViewRouteStore>()(
  persist(
    (set, get) => ({
      viewPerRoute: {},
      setViewForRoute: (route, view) =>
        set((state) => ({ viewPerRoute: { ...state.viewPerRoute, [route]: view } })),
      getViewForRoute: (route, fallback) =>
        get().viewPerRoute[route] ?? fallback,
    }),
    { name: "solaris-view-route" }
  )
)

// ─── Legacy alias (used in older components) ──────────────────────────────────

export const useInterfaceMode = () => {
  const { mode, setMode } = useSolarStore()
  return { mode, setMode }
}
