∫---
title: "Arquitetura e Estrutura do Projeto"
created: "2025-01-01"
updated: "2026-04-18"
---

# Arquitetura do Portal Solar

## Visão Geral das Pastas

```
portal-solar/
├── app/                  # Páginas e rotas (Next.js App Router)
│   ├── page.tsx          # Home / Dashboard
│   ├── login/            # Autenticação
│   ├── register/         # Cadastro
│   ├── settings/         # Configurações
│   ├── sobre/            # Esta página — como o site é feito
│   ├── atlas/            # Base de conhecimento
│   │   ├── page.tsx      # Listagem com múltiplas views
│   │   ├── [slug]/       # Item individual
│   │   ├── novo/         # Criar novo item
│   │   └── grafo/        # Grafo de relações
│   ├── compass/          # Sistema pessoal
│   │   ├── diario/       # Diário com energia e humor
│   │   ├── notas/        # Notas rápidas
│   │   ├── metas/        # Objetivos e horizonte
│   │   ├── estudos/      # Rastreamento de estudo
│   │   └── mapa/         # Mapa interior
│   ├── portal/           # Conteúdo cultural
│   │   ├── cultura/      # Hub cultural
│   │   └── vilas/        # Áreas e localidades
│   ├── social/           # Rede e comunidade
│   │   └── tokens/       # Colecionáveis
│   ├── world/            # Mapa global interativo
│   ├── monument/         # Monumento 3D
│   ├── perfil/[username]/ # Perfis públicos
│   └── api/              # Endpoints backend
│
├── atlas/                # Código compartilhado
│   ├── components/       # Componentes React
│   │   ├── layout/       # Sidebar, BottomNav, Shell
│   │   ├── ui/           # Componentes reutilizáveis
│   │   ├── views/        # Modos de visualização (List, Gallery, Kanban...)
│   │   ├── blocks/       # Integração com o editor BlockNote
│   │   └── 3d/           # Cenas Three.js
│   ├── hooks/            # Custom hooks React
│   ├── lib/              # Lógica: db, store, auth, AI, busca
│   └── types/            # Tipos TypeScript e constantes
│
├── prisma/               # Banco de dados
│   ├── schema.prisma     # Modelos e relações
│   └── dev.db            # SQLite local
│
├── content/              # Espelho em Markdown dos itens do Atlas
├── docs/                 # Documentação do projeto (você está aqui)
└── public/               # Assets estáticos
```

## Páginas e o Que Fazem

| Rota | Módulo | Função |
|------|--------|--------|
| `/` | Portal | Dashboard: boas-vindas, recentes, estatísticas, descoberta do dia |
| `/atlas` | Atlas | Listagem com 12+ modos de view, filtros por área/tipo/status |
| `/atlas/[slug]` | Atlas | Item completo: conteúdo BlockNote, relações, tags, metadata |
| `/atlas/novo` | Atlas | Editor de criação com IA, cover, categorização |
| `/atlas/grafo` | Atlas | Grafo de relações força-dirigido |
| `/compass/diario` | Compass | Diário diário com energia (1-5), humor, intenção |
| `/compass/notas` | Compass | Notas livres, linkáveis a itens do Atlas |
| `/compass/metas` | Compass | Metas com horizonte curto/longo e progresso |
| `/compass/estudos` | Compass | Rastreamento de sessões de estudo por disciplina |
| `/compass/mapa` | Compass | Mapa interior visual |
| `/portal/cultura` | Portal | Hub cultural: itens, avisos, eventos |
| `/portal/vilas` | Portal | Áreas temáticas e geográficas |
| `/social` | Social | Feed: posts, recomendações, descobertas |
| `/social/tokens` | Social | Colecionáveis: avatares, badges, efeitos |
| `/world` | Portal | Mapa mundial interativo com obras e pessoas |
| `/monument` | Portal | Monumento Solar em 3D |
| `/settings` | Sistema | Temas, seções, exportação, importação |
| `/sobre` | Sistema | Como o site é feito — esta página |

## Banco de Dados

**SQLite** em desenvolvimento · **PostgreSQL** em produção (via variável `DATABASE_PROVIDER`).

Modelos principais no Prisma:

- **AtlasItem** — itens do Atlas: tipo, área, status, conteúdo BlockNote, relações, tags
- **Tag** — categorização com cor
- **AtlasRelation** — conexões entre itens (inspira, parte-de, contradiz, autor-de...)
- **JournalEntry** — entradas do diário
- **StudyDiscipline + StudySession** — rastreamento de estudo
- **Goal** — metas e objetivos
- **User + Follow** — contas e rede social
- **SolarTicket** — moeda social
- **UserToken** — colecionáveis
- **Post + PostLike** — feed social
- **RSSFeed + RSSItem** — cache de feeds externos

## Autenticação

- Login por senha com `bcryptjs`
- JWT em cookie `httpOnly` (`ps_session`) — 30 dias de sessão
- Sessão de convidado: acesso de leitura por 4 horas
- Middleware em `middleware.ts` injeta `x-user-id`, `x-username`, `x-guest` nos headers
- Rate limiting: 10 tentativas por IP a cada 15 minutos

## Estado Global

Três stores Zustand (persistidas em `localStorage`):

- **useSolarStore** — tema, modo de interface, perfil do usuário, categorias, visibilidade das seções
- **useSidebarStore** — estado de expansão da sidebar
- **useViewStore** — preferência de view por rota

## Decisões de Arquitetura

**ADR-001** — SQLite como banco padrão: portabilidade total, sem Docker, sem servidor.

**ADR-002** — `content` como `String` (não `Json`): permite full-text search direto no SQLite.

**ADR-003** — `relationType` como String livre validada por Zod: flexibilidade máxima para vocabulário do usuário.

**ADR-004** — Prisma singleton via `globalThis`: evita múltiplas instâncias em hot-reload.

**ADR-005** — R3F instalado com `--legacy-peer-deps`: compatibilidade com React 18 sem os peer opcionais do Expo.
