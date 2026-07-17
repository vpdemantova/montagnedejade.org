---
title: "Blueprint de Reconstrução — o Portal Solar inteiro, explicado"
created: "2026-07-17"
audience: "Humanos e IAs. Este documento existe para que qualquer inteligência — humana ou artificial, presente ou futura — possa entender o projeto por completo e recriá-lo do zero, exatamente igual."
---

# Blueprint de Reconstrução — Portal Solar

> **Se você é uma IA lendo isto:** este é o documento-fonte do projeto. Leia-o inteiro antes
> de escrever qualquer código. Ele define a visão, os invariantes que nunca podem mudar,
> o modelo de dados completo, todas as rotas, e a ordem correta de reconstrução (§13).
> Os demais documentos em `/docs` aprofundam partes específicas — este é o mapa-mestre.
>
> **Se você é humano:** é o mesmo mapa. Comece pela §1 e navegue pelo índice.

---

## §1 · O que é o Portal Solar

O Portal Solar é uma **plataforma da realidade**: um lugar único que reúne

1. **O acervo do conhecimento humano** (o Atlas) — um "novo Wikipedia" pessoal e curado,
   com um card para cada pessoa, obra, evento, conceito, lugar, elemento e era da humanidade,
   tudo interligado por relações e organizado no tempo (Eras da Humanidade) e no espaço (mapa-múndi);
2. **Um caderno pessoal de aprendizado** (a Bússola de Numita / Compass) — diário, notas,
   metas e sessões de estudo;
3. **Uma rede social de paz** — perfis com carteirinha de membro, convites em cadeia,
   Tickets Solares, eventos, mensagens e feed;
4. **Escolas de formação** — Academia (trilhas), Mente, Manifestação, Fundamentos,
   Expressão e Hinos.

Lema: **Construindo Utopias · Ações de Paz**. Fundado por Vitor de Mantova, 2025.
A filosofia completa está em `F-FILOSOFIA.md` e `E-VISAO.md`; o roadmap de conteúdo em `1-ATLAS_ROADMAP.md`.

### Os dois hemisférios

Todo conteúdo pertence a um de dois hemisférios (`AtlasItem.hemisphere`):

| Hemisfério | Significado | Exemplos |
|---|---|---|
| `PORTAL` | Conhecimento público/enciclopédico | pessoas, obras, eras, elementos |
| `COMPASS` | Espaço pessoal do usuário | diário, notas, perfil |

---

## §2 · Stack exata

| Camada | Tecnologia | Versão travada |
|---|---|---|
| Framework | Next.js (App Router) | `14.2.35` |
| UI | React 18 + Tailwind CSS + framer-motion | `^18` / `^12` |
| Editor de conteúdo | BlockNote (estilo Notion) | `@blocknote/core@^0.47` |
| Banco | Prisma ORM | `@prisma/client@^5.22` |
| Provider dev | SQLite (`file:./dev.db`) | — |
| Provider prod | PostgreSQL (trocado por `scripts/setup-schema.mjs` no build) | — |
| Auth | JWT próprio via `jose` + cookies httpOnly (`ps_session`) + bcryptjs | `jose@^6` |
| 3D | three.js + @react-three/fiber + drei | `^0.183` |
| Grafo | react-force-graph-2d | `^1.29` |
| Mapas | react-simple-maps | `^3` |
| Busca fuzzy | fuse.js | `^7` |
| Markdown/frontmatter | gray-matter + react-markdown | `^4` / `^10` |
| Zip (backup) | jszip | `^3.10` |
| PWA/offline | @ducanh2912/next-pwa (SW só em produção) | `^10.2` |
| IA generativa | @google/genai (metadata/texto) + replicate (imagens) | — |
| Estado client | zustand + swr | — |
| Animação scroll | gsap + lenis | — |

Criação do zero: `npx create-next-app@14 --ts --tailwind --app`, instalar as deps acima,
copiar `prisma/schema.prisma`, `npx prisma db push`, `npx tsx prisma/seed.ts`, `npm run dev`.

---

## §3 · Estrutura de pastas

