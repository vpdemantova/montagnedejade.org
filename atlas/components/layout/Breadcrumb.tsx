"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PILL_H, NAV_PAD } from "./UnifiedNav"

// ── Hierarquia de rotas ───────────────────────────────────────────────────────

type RouteInfo = {
  label:    string
  section:  string
  sectionHref: string
  siblings: { href: string; label: string }[]
}

const ROUTES: Record<string, RouteInfo> = {
  // Atlas / Home
  "/": {
    label: "Atlas", section: "Atlas", sectionHref: "/",
    siblings: [
      { href: "/display",        label: "Display"  },
      { href: "/academia",       label: "Academia" },
      { href: "/portal/cultura", label: "Cultura"  },
      { href: "/hub",            label: "Hub"      },
    ],
  },
  "/display": {
    label: "Display", section: "Atlas", sectionHref: "/",
    siblings: [
      { href: "/",               label: "Acervo"   },
      { href: "/atlas/grafo",    label: "Grafo"    },
      { href: "/academia",       label: "Academia" },
    ],
  },
  "/atlas/grafo": {
    label: "Grafo", section: "Atlas", sectionHref: "/",
    siblings: [
      { href: "/",           label: "Acervo"    },
      { href: "/display",    label: "Display"   },
      { href: "/atlas/novo", label: "Novo item" },
    ],
  },
  "/atlas/novo": {
    label: "Novo item", section: "Atlas", sectionHref: "/",
    siblings: [
      { href: "/",            label: "Acervo" },
      { href: "/atlas/grafo", label: "Grafo"  },
    ],
  },

  // Academia
  "/academia": {
    label: "Academia", section: "Academia", sectionHref: "/academia",
    siblings: [
      { href: "/world",        label: "Mundo"     },
      { href: "/monument",     label: "Monumento" },
      { href: "/portal/vilas", label: "Vilas"     },
      { href: "/hub",          label: "Hub"       },
    ],
  },
  "/world": {
    label: "Mundo", section: "Academia", sectionHref: "/academia",
    siblings: [
      { href: "/academia",     label: "Academia"  },
      { href: "/monument",     label: "Monumento" },
      { href: "/portal/vilas", label: "Vilas"     },
    ],
  },
  "/monument": {
    label: "Monumento", section: "Academia", sectionHref: "/academia",
    siblings: [
      { href: "/academia",     label: "Academia" },
      { href: "/world",        label: "Mundo"    },
      { href: "/portal/vilas", label: "Vilas"    },
    ],
  },
  "/hub": {
    label: "Hub", section: "Academia", sectionHref: "/academia",
    siblings: [
      { href: "/academia", label: "Academia"  },
      { href: "/world",    label: "Mundo"     },
      { href: "/monument", label: "Monumento" },
    ],
  },

  // Cultura
  "/portal/cultura": {
    label: "Cultura", section: "Cultura", sectionHref: "/portal/cultura",
    siblings: [
      { href: "/social",       label: "Social" },
      { href: "/portal/vilas", label: "Vilas"  },
    ],
  },
  "/portal/vilas": {
    label: "Vilas", section: "Cultura", sectionHref: "/portal/cultura",
    siblings: [
      { href: "/portal/cultura", label: "Cultura" },
      { href: "/social",         label: "Social"  },
    ],
  },
  "/social": {
    label: "Social", section: "Cultura", sectionHref: "/portal/cultura",
    siblings: [
      { href: "/portal/cultura", label: "Cultura" },
      { href: "/portal/vilas",   label: "Vilas"   },
    ],
  },

  // Pessoal
  "/compass/quadro": {
    label: "Quadro", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/perfil",  label: "Perfil" },
      { href: "/compass/estudos", label: "Work"   },
      { href: "/compass/diario",  label: "Diário" },
      { href: "/compass/metas",   label: "Metas"  },
    ],
  },
  "/compass/perfil": {
    label: "Perfil", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/quadro",  label: "Quadro" },
      { href: "/compass/estudos", label: "Work"   },
      { href: "/compass/diario",  label: "Diário" },
      { href: "/compass/metas",   label: "Metas"  },
    ],
  },
  "/compass/estudos": {
    label: "Work", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/quadro", label: "Quadro" },
      { href: "/compass/perfil", label: "Perfil" },
      { href: "/compass/metas",  label: "Metas"  },
      { href: "/compass/diario", label: "Diário" },
    ],
  },
  "/compass/diario": {
    label: "Diário", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/quadro",  label: "Quadro" },
      { href: "/compass/notas",   label: "Notas"  },
      { href: "/compass/metas",   label: "Metas"  },
      { href: "/compass/estudos", label: "Work"   },
    ],
  },
  "/compass/notas": {
    label: "Notas", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/quadro",  label: "Quadro" },
      { href: "/compass/diario",  label: "Diário" },
      { href: "/compass/metas",   label: "Metas"  },
    ],
  },
  "/compass/metas": {
    label: "Metas", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/quadro",  label: "Quadro" },
      { href: "/compass/estudos", label: "Work"   },
      { href: "/compass/diario",  label: "Diário" },
    ],
  },
  "/compass/mapa": {
    label: "Mapa", section: "Pessoal", sectionHref: "/compass/quadro",
    siblings: [
      { href: "/compass/quadro", label: "Quadro" },
      { href: "/compass/perfil", label: "Perfil" },
    ],
  },

  // Sistema
  "/settings": {
    label: "Configurações", section: "Sistema", sectionHref: "/settings",
    siblings: [{ href: "/sobre", label: "Sobre" }],
  },
  "/sobre": {
    label: "Sobre", section: "Sistema", sectionHref: "/settings",
    siblings: [{ href: "/settings", label: "Configurações" }],
  },
}

