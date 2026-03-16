import type { AtlasItem, Tag, AtlasRelation } from "@prisma/client"

// ─── Enums de domínio (SQLite não suporta enums nativos no Prisma) ─────────────

export const ItemType = {
  PAGE: "PAGE",
  PERSON: "PERSON",
  WORK: "WORK",
  OBJECT: "OBJECT",
  CONCEPT: "CONCEPT",
  COURSE: "COURSE",
  READING: "READING",
  REPERTOIRE: "REPERTOIRE",
} as const
export type ItemType = (typeof ItemType)[keyof typeof ItemType]

export const AreaType = {
  ACADEMIA: "ACADEMIA",
  ARTES: "ARTES",
  CULTURA: "CULTURA",
  STUDIO: "STUDIO",
  COMPASS: "COMPASS",
  ATLAS: "ATLAS",
} as const
export type AreaType = (typeof AreaType)[keyof typeof AreaType]

export const StatusType = {
  ACTIVE: "ACTIVE",
  BACKLOG: "BACKLOG",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
  FAVORITE: "FAVORITE",
} as const
export type StatusType = (typeof StatusType)[keyof typeof StatusType]

export const ViewType = {
  LIST: "LIST",
  TABLE: "TABLE",
  KANBAN: "KANBAN",
  GALLERY: "GALLERY",
  ATLAS_MAP: "ATLAS_MAP",
} as const
export type ViewType = (typeof ViewType)[keyof typeof ViewType]

// ─── Re-exporta tipos do Prisma ───────────────────────────────────────────────

export type { AtlasItem, Tag, AtlasRelation }

// ─── Tipos compostos de aplicação ────────────────────────────────────────────

// AtlasItem com tags carregadas (padrão da maioria das queries)
export type AtlasItemWithTags = AtlasItem & {
  tags: Tag[]
}

// AtlasItem com todas as relações carregadas
export type AtlasItemFull = AtlasItem & {
  tags: Tag[]
  relationsFrom: AtlasRelation[]
  relationsTo: AtlasRelation[]
}

// Conteúdo BlockNote serializado como string JSON
export type BlockNoteContent = string

// Resultado de busca fuzzy (Fuse.js)
export type SearchResult = {
  item: AtlasItemWithTags
  score: number
  matchedFields: string[]
}

// Grafo de relações para visualização (AtlasMapView)
export type RelationGraph = {
  nodes: AtlasItemWithTags[]
  edges: Array<{
    from: string
    to: string
    type: string
  }>
}

// Metadados flexíveis parseados do campo metadata (JSON string no banco)
export type AtlasMetadata = {
  period?: { start?: number; end?: number }
  location?: string
  language?: string
  isbn?: string
  rating?: number
  url?: string
  [key: string]: unknown
}

// Opções de filtro para queries
export type AtlasFilterOptions = {
  area?: AreaType
  type?: ItemType
  status?: StatusType
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

// Labels em português para exibição na UI
export const AREA_LABELS: Record<AreaType, string> = {
  ACADEMIA: "Academia",
  ARTES: "Artes",
  CULTURA: "Cultura",
  STUDIO: "Studio",
  COMPASS: "Compass",
  ATLAS: "Atlas",
}

export const TYPE_LABELS: Record<ItemType, string> = {
  PAGE: "Página",
  PERSON: "Pessoa",
  WORK: "Obra",
  OBJECT: "Objeto",
  CONCEPT: "Conceito",
  COURSE: "Curso",
  READING: "Leitura",
  REPERTOIRE: "Repertório",
}

export const STATUS_LABELS: Record<StatusType, string> = {
  ACTIVE: "Ativo",
  BACKLOG: "Pendente",
  COMPLETED: "Concluído",
  ARCHIVED: "Arquivado",
  FAVORITE: "Favorito",
}

export const AREA_COLORS: Record<AreaType, string> = {
  ACADEMIA: "#C8A45A",
  ARTES: "#4A7C6F",
  CULTURA: "#4A6C7C",
  STUDIO: "#7C4A7C",
  COMPASS: "#E8E4DC",
  ATLAS: "#C8A45A",
}