```
portal-solar/
├── app/                  # rotas Next (App Router) — páginas e /api
├── atlas/                # coração do código compartilhado
│   ├── components/       #   layout/ ui/ views/ portal/ settings/ compass/
│   ├── lib/              #   db.ts (Prisma+queries), jwt.ts, mirror.ts, eras.ts,
│   │                     #   blocknote-md.ts, rate-limit.ts, topics.ts
│   ├── scripts/          #   sync-up/down (Obsidian), export-all, index-content
│   └── types/index.ts    #   TODOS os enums de domínio + labels PT + cores
├── content/              # espelhos .md de todo item (offline/Obsidian) + index.json
├── prisma/               # schema.prisma, seed.ts, dev.db (dev)
├── docs/                 # esta documentação (0-…, 1-…, 2-…, 3-…, 4-…, A-…, …)
├── public/               # manifest.json, ícones PWA, uploads/ (assets enviados)
├── scripts/setup-schema.mjs  # troca provider sqlite↔postgres no build
├── portal.config.ts      # configurações visuais/UI do site (flags como UI.SHOW_ICONS)
└── middleware.ts          # proteção de rotas via cookie ps_session
```

---

## §4 · Modelo de dados completo (30 modelos)

> Fonte canônica: `prisma/schema.prisma` (476 linhas). SQLite não tem enums nativos —
> os campos são `String` no banco e o TypeScript garante os valores via `atlas/types/index.ts`.
> **Regra absoluta: ids `cuid()` são imutáveis e são a única referência confiável entre entidades.**

### Núcleo — Atlas (o "novo Wikipedia")

| Modelo | Papel | Campos-chave |
|---|---|---|
| `AtlasItem` | **Unidade universal de conhecimento.** Cada pessoa, obra, era, conceito etc. é um item | `slug` (único, URL), `type`, `area`, `hemisphere`, `status`, `content` (JSON BlockNote), `contentPath` (espelho .md), `metadata` (JSON livre: anos, ISBN…), `coverImage`, `location` ("lat,lon"), `viewType` |
| `Tag` | Etiquetas many-to-many | `name` único, `color` |
| `AtlasRelation` | Grafo dirigido entre itens | `relationType`: "inspira", "parte-de", "autor-de", "influenciou"… — alimenta `/atlas/grafo` |
| `Asset` | Arquivo de mídia do Directory | `kind` (IMAGE/AUDIO/VIDEO/PDF/DOCUMENT/OTHER), `path` público `/uploads/…` |
| `AssetLink` | Vincula Asset↔AtlasItem | `role`: attachment/cover/gallery; único por (asset,item,role) |

**Convenções do `metadata` (JSON) — a espinha temporal do acervo:**
- Pessoa: `{born: 1685, died: 1750}` ou `{period: {start: -384, end: -322}}` (negativo = a.C.)
- Obra/Evento: `{year: 1913}` ou `{period: "1914-1918"}`
- Era: `{period: "Antiga"|"Medieval"|"Moderna"|"Contemporânea"|"Pré-história"|"Geológico", years: "3100–30 a.C."}`
- Escalas geológicas: `years` com `Ma` (milhões de anos) / `Ga` (bilhões)
- Trilha (type PATH): `{steps: [{itemId, note?}]}` — sequência ordenada; NUNCA usar AtlasRelation para ordem
- O parser universal disso é `atlas/lib/eras.ts` (`itemSortYear`, `grandEraForItem`)

### Compass — espaço pessoal

`JournalEntry` (data única "YYYY-MM-DD", energia 1–5, humor, intenção, conteúdo BlockNote) ·
`StudyDiscipline`/`StudySession` · `Goal` · `RSSFeed`/`RSSItem` (cache offline de notícias).

### Social

| Modelo | Papel |
|---|---|
| `User` | id **imutável**; `username` único e **mutável** (PATCH /api/auth/username); `invitedById` → cadeia de convites; `accentColor` |
| `Follow` | seguir (único por par) |
| `SolarTicket` | moeda social; tipos STANDARD/GOLDEN/FOUNDER/EVENT; 3 dados no registro (1 FOUNDER) |
| `UserToken` | colecionáveis (AVATAR/BADGE/MONUMENT/FRAME/EFFECT/BONECO; raridade COMMON→LEGENDARY) |
| `UserInterest` | item do Atlas no perfil, rating 1–5 |
| `Post`/`PostLike` | feed, opcionalmente ligado a um AtlasItem |
| `UserTag` | tags livres de interesse do perfil |
| `Event`/`EventRequest`/`EventMessage` | encontros com pedido de participação e chat |
| `Conversation`/`ConversationParticipant`/`Message` | mensagens diretas |
| `BubbleQuestion`/`BubbleResponse` | perguntas e percepções da comunidade |
| `WorldNotice` | Quadro Mundial — avisos/eventos/descobertas culturais |

### Workspace

`Page` — páginas hierárquicas estilo Notion (parentId), com `isPublic`/`isBlog` (o blog são Pages públicas), espelhadas em `content/workspace/<username>/`.

---

## §5 · Sistema de tipos de domínio (invariantes)