// ── Resolve rota dinâmica (ex: /atlas/slug) ───────────────────────────────────

function resolveRoute(pathname: string): RouteInfo | null {
  if (ROUTES[pathname]) return ROUTES[pathname]!

  // Item do Atlas: /atlas/[slug]
  if (pathname.startsWith("/atlas/") && !pathname.startsWith("/atlas/novo") && !pathname.startsWith("/atlas/grafo")) {
    const slug = pathname.replace("/atlas/", "")
    const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    return {
      label,
      section: "Atlas",
      sectionHref: "/",
      siblings: [
        { href: "/",            label: "Acervo"  },
        { href: "/display",     label: "Display" },
        { href: "/atlas/grafo", label: "Grafo"   },
      ],
    }
  }

  // Perfil de cultura: /portal/cultura/perfil/[slug]
  if (pathname.startsWith("/portal/cultura/")) {
    return {
      label: "Perfil",
      section: "Cultura",
      sectionHref: "/portal/cultura",
      siblings: [
        { href: "/portal/cultura", label: "Cultura" },
        { href: "/social",         label: "Social"  },
      ],
    }
  }

  // Vilas com área: /portal/vilas/[area]
  if (pathname.startsWith("/portal/vilas/")) {
    const area = pathname.replace("/portal/vilas/", "").replace(/-/g, " ")
    return {
      label: area,
      section: "Cultura",
      sectionHref: "/portal/cultura",
      siblings: [
        { href: "/portal/vilas",   label: "Vilas"   },
        { href: "/portal/cultura", label: "Cultura" },
      ],
    }
  }

  // Diário entrada: /compass/diario/[id]
  if (pathname.startsWith("/compass/diario/")) {
    return {
      label: "Entrada",
      section: "Pessoal",
      sectionHref: "/compass/quadro",
      siblings: [
        { href: "/compass/diario",  label: "Diário" },
        { href: "/compass/quadro",  label: "Quadro" },
      ],
    }
  }

  // Nota: /compass/notas/[id]
  if (pathname.startsWith("/compass/notas/")) {
    return {
      label: "Nota",
      section: "Pessoal",
      sectionHref: "/compass/quadro",
      siblings: [
        { href: "/compass/notas",  label: "Notas"  },
        { href: "/compass/quadro", label: "Quadro" },
      ],
    }
  }

  return null
}

// ── Estilos compartilhados ───────────────────────────────────────────────────

const LINK_ACTIVE: React.CSSProperties  = { color: "rgb(var(--c-text))",      fontWeight: 500 }
const LINK_NORMAL: React.CSSProperties  = { color: "rgb(var(--c-text) / 0.62)" }
const LINK_SIBLING: React.CSSProperties = { color: "rgb(var(--c-text) / 0.55)" }
const SEP_STYLE:    React.CSSProperties = { color: "rgb(var(--c-border) / 0.45)", userSelect: "none" }
const TEXT_STYLE    = { fontFamily: "var(--font-mono, monospace)", fontSize: "7.5px", letterSpacing: "0.18em", textTransform: "uppercase" as const }

// ── Componente ────────────────────────────────────────────────────────────────

export function Breadcrumb() {
  const pathname = usePathname()

  // Não mostra em rotas de autenticação
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return null

  const info = resolveRoute(pathname)
  if (!info) return null

  const isSectionRoot = pathname === info.sectionHref
  const siblings = info.siblings.filter((s) => s.href !== pathname)

  return (
    <div
      className="fixed z-40 inset-x-0"
      style={{
        top:              `${PILL_H}px`,
        height:           "28px",
        display:          "flex",
        alignItems:       "center",
        justifyContent:   "space-between",
        paddingLeft:      NAV_PAD,
        paddingRight:     NAV_PAD,
        background:       "rgb(var(--c-void) / 0.90)",
        borderBottom:     "1px solid rgb(var(--c-border) / 0.12)",
        backdropFilter:   "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        overflow:         "hidden",
      }}
    >
      {/* Esquerda — caminho */}
      <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
        {/* Seção */}
        {!isSectionRoot ? (
          <>
            <Link href={info.sectionHref} style={{ ...TEXT_STYLE, ...LINK_NORMAL }} className="hover:opacity-70 transition-opacity whitespace-nowrap">
              {info.section}
            </Link>
            <span style={{ ...TEXT_STYLE, ...SEP_STYLE }}>/</span>
          </>
        ) : null}

        {/* Página atual */}
        <span style={{ ...TEXT_STYLE, ...LINK_ACTIVE }} className="truncate">
          {info.label}
        </span>
      </div>

      {/* Separador central */}
      {siblings.length > 0 && (
        <span
          className="flex-shrink-0 mx-3"
          style={{ width: "1px", height: "10px", background: "rgb(var(--c-border) / 0.2)" }}
        />
      )}

      {/* Direita — irmãos (mesmo nível) */}
      {siblings.length > 0 && (
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          {siblings.slice(0, 5).map((s, i) => (
            <span key={s.href} className="flex items-center gap-3 flex-shrink-0">
              {i > 0 && <span style={{ ...TEXT_STYLE, ...SEP_STYLE }}>·</span>}
              <Link
                href={s.href}
                style={{ ...TEXT_STYLE, ...LINK_SIBLING }}
                className="hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                {s.label}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
