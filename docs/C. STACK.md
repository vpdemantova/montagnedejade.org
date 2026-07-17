---
title: "Stack e Tecnologias"
created: "2026-04-18"
---

# Stack do Portal Solar

Cada tecnologia aqui foi escolhida por uma razão. Nenhuma é acidental.

## Framework Principal

**Next.js 14 (App Router)** — o núcleo de tudo.

Server Components permitem buscar dados diretamente no servidor sem hidratação desnecessária. As rotas de API ficam no mesmo projeto. O sistema de roteamento baseado em pastas é intuitivo e escalável. Foi escolhido por ser o padrão moderno do ecossistema React com o melhor equilíbrio entre performance e ergonomia.

## Linguagem

**TypeScript 5 (strict)** — sem `any`, sem surpresas.

Tipos definem o contrato entre cada parte do sistema. Os enums do Prisma não suportam SQLite nativamente, então usamos objetos `as const` em `atlas/types/index.ts` — tipagem plena sem depender do ORM.

## Banco de Dados

**Prisma ORM 5** com **SQLite** (dev) e **PostgreSQL** (produção).

SQLite não precisa de servidor. Você carrega o arquivo `.db` junto com o código e pronto. Para produção, a migração para PostgreSQL é feita via variável de ambiente. O Prisma abstrai essa diferença com o mesmo schema.

Atenção: Prisma + SQLite não suporta enums nativos nem `Json`. Todos os campos enum usam `String` no banco e são tipados com `as const` na camada de aplicação.

## Estilização

**Tailwind CSS 3.4** com sistema de **32 temas**.

As cores do sistema usam variáveis CSS customizadas: `--c-void`, `--c-surface`, `--c-text`, `--c-accent`, `--c-border`, `--c-muted`, `--c-teal`. Cada tema redefine essas variáveis. Para adicionar um novo tema: criar uma classe `.theme-nome` em `globals.css` e registrar em `useSolarStore`.

Fontes: **Plus Jakarta Sans** (display), **Inter** (corpo), **JetBrains Mono** (código e elementos de interface).

## Editor de Conteúdo

**BlockNote 0.47** — editor rico open-source estilo Notion.

Serializa o conteúdo como JSON string. Esse JSON é armazenado na coluna `content` do `AtlasItem` e espelhado em Markdown na pasta `/content`. O espelho Markdown garante portabilidade: você pode reconstruir o banco inteiro a partir dos arquivos `.md`.

## Animações

**Framer Motion 12** para transições de componentes e páginas.

**GSAP** para animações de alta performance com ScrollTrigger.

**Lenis** para scroll suave nativo, compatível com GSAP ScrollTrigger.

## 3D

**React Three Fiber (R3F) + @react-three/drei** — Three.js com API declarativa React.

Usado no Monumento Solar (`/monument`) e na Escola (`atlas/components/3d/`). Instalado com `--legacy-peer-deps` por conta de peer dependencies opcionais do Expo que conflitam com React 18.

## Inteligência Artificial

**Google Gemini 2.5 Flash** — geração de texto (resumos, sugestões, metadados).

**Gemini 2.0 Flash Preview** — geração de imagens.

**Replicate + Flux** — alternativa para geração de imagens.

Toda funcionalidade de IA é opcional: o sistema verifica a presença das variáveis de API antes de habilitar os recursos. O site funciona completamente sem IA.

## Estado Global

**Zustand 5** com `persist` middleware para `localStorage`.

Três stores: `useSolarStore` (tema, modo, categorias, perfil), `useSidebarStore` (expansão), `useViewStore` (preferência de view por rota).

## Busca

**Fuse.js 7** para busca fuzzy local, offline.

**SWR 2** para fetching com revalidação automática e cache.

## Portabilidade

**gray-matter** — parse de frontmatter YAML + corpo Markdown nos arquivos de conteúdo.

**jszip** — exportação/importação de dados como arquivo `.zip` com JSONs estruturados.

Scripts em `atlas/scripts/` permitem reconstruir o banco a partir dos arquivos Markdown, exportar por área ou reconstruir o índice.

## Autenticação

**bcryptjs** — hash de senhas.

**jose** — criação e verificação de JWT.

Cookies `httpOnly` evitam acesso via JavaScript. Middleware no Edge verifica e injeta dados do usuário em cada request.

## Como Rodar do Zero

```bash
# 1. Clonar e instalar
git clone <repo>
cd portal-solar
npm install --legacy-peer-deps

# 2. Configurar ambiente
cp .env.example .env
# Editar .env: AUTH_SECRET, DATABASE_URL, GEMINI_API_KEY (opcional)

# 3. Banco de dados
npx prisma db push
npx prisma db seed

# 4. Rodar
npm run dev
# Abrir http://localhost:3000
```

Para produção com PostgreSQL:
```bash
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://...
npx prisma migrate deploy
npm run build
```