Tudo vive em `atlas/types/index.ts` — **única fonte de verdade** de enums, labels PT e cores:

- `ItemType` (19): PAGE, PERSON, WORK, OBJECT, CONCEPT, COURSE, READING, REPERTOIRE,
  PARTITURA, NOTA, AULA, PATH, **ERA, EVENT, MOVEMENT, PLACE, ELEMENT, INSTRUMENT, SPECIES**
- `AreaType`: áreas navegáveis (ACADEMIA, ARTES, …) + escolas (MIND, MANIFESTATION,
  FOUNDATION, EXPRESSION, HYMNS) + áreas de acervo nos dados (HISTORIA, CIENCIAS, NATUREZA,
  COSMOS, ELEMENTOS, MUSICA, MUSICOS, PINTORES, PINTURAS, ESCRITORES, FILOSOFOS, CIENTISTAS,
  ARQUITETURA, BIBLIOTECA — têm label em `AREA_LABELS` mesmo sem página própria)
- `StatusType`: ACTIVE, BACKLOG, COMPLETED, ARCHIVED, FAVORITE
- `AssetKind`: IMAGE, AUDIO, VIDEO, PDF, DOCUMENT, OTHER
- `GRAND_ERAS` (em `atlas/lib/eras.ts`): PROFUNDO → PRE_HISTORIA → ANTIGA (até 476) →
  MEDIA (até 1453) → MODERNA (até 1789) → CONTEMPORANEA. Array em ordem cronológica;
  a era de um ano é a primeira com `to` maior que ele.

**Invariantes que nunca podem mudar:**
1. `User.id` e `AtlasItem.id` são eternos — links sociais e relações usam id, nunca username/slug.
2. Todo item do Atlas tem espelho `.md` em `/content` (frontmatter gray-matter + corpo Markdown).
3. Frontmatter YAML **nunca** recebe `undefined` explícito (js-yaml recusa e derruba o export) —
   use spread condicional: `...(x ? {x} : {})`.
4. Hemisfério separa o público (PORTAL) do pessoal (COMPASS) — nada pessoal vaza para o acervo.
5. Datas no metadata: número negativo = a.C.

---

## §6 · Mapa completo de rotas (páginas)

### Esfera ATLAS — o acervo
| Rota | O quê |
|---|---|
| `/atlas` | Listagem geral, 12+ modos de view (`atlas/components/views/`) |
| `/atlas/[slug]` | Item completo: BlockNote, relações, tags, assets vinculados |
| `/atlas/novo` | Editor de criação com IA (porta de entrada de todo conteúdo) |
| `/atlas/grafo` | Grafo força-dirigido das relações |
| `/atlas/tabela-periodica` | 118 elementos interativos |
| `/eras` | **Eras da Humanidade** — linha do tempo: 6 grandes eras, sub-eras curadas (type ERA), pessoas/obras/eventos/movimentos em ordem cronológica (`ErasClient` + `atlas/lib/eras.ts`) |
| `/directory` | Biblioteca de mídia (Assets) com upload e vínculos |
| `/structure` | Como o app é feito (renderiza estes docs) |
| `/workspace` | Páginas hierárquicas estilo Notion |
| `/portal/vilas`, `/portal/vilas/[area]` | Explorador por área temática |

### Escolas
`/academia` (hub + trilhas type PATH em `/academia/[slug]`) · `/mind` · `/manifestation` ·
`/foundation` · `/expression` · `/hymns` — todas usam `AreaHubClient` filtrando por `area`.

### Compass (pessoal)
`/compass/diario` · `/compass/notas` · `/compass/metas` · `/compass/estudos` · `/compass/mapa` · `/compass/perfil` (carteirinha).

### Portal & Social
`/hub` · `/world` (mapa-múndi) · `/monument` (3D) · `/portal/cultura` · `/social` (feed) ·
`/social/eventos` · `/social/mensagens` · `/social/tokens` · `/blog` · `/atelier` · `/display`.

### Sistema
`/` (redireciona; `EntryCard` sobrepõe na 1ª visita — **suprimido em `/convite`**) ·
`/login` · `/register` (aceita `?ref=<username>` do convite) · `/settings` (10 abas) ·
`/admin` · `/perfil/[username]` · `/convite/[username]` (carteirinha 3D com tilt + CTA) · `/sobre` → `/structure`.

---

## §7 · APIs (61 rotas em `app/api/`)

