# Portal Solar — Guia do Desenvolvedor

> **Como usar este documento**: leia uma seção por vez. Cada seção tem explicações + exemplos práticos extraídos do código real do projeto. Quando quiser experimentar algo, abra o arquivo mencionado, faça a mudança, salve e veja o resultado em `localhost:3000` imediatamente.

---

## Índice

1. [A Lógica Geral — como o projeto funciona](#1-a-lógica-geral)
2. [Onde mudar o quê — mapa de arquivos](#2-mapa-de-arquivos)
3. [Estilos — Tailwind, CSS Variables e globals.css](#3-estilos)
4. [Componentes — o que são e como editar](#4-componentes)
5. [Páginas e Rotas — Next.js App Router](#5-páginas-e-rotas)
6. [Banco de dados — Prisma e SQLite](#6-banco-de-dados)
7. [APIs — como criar e modificar rotas](#7-apis)
8. [TypeScript — lendo os tipos sem medo](#8-typescript)
9. [Onde buscar ajuda — documentação oficial](#9-documentação)
10. [Receitas práticas — como fazer X](#10-receitas-práticas)

---

## 1. A Lógica Geral

O projeto é uma aplicação **Next.js 14** com **App Router**. Isso significa:

- **Cada pasta dentro de `app/`** vira uma URL. Ex: `app/social/page.tsx` → `localhost:3000/social`
- **`page.tsx`** dentro de uma pasta é a página daquela rota
- **`layout.tsx`** é o "moldura" que envolve todas as páginas dentro daquela pasta
- **`route.ts`** dentro de `app/api/` é um endpoint de API (recebe e responde requisições)

### O fluxo quando você abre uma página

```
Você digita /social no navegador
  ↓
Next.js encontra app/social/page.tsx
  ↓
Esse arquivo exporta um componente React
  ↓
O componente é renderizado (no servidor ou no cliente)
  ↓
HTML chega no navegador + JS carrega interatividade
```

### Server vs Client Components

```tsx
// SERVER COMPONENT (padrão — sem "use client" no topo)
// Roda no servidor. Pode acessar banco de dados diretamente.
// NÃO pode usar useState, useEffect, eventos de mouse, etc.
import { prisma } from "@/atlas/lib/db"

export default async function MinhaPage() {
  const dados = await prisma.user.findMany() // ← acesso direto ao banco
  return <div>{dados.length} usuários</div>
}

// CLIENT COMPONENT (tem "use client" no topo)
// Roda no navegador. Pode usar estado, interações, animações.
// NÃO pode acessar banco de dados diretamente.
"use client"
import { useState } from "react"

export function MeuBotao() {
  const [cliques, setCliques] = useState(0)
  return <button onClick={() => setCliques(c => c + 1)}>{cliques}</button>
}
```

**Regra prática**: se precisa de interação com o usuário (cliques, formulários, animações) → `"use client"`. Se só exibe dados → Server Component.

---

## 2. Mapa de Arquivos

### Onde mexer para cada tipo de mudança

| Quero mudar... | Arquivo |
|---|---|
| Cores e temas globais | `app/globals.css` (variáveis CSS) |
| Flags de comportamento | `portal.config.ts` |
| Navegação (menu superior) | `atlas/components/layout/UnifiedNav.tsx` |
| Navegação (menu inferior) | `atlas/components/layout/BottomNav.tsx` |
| Layout geral de todas as páginas | `atlas/components/layout/ModeAwareShell.tsx` |
| Transição entre páginas | `atlas/components/layout/PageTransition.tsx` |
| Tema padrão ao abrir | `atlas/lib/store.ts` (linha `theme: "..."`) |
| Botões (estilos globais) | `app/globals.css` (seção `.btn`) |
| Card de entrada (popup inicial) | `atlas/components/ui/EntryCard.tsx` |
| Card de membro | `atlas/components/compass/ProfileCard.tsx` |
| Página de perfil público | `app/perfil/[username]/page.tsx` |
| Página social (feed) | `app/social/page.tsx` |
| Página de eventos | `app/social/eventos/page.tsx` |
| Schema do banco | `prisma/schema.prisma` |
| API do Atlas | `app/api/atlas/route.ts` |
| API de autenticação | `app/api/auth/` |
| Configurações da conta | `atlas/components/settings/SettingsClient.tsx` |

---

## 3. Estilos

### 3.1 Tailwind CSS — a forma mais rápida de estilizar

Tailwind é uma biblioteca de **classes utilitárias**. Em vez de escrever CSS separado, você adiciona classes diretamente no elemento HTML:

```tsx
// CSS tradicional (não usamos assim)
// .titulo { font-size: 2rem; font-weight: bold; color: #333; }

// Tailwind (usamos assim)
<h1 className="text-2xl font-bold text-gray-700">Título</h1>
```

**Classes mais usadas no projeto:**

```tsx
// Espaçamento
"p-4"          // padding 1rem em todos os lados
"px-6 py-3"    // padding horizontal 1.5rem, vertical 0.75rem
"mt-4 mb-2"    // margin-top 1rem, margin-bottom 0.5rem
"gap-3"        // espaço entre elementos filhos (com flex ou grid)

// Tamanhos
"w-full"       // largura 100%
"h-32"         // altura 8rem (32 * 0.25rem)
"max-w-sm"     // largura máxima pequena (~24rem)

// Flexbox (alinhamento)
"flex items-center justify-between"  // linha, centralizado, espaçado
"flex flex-col gap-4"                // coluna, espaço entre itens

// Grid
"grid grid-cols-2 gap-3"            // 2 colunas, espaço de 0.75rem
"grid grid-cols-1 md:grid-cols-3"   // 1 col mobile, 3 colunas em telas médias

// Texto
"text-sm"          // fonte pequena (0.875rem)
"text-[9px]"       // tamanho customizado exato (brackets para valores arbitrários)
"font-mono"        // fonte monoespaçada
"font-display"     // fonte de display (Plus Jakarta Sans)
"uppercase tracking-widest"  // maiúsculas com espaçamento grande entre letras

// Bordas
"border border-solar-border/30"    // borda com cor do tema em 30% de opacidade
"rounded-full"     // border-radius circular

// Responsividade (prefixos: sm: md: lg: xl:)
"hidden md:block"  // oculto no mobile, visível em telas médias+
"text-sm md:text-base"  // fonte menor no mobile
```

**Para ver todas as classes disponíveis**: [tailwindcss.com/docs](https://tailwindcss.com/docs) — use Ctrl+F para buscar "padding", "flex", "border", etc.

### 3.2 CSS Variables — o sistema de cores do tema

As cores do Portal Solar **não são fixas** — elas mudam com o tema escolhido. Por isso usamos variáveis CSS no formato `rgb(var(--c-nome) / opacidade)`:

```css
/* Em globals.css, cada tema define estas variáveis: */
--c-void     /* fundo mais escuro */
--c-deep     /* fundo secundário (cards, painéis) */
--c-surface  /* superfície elevada (tooltips, popovers) */
--c-border   /* cor das bordas e linhas divisórias */
--c-text     /* texto principal */
--c-muted    /* texto suave (metadados, labels) */
--c-accent   /* cor de destaque (dourado por padrão) */
--c-teal     /* cor secundária (verde/azul do Compass) */
```

**Como usar em código:**

```tsx
// Cor sólida
style={{ color: "rgb(var(--c-accent))" }}

// Cor com opacidade (/ 0.5 = 50% opacidade)
style={{ color: "rgb(var(--c-text) / 0.7)" }}

// Fundo com opacidade
style={{ background: "rgb(var(--c-deep) / 0.4)" }}

// Usando com hex dinâmico (acento do usuário, por exemplo)
style={{ background: `${accentColor}20` }}  // 20 = ~12% opacidade em hex
```

**Tabela de transparência hex:**
```
FF = 100%   CC = 80%   99 = 60%   66 = 40%   33 = 20%   1A = 10%   0D = 5%
```

### 3.3 Classes de layout do projeto

O sistema criado em `globals.css`:

```tsx
// Containers de largura máxima (centralizados automaticamente)
<div className="page-narrow">   {/* max-width: 48rem — para conteúdo focado */}
<div className="page-standard"> {/* max-width: 64rem — padrão geral */}
<div className="page-wide">     {/* max-width: 80rem — conteúdo amplo */}

// Header de página (borda inferior + espaçamento padrão)
<header className="ph">
  <div className="page-narrow">
    <p className="page-label">Seção · Sub-seção</p>
    <h1 className="page-title">Título</h1>
    <p className="page-subtitle">Descrição opcional</p>
  </div>
</header>

// Botões — sistema unificado
<button className="btn btn-primary btn-md">Ação principal</button>
<button className="btn btn-ghost btn-sm">Ação secundária</button>
<button className="btn btn-solid btn-md">Ação sólida</button>

// Tabs — padrão de abas
<div className="tab-bar">
  <button className="tab" data-active="true">Aba Ativa</button>
  <button className="tab">Aba Normal</button>
</div>

// Label de seção (texto pequeno em maiúsculas)
<p className="section-label">Título de seção</p>
```

### 3.4 Como adicionar um novo tema

Em `app/globals.css`, copie um bloco de tema existente e altere as cores:

```css
/* Cole após um tema existente */
[data-theme="meu-tema"] {
  --c-void:    10  8  20;   /* fundo: R G B separados por espaço */
  --c-deep:    18 14 32;
  --c-surface: 28 22 46;
  --c-border:  80 60 120;
  --c-text:   230 220 255;
  --c-muted:  130 110 180;
  --c-accent: 180 100 255;  /* destaque roxo */
  --c-teal:    60 200 160;
}
```

Depois adicione o tema ao array `THEMES` em `atlas/components/settings/SettingsClient.tsx`:

```tsx
{ id: "meu-tema", label: "Meu Tema", bg: "#0A0814", accent: "#B464FF" },
```

E ao tipo `SolarTheme` em `atlas/lib/store.ts`:
```tsx
type SolarTheme = "default" | "editorial" | ... | "meu-tema"
```

---

## 4. Componentes

### 4.1 O que é um componente

Um componente é uma **função JavaScript que retorna HTML**. O nome começa com letra maiúscula:

```tsx
// Componente simples
function MeuCard({ titulo, cor }: { titulo: string; cor: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${cor}` }} className="p-4">
      <h2 className="page-title">{titulo}</h2>
    </div>
  )
}

// Uso:
<MeuCard titulo="Olá" cor="#C8A45A" />
```

### 4.2 Props — como passar dados para componentes

```tsx
// Definindo as props com TypeScript
type BotaoProps = {
  texto:    string
  cor?:     string   // opcional (tem o ?)
  onClick:  () => void
}

function Botao({ texto, cor = "#C8A45A", onClick }: BotaoProps) {
  return (
    <button
      onClick={onClick}
      className="btn btn-sm"
      style={{ borderColor: cor }}
    >
      {texto}
    </button>
  )
}

// Uso:
<Botao texto="Salvar" onClick={() => console.log("clicou!")} />
<Botao texto="Deletar" cor="#E91E63" onClick={handleDelete} />
```

### 4.3 Estado com useState

```tsx
"use client"
import { useState } from "react"

function Contador() {
  // [valorAtual, funçãoParaMudar] = useState(valorInicial)
  const [count, setCount] = useState(0)
  const [nome,  setNome]  = useState("Vitor")

  return (
    <div>
      <p>Contagem: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Digite seu nome"
      />
      <p>Olá, {nome}!</p>
    </div>
  )
}
```

### 4.4 Efeitos com useEffect — buscar dados, timers

```tsx
"use client"
import { useState, useEffect } from "react"

function MeusItens() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Roda quando o componente aparece na tela
    fetch("/api/atlas")
      .then(r => r.json())
      .then(dados => {
        setItens(dados)
        setLoading(false)
      })
  }, []) // [] = roda só uma vez

  if (loading) return <p>Carregando...</p>
  return <ul>{itens.map(item => <li key={item.id}>{item.title}</li>)}</ul>
}
```

---

## 5. Páginas e Rotas

### 5.1 Estrutura de uma página típica

```tsx
// app/minha-secao/page.tsx

// Para Server Component (sem "use client"):
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { prisma }     from "@/atlas/lib/db"

export const metadata = { title: "Minha Seção — Portal Solar" }

export default async function MinhaPagina() {
  // Busca dados direto no banco (só em Server Components)
  const dados = await prisma.atlasItem.findMany({ take: 10 })

  return (
    <div className="min-h-screen">
      <PageHeader label="Portal Solar · Seção" title="Minha Seção" size="standard" />
      
      <div className="page-standard py-8">
        {dados.map(item => (
          <div key={item.id} className="border border-solar-border/25 p-4 mb-3">
            <h2 className="font-display text-lg">{item.title}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.2 Rotas dinâmicas — [parâmetro]

Pasta com `[algo]` no nome captura qualquer valor na URL:

```
app/perfil/[username]/page.tsx  →  /perfil/vitor, /perfil/ana, /perfil/qualquer
app/atlas/[slug]/page.tsx       →  /atlas/fisica, /atlas/musica, /atlas/...
```

```tsx
// app/meu-item/[id]/page.tsx
export default async function ItemPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // ← captura o valor da URL
  const item = await prisma.atlasItem.findUnique({ where: { id } })
  
  return <h1>{item?.title}</h1>
}
```

### 5.3 Adicionar uma nova página

1. Crie a pasta: `app/nova-secao/`
2. Crie o arquivo: `app/nova-secao/page.tsx`
3. Exporte um componente padrão:

```tsx
// app/nova-secao/page.tsx
import { PageHeader } from "@/atlas/components/layout/PageHeader"

export const metadata = { title: "Nova Seção — Portal Solar" }

export default function NovaSacaoPage() {
  return (
    <div className="min-h-screen">
      <PageHeader label="Portal Solar" title="Nova Seção" size="narrow" />
      <div className="page-narrow py-8">
        <p className="text-solar-muted/70">Conteúdo aqui</p>
      </div>
    </div>
  )
}
```

4. Adicione ao menu em `atlas/components/layout/UnifiedNav.tsx`:
```tsx
const COL_CULTURA: NavLink[] = [
  // ...links existentes...
  { label: "Nova Seção", href: "/nova-secao", desc: "Descrição breve" },
]
```

---

## 6. Banco de Dados

### 6.1 Como o Prisma funciona

O Prisma é um **ORM** (Object-Relational Mapper) — uma camada que deixa você escrever código JavaScript para interagir com o banco, sem precisar de SQL:

```tsx
// SQL puro (não usamos)
// SELECT * FROM AtlasItem WHERE area = 'ACADEMIA' LIMIT 10

// Prisma (usamos)
const itens = await prisma.atlasItem.findMany({
  where:   { area: "ACADEMIA" },
  take:    10,
  orderBy: { createdAt: "desc" },
})
```

### 6.2 Schema — definindo os dados

O arquivo `prisma/schema.prisma` define a estrutura do banco:

```prisma
model User {
  id          String   @id @default(cuid())  // chave primária, gerada automaticamente
  username    String   @unique               // único (não pode repetir)
  displayName String                         // campo obrigatório
  bio         String?                        // campo opcional (? = pode ser null)
  accentColor String   @default("#C8A45A")   // valor padrão
  createdAt   DateTime @default(now())       // data de criação automática
  
  // Relação com outros modelos
  posts Post[]  // um usuário tem muitos posts
}

model Post {
  id       String @id @default(cuid())
  content  String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
```

### 6.3 Como adicionar um campo novo

1. **Edite `prisma/schema.prisma`** — adicione o campo ao modelo:
```prisma
model User {
  // ...campos existentes...
  website String?  // ← novo campo opcional
}
```

2. **Execute o comando** para aplicar no banco:
```bash
npx prisma db push
```

3. **Use no código**:
```tsx
await prisma.user.update({
  where: { id: userId },
  data:  { website: "https://vitor.solar" },
})
```

### 6.4 Operações comuns do Prisma

```tsx
// Buscar todos
const todos = await prisma.atlasItem.findMany()

// Buscar com filtros
const academia = await prisma.atlasItem.findMany({
  where:   { area: "ACADEMIA", status: "ACTIVE" },
  orderBy: { updatedAt: "desc" },
  take:    20,   // limite
  skip:    40,   // paginação
})

// Buscar um único
const item = await prisma.atlasItem.findUnique({
  where: { id: "clid123..." },
})

// Buscar com relações incluídas
const userComPosts = await prisma.user.findUnique({
  where:   { username: "vitor" },
  include: { posts: true },  // inclui posts relacionados
})

// Criar
const novo = await prisma.atlasItem.create({
  data: { title: "Física Quântica", area: "ACADEMIA", type: "CONCEPT" },
})

// Atualizar
await prisma.atlasItem.update({
  where: { id: "clid123..." },
  data:  { title: "Novo Título" },
})

// Deletar
await prisma.atlasItem.delete({
  where: { id: "clid123..." },
})

// Contar
const total = await prisma.atlasItem.count({ where: { area: "ACADEMIA" } })
```

**Documentação**: [prisma.io/docs](https://www.prisma.io/docs) → busque "findMany", "create", "update"

---

## 7. APIs

### 7.1 Como uma rota de API funciona

```tsx
// app/api/minha-rota/route.ts

import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"

// GET /api/minha-rota
export async function GET(req: Request) {
  const dados = await prisma.atlasItem.findMany({ take: 5 })
  return NextResponse.json(dados)  // retorna JSON
}

// POST /api/minha-rota
export async function POST(req: Request) {
  const body = await req.json() as { titulo: string }  // lê o corpo da requisição
  
  const novo = await prisma.atlasItem.create({
    data: { title: body.titulo, area: "ATLAS" },
  })
  
  return NextResponse.json(novo, { status: 201 })  // 201 = criado com sucesso
}
```

### 7.2 Lendo parâmetros da URL

```tsx
// app/api/items/[id]/route.ts
type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  const { id } = await params  // /api/items/abc123 → id = "abc123"
  const item = await prisma.atlasItem.findUnique({ where: { id } })
  
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  return NextResponse.json(item)
}
```

### 7.3 Lendo query params (?chave=valor)

```tsx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const area  = searchParams.get("area")   // /api/items?area=ACADEMIA
  const limit = searchParams.get("limit") ?? "20"
  
  const itens = await prisma.atlasItem.findMany({
    where: area ? { area } : undefined,
    take:  parseInt(limit),
  })
  
  return NextResponse.json(itens)
}
```

### 7.4 Verificando autenticação

```tsx
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies }     from "next/headers"

export async function POST(req: Request) {
  // Lê o cookie de sessão
  const jar   = await cookies()
  const token = jar.get("ps_session")?.value
  const me    = token ? await verifyToken(token) : null
  
  // Exige login
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  
  // me.userId    → ID do usuário logado
  // me.username  → username
  // me.guest     → true se é convidado
  
  // ...restante da lógica
}
```

### 7.5 Chamando APIs do lado do cliente

```tsx
"use client"

// GET simples
const res = await fetch("/api/social/events")
const eventos = await res.json()

// POST com corpo JSON
const res = await fetch("/api/social/events", {
  method:  "POST",
  headers: { "Content-Type": "application/json" },
  body:    JSON.stringify({ title: "Meu Evento", date: "2026-05-01" }),
})

if (res.ok) {
  const evento = await res.json()
  console.log("Criado:", evento)
} else {
  const erro = await res.json()
  console.error("Erro:", erro.error)
}
```

**Códigos HTTP importantes:**
- `200` — sucesso (OK)
- `201` — criado com sucesso
- `400` — erro do cliente (dados inválidos)
- `401` — não autenticado
- `403` — proibido (sem permissão)
- `404` — não encontrado
- `500` — erro interno do servidor

---

## 8. TypeScript

### 8.1 Tipos básicos

```tsx
// Primitivos
const nome:    string  = "Vitor"
const numero:  number  = 42
const ativo:   boolean = true
const nada:    null    = null

// Arrays
const tags:    string[]  = ["botânica", "wicca"]
const numeros: number[]  = [1, 2, 3]

// Objetos (inline)
const user: { id: string; nome: string } = { id: "1", nome: "Vitor" }

// Objeto opcional (? = pode não existir)
const bio: string | null = null     // string ou null
const url: string | undefined       // string ou undefined
```

### 8.2 Tipos customizados (type e interface)

```tsx
// Definindo um tipo
type Evento = {
  id:          string
  titulo:      string
  data:        Date
  descricao?:  string    // opcional
  vagas:       number
  tags:        string[]
}

// Usando o tipo
function MostrarEvento({ evento }: { evento: Evento }) {
  return (
    <div>
      <h2>{evento.titulo}</h2>
      <p>{evento.vagas} vagas</p>
      {evento.descricao && <p>{evento.descricao}</p>}  {/* só mostra se existe */}
    </div>
  )
}
```

### 8.3 Como ler erros de TypeScript

O erro mais comum é de tipo incompatível:
```
Type 'string' is not assignable to type 'number'
```
→ Você passou uma string onde esperava um número.

```
Property 'username' does not exist on type '{}'
```
→ Você tentou acessar `.username` em um objeto que o TypeScript não sabe que tem esse campo. Precisa definir o tipo.

```
Object is possibly 'null'
```
→ A variável pode ser `null`. Use verificação:
```tsx
if (user) {           // ← forma 1: if
  console.log(user.username)
}
console.log(user?.username)  // ← forma 2: optional chaining (retorna undefined se null)
console.log(user!.username)  // ← forma 3: forçar (use com cautela)
```

---

## 9. Documentação

### Onde buscar respostas

| Tecnologia | URL | O que buscar |
|---|---|---|
| **Next.js** | [nextjs.org/docs](https://nextjs.org/docs) | "App Router", "Server Components", "Route Handlers" |
| **React** | [react.dev](https://react.dev) | "useState", "useEffect", "components" |
| **Tailwind CSS** | [tailwindcss.com/docs](https://tailwindcss.com/docs) | Nome da propriedade CSS em português |
| **Prisma** | [prisma.io/docs](https://www.prisma.io/docs) | "findMany", "create", "schema" |
| **TypeScript** | [typescriptlang.org/docs](https://www.typescriptlang.org/docs) | "types", "interfaces", "generics" |
| **Framer Motion** | [motion.dev/docs](https://motion.dev/docs) | "animate", "variants", "AnimatePresence" |

### Como usar a IA para aprender

Bons prompts para fazer ao Claude:
- *"Explica o que faz essa linha: `const [tab, setTab] = useState('posts')`"*
- *"Como adiciono um campo 'telefone' ao modelo User no Prisma?"*
- *"Quero que esse botão fique vermelho quando eu passar o mouse — como?"*
- *"Qual a diferença entre `map()` e `filter()` em JavaScript?"*
- *"Esse erro diz 'Cannot read property of null' — o que significa?"*

---

## 10. Receitas Práticas

### Receita 1 — Mudar a cor de destaque padrão de um tema

```css
/* Em app/globals.css, encontre o tema (ex: [data-theme="editorial"]) */
[data-theme="editorial"] {
  --c-accent: 200 50 50;  /* ← mude para R G B do vermelho que quiser */
}
```

### Receita 2 — Adicionar um link no menu

```tsx
// Em atlas/components/layout/UnifiedNav.tsx
// Encontre a constante da coluna onde quer adicionar:

const COL_CULTURA: NavLink[] = [
  // ...links existentes...
  { label: "Meu Link", href: "/minha-rota", desc: "Breve descrição" }, // ← adicione
]
```

### Receita 3 — Criar uma nova seção nas configurações

```tsx
// Em atlas/components/settings/SettingsClient.tsx
// 1. Adicione ao array de abas:
const TABS = [
  // ...abas existentes...
  { id: "nova-aba" as TabId, label: "Nova Aba", symbol: "◎" },
]

// 2. Crie o componente da aba:
function NovaAbaTab() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Minha Nova Seção">
        <p className="text-[10px] font-mono text-solar-muted/50">
          Conteúdo aqui
        </p>
      </Section>
    </div>
  )
}

// 3. Adicione a renderização no final do SettingsClient:
{tab === "nova-aba" && <NovaAbaTab />}
```

### Receita 4 — Adicionar um novo campo de texto à API

```tsx
// 1. Adicione ao schema (prisma/schema.prisma):
model Event {
  // ...campos existentes...
  maxAge  Int?  // ← novo campo: idade máxima dos participantes
}

// 2. Aplique: npx prisma db push

// 3. Aceite na API (app/api/social/events/route.ts):
const { title, date, maxAge } = await req.json() as {
  title:   string
  date:    string
  maxAge?: number  // ← novo
}

await prisma.event.create({
  data: { title, date: new Date(date), maxAge }  // ← inclua
})

// 4. Exiba no frontend (app/social/eventos/[id]/page.tsx):
{event.maxAge && (
  <p className="font-mono text-[8px] text-solar-muted/50">
    Idade máxima: {event.maxAge} anos
  </p>
)}
```

### Receita 5 — Mudar a animação de transição de páginas

```tsx
// Em atlas/components/layout/PageTransition.tsx
<motion.div
  key={pathname}
  initial={{ opacity: 0, y: 6 }}   // ← estado inicial
  animate={{ opacity: 1, y: 0 }}   // ← estado final (visível)
  exit={{ opacity: 0, y: -4 }}     // ← ao sair
  transition={{
    duration: 0.12,                  // ← duração em segundos (aumente para mais lento)
    ease: [0.16, 1, 0.3, 1],        // ← curva de aceleração
  }}
>
  {children}
</motion.div>

// Outras variações de animação que pode tentar:
initial={{ opacity: 0, scale: 0.98 }}  // ← zoom suave
initial={{ opacity: 0, x: -20 }}       // ← deslize da esquerda
```

### Receita 6 — Entender um arquivo desconhecido

1. Leia o comentário no topo (se houver)
2. Veja o que é exportado (`export function`, `export default`)
3. Leia os tipos das props (o que o componente recebe)
4. Siga o `return` — é o HTML/JSX que o componente produz
5. Cada `{variavel}` dentro do JSX é JavaScript sendo executado

---

## Glossário Rápido

| Termo | Significado |
|---|---|
| **Component** | Função que retorna HTML. Reusável. |
| **Props** | Dados passados para um componente pelo componente pai |
| **State** | Dados que mudam e fazem o componente re-renderizar |
| **Hook** | Função especial do React que começa com `use` |
| **Route** | URL → arquivo de página |
| **API Route** | Arquivo `route.ts` que responde requisições HTTP |
| **ORM** | Camada de abstração sobre o banco de dados |
| **Schema** | Definição da estrutura do banco de dados |
| **Migration** | Mudança aplicada no banco de dados |
| **Build** | Compilação do projeto para produção |
| **SSR** | Server Side Rendering — HTML gerado no servidor |
| **CSR** | Client Side Rendering — HTML gerado no browser |
| **RSC** | React Server Component — componente que roda no servidor |
| **ISR** | Incremental Static Regeneration — cache com revalidação |
| **JWT** | Token de autenticação (JSON Web Token) |
| **CRUD** | Create, Read, Update, Delete — operações básicas de banco |
