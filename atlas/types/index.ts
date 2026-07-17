import type { AtlasItem, Tag, AtlasRelation, WorldNotice, Asset, AssetLink } from "@prisma/client"

// ─── Enums de domínio (SQLite não suporta enums nativos no Prisma) ─────────────

export const Hemisphere = {
  PORTAL:  "PORTAL",
  COMPASS: "COMPASS",
} as const
export type Hemisphere = (typeof Hemisphere)[keyof typeof Hemisphere]

export const ItemType = {
  PAGE:       "PAGE",
  PERSON:     "PERSON",
  WORK:       "WORK",
  OBJECT:     "OBJECT",
  CONCEPT:    "CONCEPT",
  COURSE:     "COURSE",
  READING:    "READING",
  REPERTOIRE: "REPERTOIRE",
  PARTITURA:  "PARTITURA",
  NOTA:       "NOTA",
  AULA:       "AULA",
  PATH:       "PATH",
  // Enciclopédia — tipos do acervo universal (Atlas como "novo Wikipedia")
  ERA:        "ERA",
  EVENT:      "EVENT",
  MOVEMENT:   "MOVEMENT",
  PLACE:      "PLACE",
  ELEMENT:    "ELEMENT",
  INSTRUMENT: "INSTRUMENT",
  SPECIES:    "SPECIES",
} as const
export type ItemType = (typeof ItemType)[keyof typeof ItemType]

export const AreaType = {
  // Portal Solar
  ACADEMIA:   "ACADEMIA",
  ARTES:      "ARTES",
  CULTURA:    "CULTURA",
  OBRAS:      "OBRAS",
  PESSOAS:    "PESSOAS",
  STUDIO:     "STUDIO",     // legacy — mantido para dados existentes
  COMPUTACAO: "COMPUTACAO",
  AULAS:      "AULAS",
  ATLAS:      "ATLAS",
  // Numita Compass
  DIARIO:     "DIARIO",
  PERFIL:     "PERFIL",
  NOTAS:      "NOTAS",
  COMPASS:    "COMPASS",    // legacy
  // Escolas — áreas independentes de conhecimento/prática
  MIND:           "MIND",
  MANIFESTATION:  "MANIFESTATION",
  FOUNDATION:     "FOUNDATION",
  EXPRESSION:     "EXPRESSION",
  HYMNS:          "HYMNS",
} as const
export type AreaType = (typeof AreaType)[keyof typeof AreaType]

export const AssetKind = {
  IMAGE:    "IMAGE",
  AUDIO:    "AUDIO",
  VIDEO:    "VIDEO",
  PDF:      "PDF",
  DOCUMENT: "DOCUMENT",
  OTHER:    "OTHER",
} as const
export type AssetKind = (typeof AssetKind)[keyof typeof AssetKind]

export const StatusType = {
  ACTIVE:    "ACTIVE",
  BACKLOG:   "BACKLOG",
  COMPLETED: "COMPLETED",
  ARCHIVED:  "ARCHIVED",
  FAVORITE:  "FAVORITE",
} as const
export type StatusType = (typeof StatusType)[keyof typeof StatusType]

export const ViewType = {
  LIST:       "LIST",
  TABLE:      "TABLE",
  KANBAN:     "KANBAN",
  GALLERY:    "GALLERY",
  ATLAS_MAP:  "ATLAS_MAP",
  SHELVES:    "SHELVES",
  INDEX:      "INDEX",
  AUTORES:    "AUTORES",
  PARTITURAS: "PARTITURAS",
  CURSOS:     "CURSOS",
  REPERTORIO: "REPERTORIO",
  READINGS:   "READINGS",
  HORIZONTAL: "HORIZONTAL",
} as const
export type ViewType = (typeof ViewType)[keyof typeof ViewType]

export const NoticeType = {
  OBRA:       "OBRA",
  AVISO:      "AVISO",
  EVENTO:     "EVENTO",
  DESCOBERTA: "DESCOBERTA",
  HOMENAGEM:  "HOMENAGEM",
  CITACAO:    "CITACAO",
} as const
export type NoticeType = (typeof NoticeType)[keyof typeof NoticeType]

// ─── Re-exporta tipos do Prisma ───────────────────────────────────────────────

export type { AtlasItem, Tag, AtlasRelation, WorldNotice, Asset, AssetLink }

// ─── Tipos compostos de aplicação ────────────────────────────────────────────

export type AtlasItemWithTags = AtlasItem & {
  tags: Tag[]
}

export type AssetWithLinks = Asset & {
  links: Array<AssetLink & { item: Pick<AtlasItem, "id" | "title" | "slug" | "area" | "type"> }>
}

export type AtlasItemFull = AtlasItem & {
  tags: Tag[]
  relationsFrom: AtlasRelation[]
  relationsTo: AtlasRelation[]
}

export type BlockNoteContent = string

export type SearchResult = {
  item: AtlasItemWithTags
  score: number
  matchedFields: string[]
}