| Grupo | Rotas | Notas |
|---|---|---|
| Atlas | `/api/atlas` (CRUD), `/api/atlas/[slug]`, `…/relations`, `/api/atlas/tags`, `/api/atlas/favorites`, `/api/atlas/seed`, `/api/search` | busca fuzzy via fuse.js |
| Assets | `/api/assets` (GET/POST upload multipart), `/api/assets/[id]` (DELETE), `…/links` | grava em `public/uploads/<kind>/uuid.ext` |
| Auth | `login`, `logout`, `register`, `me`, `guest`, `password`, `username` | cookie `ps_session` (httpOnly, lax, 30d); username troca reemite token |
| Compass | `/api/compass/journal`, `…/diario/today`, `…/goals`, `…/tracker` | |
| Social | `feed`, `feed/[id]/like`, `follow`, `profile/[username]`, `members`, `match`, `interests`, `tags`, `tickets`, `tokens`, `conversations…`, `events…`, `bubble` | |
| Portabilidade | `/api/portability/export/all` (**zip completo: frontmatter + corpo Markdown**), `export/area/[area]`, `export/item/[id]`, `import`, `rebuild-index` | o pilar do backup offline |
| Cultura/Mundo | `/api/notices`, `/api/portal/cultura`, `/api/cultura/profiles/[slug]`, `/api/monument-data`, `/api/perfil/[username]` (dados públicos da carteirinha, cache 60s) | |
| IA | `/api/ai/text`, `/api/ai/image`, `/api/ai/status` | Gemini p/ metadata; Replicate p/ capas |
| Outros | `/api/rss`, `/api/wikimedia`, `/api/blog…`, `/api/workspace/pages…`, `/api/admin/users` | |

---

## §8 · Pipeline de conteúdo — Notion → web → offline

O mesmo conteúdo existe em **quatro camadas sincronizadas**:

```
BlockNote (editor estilo Notion, na web)
   ↓ salva JSON em AtlasItem.content
Banco (Prisma — SQLite dev / Postgres prod)
   ↓ writeMirror() em toda escrita (atlas/lib/mirror.ts)
content/**/*.md (espelho: frontmatter YAML + corpo Markdown — abre no Obsidian)
   ↓ /api/portability/export/all
backup .zip completo (leva TUDO para fora — formato aberto, sem lock-in)
```

- Conversor: `atlas/lib/blocknote-md.ts` (BlockNote JSON → Markdown).
- Scripts CLI: `npm run sync:up` / `sync:down` (Obsidian ↔ banco), `npm run index`, `npm run export-all`.
- Import de volta: `/api/portability/import`.
- **Offline no navegador**: PWA via `@ducanh2912/next-pwa` (manifest.json + service worker,
  ativo apenas em produção; cache agressivo de navegação).

É assim que "todo o conhecimento da humanidade" fica seguro: cada item nasce na web,
vira arquivo `.md` aberto no disco, e sai inteiro num zip a qualquer momento.

---

## §9 · Auth & Social — regras de ouro

1. Registro (`POST /api/auth/register`): valida username `[a-z0-9_]{3,20}`, bcrypt cost 12,
   resolve `?ref=` → `invitedById`, dá 3 SolarTickets (1 FOUNDER), rate-limit 5/h por IP.
2. **Convite em cadeia**: `/convite/[username]` mostra a carteirinha (MemberCard com tilt 3D
   ao mouse — `atlas/components/compass/ProfileCard.tsx`) e leva a `/register?ref=…`.
   O perfil do convidado exibe "Convidado por @fulano" para sempre (via id).
3. **Troca de username** (`PATCH /api/auth/username`, exige senha): id não muda ⇒ seguidores,
   convites e interesses persistem; o link `/convite/<antigo>` deixa de existir (o usuário é avisado na UI).
4. `EntryCard` (card de entrada com as 4 Questões do Mundo) aparece na 1ª visita da sessão
   sobre qualquer página — **exceto** em `/convite/*`.
5. Carteirinha imprimível em proporção real 85,6×54 mm (`window.print` + CSS `@media print`).

---

## §10 · Design system (essência)

Detalhes em `2-DESIGN-SYSTEM.md`. O essencial para reconstruir:

- **Tokens CSS**: cores como `rgb(var(--c-void))`, `--c-text`, `--c-muted`, `--c-border`,
  `--c-accent`, `--c-deep`, `--c-surface`, `--c-teal` — 32 temas trocáveis em `/settings`
  (default: Cosmos Escuro, accent dourado `#C8A45A`).
- **Tipografia**: `font-display` (títulos, tracking negativo) + `font-mono` (labels
  MUITO pequenos — 6–9px — uppercase com tracking largo `0.2–0.4em`). É a assinatura visual.
- **Classes utilitárias** (globals.css): `page-standard/narrow/wide`, `page-title`,
  `page-label`, `tab-bar`/`tab`, `btn btn-primary/ghost/subtle btn-sm/md`, `editorial-label`.
