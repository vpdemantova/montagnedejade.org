// ╔══════════════════════════════════════════════════════════════════════════╗
// ║          PORTAL SOLAR — ARQUIVO DE CONTROLE CENTRAL                    ║
// ║  Altere os valores aqui para modificar aparência e comportamento.      ║
// ║  Cada flag tem documentação inline com: arquivo afetado + linha exata. ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// 1. ÍCONES
//    Controla a visibilidade de TODOS os ícones Lucide do app.
//
//    SHOW_ICONS: false → modo tipográfico puro, sem ícones
//    SHOW_ICONS: true  → ícones visíveis (comportamento original)
//
//    Arquivos afetados (todos leem `UI.SHOW_ICONS`):
//      atlas/components/layout/SidebarNav.tsx   — Home, Globe2, Drama, Users,
//        BookOpen, BookHeart, FileText, Target, GraduationCap, MapPin,
//        Settings2, LogOut, Sun, ChevronRight, Search, Plus, Info
//      atlas/components/layout/BottomNav.tsx    — Home, BookOpen, Globe2, Plus,
//        BookHeart, Search, AlignJustify, Drama, Users, FileText, Target,
//        GraduationCap, MapPin, UserCircle, Settings2, LogOut, Info,
//        Landmark, GitBranch, Pencil, Eye, Layers, Satellite, Music,
//        StickyNote, X
//      atlas/components/layout/ItemDrawer.tsx   — X, ExternalLink, Tag,
//        Calendar, Hash
//      atlas/components/ui/FAB.tsx              — Plus
//      atlas/components/ui/QuickCapture.tsx     — FileText, Zap, BookOpen,
//        BookHeart, Target, X
//      atlas/components/ui/SearchBar.tsx        — Search, X
//      atlas/components/ui/ViewSwitcher.tsx     — List, Table2, LayoutDashboard,
//        LayoutGrid, Library, AlignLeft, Users, Music, GraduationCap, Disc,
//        BookOpen, Map
//      atlas/components/views/AtlasClient.tsx   — Layers, LayoutGrid, Table2,
//        List, Map + inline SVG de busca
//      app/sobre/page.tsx                       — ArrowLeft, Sun
// ─────────────────────────────────────────────────────────────────────────────
export const UI = {
  SHOW_ICONS: false,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 2. LAYOUT & NAVEGAÇÃO
//
//    Cada flag controla um elemento de navegação do app.
//    Altere para `false` para ocultar o elemento correspondente.
//
//    SHOW_SIDEBAR      → atlas/components/layout/SidebarNav.tsx
//                        Sidebar lateral fixa (visível em md+).
//                        Para sumir: mude `hidden md:flex` para `hidden`
//                        na className do <aside>.
//
//    SHOW_BOTTOM_NAV   → atlas/components/layout/BottomNav.tsx
//                        Barra de navegação inferior (mobile).
//                        Para sumir: envolva o <> com:
//                          if (!NAV.SHOW_BOTTOM_NAV) return null
//
//    SHOW_NAV_PROGRESS → atlas/components/layout/NavProgress.tsx
//                        Barra fina de progresso durante navegação.
//                        Para sumir: remova <NavProgress /> de app/layout.tsx
//
//    SHOW_QUICK_CAPTURE → atlas/components/ui/QuickCapture.tsx
//                         Modal de captura rápida (⌘N).
//                         Para sumir: remova <QuickCapture /> e
//                           <QuickCaptureButton /> de app/layout.tsx
//
//    SHOW_GLOBAL_SEARCH → atlas/components/ui/GlobalSearch.tsx
//                         Modal de busca global (⌘K).
//                         Para sumir: remova <GlobalSearch /> de app/layout.tsx
//
//    SHOW_ONBOARDING   → atlas/components/layout/OnboardingOverlay.tsx
//                        Overlay de boas-vindas (lê localStorage "solaris-onboarded").
//                        Para sumir: remova <OnboardingOverlay /> de app/layout.tsx
//                        Para forçar reset: localStorage.removeItem("solaris-onboarded")
// ─────────────────────────────────────────────────────────────────────────────
export const NAV = {
  SHOW_SIDEBAR:       true,
  SHOW_BOTTOM_NAV:    true,
  SHOW_NAV_PROGRESS:  true,
  SHOW_QUICK_CAPTURE: true,
  SHOW_GLOBAL_SEARCH: true,
  SHOW_ONBOARDING:    true,

  // ── Headers de página ──────────────────────────────────────────────────────
  //
  //  SHOW_PAGE_HEADERS: false → oculta os títulos grandes (h1 / .page-hero)
  //    de cada página. O título da seção já está no menu e na URL.
  //    Implementado via [data-hide-headers] em ModeAwareShell
  //    + regras CSS em globals.css (`.page-hero`, `.page-hero-sm`, `.page-hero-xl`).
  //
  //  SHOW_BREADCRUMB: true → exibe o breadcrumb contextual compacto
  //    logo abaixo do menu superior, mesma largura do pill (640px).
  //    Componente: atlas/components/layout/Breadcrumb.tsx
  //
  SHOW_PAGE_HEADERS:  false,
  SHOW_BREADCRUMB:    true,

  // ── Labels do menu lateral ─────────────────────────────────────────────────
  //
  //  SHOW_NAV_LABELS: false → as células laterais do menu (Cultura, Academia,
  //    Perfil, Work) ficam sem texto — apenas blocos de cor.
  //    O título da página aparece no breadcrumb e no header, evitando repetição.
  //    Implementado em: UnifiedNav.tsx (NavCell) e BottomNav.tsx (SideLink)
  //
  SHOW_NAV_LABELS:    true,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 3. ANIMAÇÕES & SCROLL
//
//    PAGE_TRANSITION → atlas/components/layout/PageTransition.tsx
//                      Fade suave entre páginas (Framer Motion).
//                      Para desligar: retorne <>{children}</> sem motion.div.
//                      Duração atual: 0.12s — altere em:
//                        transition={{ duration: 0.12, ease: [...] }}
//
//    LENIS_SMOOTH_SCROLL → atlas/components/layout/LenisProvider.tsx
//                          Scroll inercial suave (Lenis 1.3).
//                          Para desligar: retorne <>{children}</> sem useEffect.
//                          Parâmetros atuais:
//                            duration: 1.2
//                            easing: exponencial (Math.pow(2, -10 * t))
//                            smoothWheel: true
// ─────────────────────────────────────────────────────────────────────────────
export const ANIM = {
  PAGE_TRANSITION:    true,
  LENIS_SMOOTH_SCROLL: true,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 4. BRANDING
//
//    Textos e símbolos de marca do app.
//    Usados em: app/layout.tsx (metadata), SidebarNav.tsx (logo),
//               app/page.tsx (footer ☀), OnboardingOverlay.tsx (título)
// ─────────────────────────────────────────────────────────────────────────────
export const BRANDING = {
  SITE_NAME:    "Portal Solar",
  TAGLINE:      "Ecossistema de gestão de conhecimento — Diamantov",
  LOGO_SYMBOL:  "☀",
  AUTHOR:       "Vitor de Mantova",
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 5. FUNCIONALIDADES (FEATURES FLAGS)
//
//    Controla quais seções do app aparecem na navegação.
//    Altere para `false` para remover a rota do menu.
//
//    Arquivo afetado: atlas/components/layout/SidebarNav.tsx
//                     atlas/components/layout/BottomNav.tsx
//    Para aplicar: filtre os arrays PORTAL_ITEMS / DRAWER_NAV com os flags.
// ─────────────────────────────────────────────────────────────────────────────
export const FEATURES = {
  // Portal
  WORLD:          true,   // /world
  PORTAL_CULTURA: true,   // /portal/cultura
  SOCIAL:         true,   // /social
  MONUMENT:       true,   // /monument
  // Atlas
  ATLAS:          true,   // /atlas
  GRAFO:          true,   // /atlas/grafo
  // Compass
  DIARIO:         true,   // /compass/diario
  NOTAS:          true,   // /compass/notas
  METAS:          true,   // /compass/metas
  ESTUDOS:        true,   // /compass/estudos
  MAPA_INTERIOR:  true,   // /compass/mapa
  PERFIL_COMPASS: true,   // /compass/perfil
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 6. PERFORMANCE & CACHE
//
//    Controla estratégia de cache das páginas server-side.
//    0 = force-dynamic (sem cache, sempre busca do banco)
//    N = revalidate a cada N segundos (ISR)
//
//    Arquivo afetado: cada page.tsx usa `export const dynamic` ou
//                     `export const revalidate`.
//
//    Página home (app/page.tsx):
//      Linha 6: export const dynamic = "force-dynamic"
//      Para adicionar cache: remova essa linha e adicione:
//        export const revalidate = PERF.HOME_REVALIDATE
//
//    AVISO: HOME_REVALIDATE = 0 equivale a force-dynamic (mais lento).
//           Aumente para 60–300 se o banco não muda constantemente.
// ─────────────────────────────────────────────────────────────────────────────
export const PERF = {
  HOME_REVALIDATE:  0,
  ATLAS_REVALIDATE: 60,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// 7. ATALHOS DE TECLADO
//
//    Registrados em: atlas/components/ui/KeyboardShortcuts.tsx
//
//    ⌘N       → Quick Capture (nota)
//    ⌘J       → Quick Capture (diário)
//    ⌘I       → Quick Capture (ideia)
//    ⌘⇧N      → /atlas/novo (nova entrada completa)
//    ⌘G       → /atlas
//    ⌘⇧G      → /compass/diario
//    ⌘,       → /settings
//    ⌘K       → GlobalSearch (registrado em useGlobalSearch.ts)
//    Escape   → fecha GlobalSearch / QuickCapture
//
//    Para desabilitar todos os atalhos:
//      Remova <KeyboardShortcuts /> de app/layout.tsx
//
//    Para modificar um atalho:
//      Edite atlas/components/ui/KeyboardShortcuts.tsx → switch(e.key)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 8. TEMAS E CORES
//
//    O tema é persistido no Zustand store (localStorage "solaris-store").
//    Arquivo de store: atlas/lib/store.ts
//
//    Tema padrão:  "editorial" (linha: theme: "editorial")
//    Outros temas disponíveis (type SolarTheme em store.ts):
//      "default" | "papel-amarelo" | "terminal" | "blueprint" | "academia"
//      "azulejo" | "floresta" | "aurora" | "jazz" | "manuscrito"
//      "neon-tokyo" | "mercurio" | "vulcao" | "gelo" | "carvao"
//      "museu" | "submarino" | "botanica" | "cosmos-violeta" | "mapa-antigo"
//      "mogno" | "jardim" | "deserto" | "cibernetico" | "dusk"
//      "laboratorio" | "tinta-china" | "oceano" | "sakura" | "arcade"
//      "solar-inverso" | "platina"
//
//    CSS vars controladas por tema (aplicadas em ThemeApplier.tsx):
//      --c-void    → fundo principal
//      --c-deep    → fundo secundário
//      --c-surface → superfície de cards
//      --c-border  → cor de bordas
//      --c-text    → texto principal
//      --c-muted   → texto suave
//      --c-accent  → destaque/acento
//      --c-teal    → acento secundário
//
//    Interface: app/settings + atlas/components/settings/SettingsClient.tsx
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 9. BANCO DE DADOS & API
//
//    ORM: Prisma 5 + SQLite (desenvolvimento) / PostgreSQL (produção)
//    Schema: prisma/schema.prisma
//    DB push: npm run db:push
//    Studio visual: npm run db:studio
//
//    API Routes (app/api/):
//      /api/atlas              → CRUD de itens do Atlas
//      /api/atlas/tags         → autocomplete de tags
//      /api/compass/diario     → entradas do diário
//      /api/compass/notas      → notas pessoais
//      /api/compass/metas      → objetivos/metas
//      /api/compass/estudos    → tracker de estudos
//      /api/auth/login         → autenticação JWT (cookie ps_session)
//      /api/auth/logout        → limpa cookie
//      /api/auth/register      → registro de usuário
//      /api/world              → worldboard
//      /api/social             → rede social
//
//    Middleware: middleware.ts
//      → Verifica JWT em ps_session
//      → Injeta x-user-id / x-username / x-guest nos headers
//      → Matcher: todas as rotas exceto _next/static e imagens
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// 10. ESTRUTURA DE ARQUIVOS
//
//    app/                     → rotas Next.js (App Router)
//      layout.tsx             → layout raiz (fontes, providers globais)
//      page.tsx               → dashboard / home
//      atlas/                 → Atlas (acervo de conhecimento)
//      compass/               → Compass (área pessoal)
//      portal/                → Portal (mundo, cultura, vilas)
//      world/                 → WorldBoard
//      social/                → Rede social
//      monument/              → Monumento 3D
//      settings/              → Configurações
//      sobre/                 → Sobre o projeto
//      login/ register/       → Autenticação
//
//    atlas/                   → biblioteca interna
//      components/
//        layout/              → Shell, Sidebar, BottomNav, PageTransition,
//                               LenisProvider, NavProgress, ItemDrawer,
//                               OnboardingOverlay, ThemeApplier
//        ui/                  → Button, SearchBar, GlobalSearch, QuickCapture,
//                               ViewSwitcher, FAB, Tag, ItemCard, RelationsPanel,
//                               KeyboardShortcuts, ModeSwitch, WorldBoard,
//                               DimensionFilterPanel, PageSkeleton
//        views/               → AtlasClient, AtlasListView, AtlasGalleryView,
//                               AtlasMapView, AtlasHorizontalView, ShelvesView,
//                               IndexView, AutoresView, PartiturasView,
//                               CursosView, RepertorioView, ReadingsView,
//                               RelationGraphClient, DashboardClient,
//                               WorldHero, GlobeView
//        compass/             → DiarioClient, JournalMetaBar, MapaInterior
//        portal/              → CulturaClient, VilasClient, WorldClient,
//                               WorldMapView
//        settings/            → SettingsClient
//        blocks/              → AtlasEditor (BlockNote rich text)
//        3d/                  → MonumentScene, EscolaScene, EscolaMuseu,
//                               SolarMonument, ThreeDErrorBoundary
//      lib/
//        db.ts                → funções Prisma (findRecent, findAll, etc.)
//        store.ts             → Zustand store (tema, modo, categorias)
//        search.ts            → índice Fuse.js para busca
//      hooks/
//        useGlobalSearch.ts   → lógica de busca global
//        useAtlasItem.ts      → fetch de item individual
//        useSearch.ts         → busca local
//        useFavorites.ts      → favoritos
//      types/                 → tipos TypeScript compartilhados
//      scripts/               → utilitários CLI (import, export, indexação)
// ─────────────────────────────────────────────────────────────────────────────
