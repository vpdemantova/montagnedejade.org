---
title: "Decisões de Arquitetura — ADRs"
created: "2025-01-01"
---

# Arquitetura do Portal Solar

## Stack Técnica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | Next.js 14 (App Router) | Server Components + rotas de API integradas |
| Linguagem | TypeScript strict | Segurança de tipos, sem `any` |
| Banco de Dados | SQLite via Prisma ORM | Local, sem servidor, portátil |
| Estilização | Tailwind CSS | Utilitários, sem CSS morto em produção |
| Editor de Blocos | BlockNote.js | Open-source, estilo Notion, extensível |
| Exportação | gray-matter | Frontmatter YAML + Markdown padrão |
| Busca | Fuse.js | Fuzzy search local, offline |
| Animações | GSAP + Framer Motion | Padrão Awwwards |
| Scroll | Lenis | Scroll suave nativo, compatível com ScrollTrigger |
| 3D | React Three Fiber + drei | Monumento Solar |

## ADRs (Architecture Decision Records)

### ADR-001: SQLite como banco de dados
**Contexto**: Precisamos de um banco que rode localmente sem infraestrutura.
**Decisão**: SQLite via Prisma ORM.
**Consequências**: Portabilidade total, sem necessidade de Docker ou servidor.

### ADR-002: `content` como String no AtlasItem
**Contexto**: BlockNote serializa seu documento como JSON string.
**Decisão**: Armazenar como `String?` em vez de `Json?`.
**Consequências**: Permite full-text search direto na coluna SQLite. Cast para tipo na camada de aplicação.

### ADR-003: `relationType` como String livre
**Contexto**: Tipos de relação entre itens são vocabulário definido pelo usuário.
**Decisão**: String livre validada com Zod na API, não enum Prisma.
**Consequências**: Flexibilidade máxima. Risco de inconsistência mitigado pelo Zod.

### ADR-004: Prisma singleton para Next.js
**Contexto**: Hot-reload em dev cria múltiplas instâncias do PrismaClient.
**Decisão**: Singleton via `globalThis` — padrão oficial da Prisma para Next.js.
**Consequências**: Sem vazamento de conexões em desenvolvimento.

### ADR-005: R3F instalado com `--legacy-peer-deps`
**Contexto**: `@react-three/fiber` v9 tem peer optionals do Expo que conflitam com React 18.
**Decisão**: Usar `--legacy-peer-deps` na instalação.
**Consequências**: R3F funciona normalmente no browser. Os pacotes Expo são peer opcionais e não são usados.