- **Símbolos** no lugar de ícones: ◈ ⬡ ⊕ ◉ ◌ ✦ ◫ ◐ ▸ → (flag `UI.SHOW_ICONS` em portal.config.ts).
- Bordas finas `1px` com opacidade baixa (`rgb(var(--c-border) / 0.25)`), cantos quase retos.

---

## §11 · Seeds — como povoar o acervo

`prisma/seed.ts` (via `npx tsx prisma/seed.ts`, idempotente — pula títulos existentes):
965+ itens hoje: 118 elementos, 39 eras, 123 pessoas, 42 obras, 55 movimentos, 159 lugares,
308 conceitos, escolas (3 itens cada), 2 trilhas PATH. O seed também demonstra os formatos
de `metadata` da §4. Conteúdo novo entra por `/atlas/novo` (com sugestão de metadata via IA)
ou por import de `.md`.

---

## §12 · Estado atual (2026-07-17)

**Pronto e verificado ao vivo:** Atlas + 12 views + grafo + tabela periódica · Eras da
Humanidade (`/eras`) · Directory/Assets · Escolas (5) + trilhas · Compass completo ·
Social (perfis, convites com tilt 3D, tickets, eventos, mensagens, feed) · Workspace/Blog ·
World/Monument · export/import (bugs de YAML-undefined e corpo-vazio corrigidos em 2026-07-17) ·
PWA · 32 temas.

**Pendências conhecidas:** seção Manifestos da Academia é placeholder ·
imagens externas sem fallback universal (usar `GenerativePlaceholder` onde faltar) ·
sobreposição menu/scroll em algumas páginas · itens do acervo sem `coverImage` própria.

---

## §13 · Roteiro de reconstrução para uma IA (ordem exata)

> Siga as fases na ordem. Ao fim de cada fase, rode `npx tsc --noEmit` e `npm run build`
> e verifique as rotas com `curl` antes de avançar.

1. **Fundação**: Next 14 App Router + Tailwind + deps da §2 → `schema.prisma` completo (§4)
   → `db push` → `atlas/types/index.ts` com TODOS os enums/labels/cores (§5).
2. **Núcleo Atlas**: `atlas/lib/db.ts` (singleton + queries) → `/api/atlas` CRUD →
   `/atlas`, `/atlas/[slug]`, `/atlas/novo` com BlockNote → tags e relações → seed (§11).
3. **Espelho offline**: `mirror.ts` + `blocknote-md.ts` (respeitando invariante §5.3) →
   rotas de portabilidade → scripts de sync → PWA.
4. **Auth & Social**: jwt.ts + middleware + rotas auth (§9) → perfis → carteirinha/convite →
   tickets → feed/eventos/mensagens.
5. **Camadas de navegação do acervo**: views do Atlas → grafo → tabela periódica →
   **eras.ts + /eras** → vilas → world/monument.
6. **Escolas & Compass**: AreaHubClient + 6 páginas de escola + trilhas PATH → diário/notas/metas/estudos.
7. **Acabamento**: temas/settings → hub/home → EntryCard → admin → docs em `/structure`.

---

## §14 · Checklist de lançamento (produção)

Auditoria de 2026-07-17 — resolver **antes** de abrir ao público:

**Bloqueadores**
- [ ] Banco: migrar para PostgreSQL gerenciado (Neon/Supabase). SQLite não sobrevive a
      serverless. `scripts/setup-schema.mjs` já troca o provider se `DATABASE_URL` for `postgresql://`.
- [ ] Uploads: mover `public/uploads` para storage externo (Vercel Blob/S3/R2) — filesystem
      de produção é efêmero. Validar extensão contra allow-list (risco XSS: `.html`/`.svg`
      disfarçados) e limitar tamanho.
- [ ] Secrets: exigir `AUTH_SECRET` em produção (falhar no boot se ausente — hoje cai num
      fallback público do repositório). Rotacionar `AUTH_PASSWORD`.
- [ ] Definir hospedagem + env vars (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_BASE_URL`, chaves de IA).

**Importantes**
- [ ] Rate-limit distribuído (o atual é em memória, por instância).
- [ ] Parar de vazar `(e as Error).message` nos 500 (17 rotas) — logar no servidor, resposta genérica.
- [ ] Rate-limit no `/api/auth/guest`.
- [ ] `next.config.mjs`: configurar `images.remotePatterns` para capas externas.

---

*Portal Solar · Blueprint de Reconstrução · mantido junto ao código — atualize este arquivo a cada mudança estrutural.*