export type RelationGraph = {
  nodes: AtlasItemWithTags[]
  edges: Array<{
    from: string
    to: string
    type: string
  }>
}

export type AtlasMetadata = {
  period?:   { start?: number; end?: number }
  location?: string
  language?: string
  isbn?:     string
  rating?:   number
  url?:      string
  [key: string]: unknown
}

export type AtlasFilterOptions = {
  area?:       AreaType
  type?:       ItemType
  status?:     StatusType
  hemisphere?: Hemisphere
  tags?:       string[]
  search?:     string
  limit?:      number
  offset?:     number
}

// ─── Labels em português ──────────────────────────────────────────────────────

export const AREA_LABELS: Record<string, string> = {
  ACADEMIA:   "Academia",
  ARTES:      "Artes",
  CULTURA:    "Cultura",
  OBRAS:      "Obras",
  PESSOAS:    "Pessoas",
  STUDIO:     "Studio",
  COMPUTACAO: "Computação",
  AULAS:      "Aulas",
  ATLAS:      "Atlas",
  DIARIO:     "Diário",
  PERFIL:     "Perfil",
  NOTAS:      "Notas",
  COMPASS:    "Compass",
  MIND:           "Mente",
  MANIFESTATION:  "Manifestação",
  FOUNDATION:     "Fundamentos",
  EXPRESSION:     "Expressão",
  HYMNS:          "Hinos",
  // Áreas do acervo enciclopédico (presentes nos dados do seed)
  HISTORIA:     "História",
  CIENCIAS:     "Ciências",
  NATUREZA:     "Natureza",
  COSMOS:       "Cosmos",
  ELEMENTOS:    "Elementos",
  MUSICA:       "Música",
  MUSICOS:      "Músicos",
  PINTORES:     "Pintores",
  PINTURAS:     "Pinturas",
  ESCRITORES:   "Escritores",
  FILOSOFOS:    "Filósofos",
  CIENTISTAS:   "Cientistas",
  ARQUITETURA:  "Arquitetura",
  BIBLIOTECA:   "Biblioteca",
}

export const TYPE_LABELS: Record<string, string> = {
  PAGE:       "Página",
  PERSON:     "Pessoa",
  WORK:       "Obra",
  OBJECT:     "Objeto",
  CONCEPT:    "Conceito",
  COURSE:     "Curso",
  READING:    "Leitura",
  REPERTOIRE: "Repertório",
  PARTITURA:  "Partitura",
  NOTA:       "Nota",
  AULA:       "Aula",
  PATH:       "Trilha",
  ERA:        "Era",
  EVENT:      "Evento",
  MOVEMENT:   "Movimento",
  PLACE:      "Lugar",
  ELEMENT:    "Elemento",
  INSTRUMENT: "Instrumento",
  SPECIES:    "Espécie",
}

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE:    "Ativo",
  BACKLOG:   "Pendente",
  COMPLETED: "Concluído",
  ARCHIVED:  "Arquivado",
  FAVORITE:  "Favorito",
}

export const NOTICE_LABELS: Record<string, string> = {
  OBRA:       "Obra",
  AVISO:      "Aviso",
  EVENTO:     "Evento",
  DESCOBERTA: "Descoberta",
  HOMENAGEM:  "Homenagem",
  CITACAO:    "Citação",
}

export const AREA_COLORS: Record<string, string> = {
  ACADEMIA:   "#C8A45A",
  ARTES:      "#4A7C6F",
  CULTURA:    "#4A6C7C",
  OBRAS:      "#8C6D3F",
  PESSOAS:    "#6B7C8C",
  STUDIO:     "#7C4A7C",
  COMPUTACAO: "#4A5C7C",
  AULAS:      "#5C7C4A",
  ATLAS:      "#C8A45A",
  DIARIO:     "#7CFC6A",
  PERFIL:     "#4DB84A",
  NOTAS:      "#7CFC6A",
  COMPASS:    "#7CFC6A",
  MIND:           "#5C7C9B",
  MANIFESTATION:  "#B85C3F",
  FOUNDATION:     "#7C8C4A",
  EXPRESSION:     "#C77DAE",
  HYMNS:          "#9B8C4A",
}

// Áreas visíveis no Portal Solar (hemisferio PORTAL)
export const PORTAL_AREAS = [
  AreaType.ACADEMIA,
  AreaType.ARTES,
  AreaType.CULTURA,
  AreaType.OBRAS,
  AreaType.PESSOAS,
  AreaType.COMPUTACAO,
  AreaType.AULAS,
  AreaType.MIND,
  AreaType.MANIFESTATION,
  AreaType.FOUNDATION,
  AreaType.EXPRESSION,
  AreaType.HYMNS,
] as const

// Áreas do Numita Compass (hemisferio COMPASS)
export const COMPASS_AREAS = [
  AreaType.DIARIO,
  AreaType.PERFIL,
  AreaType.NOTAS,
] as const
