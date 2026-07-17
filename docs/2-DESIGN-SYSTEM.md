---
title: "Design System — Interface Universal e Modular"
created: "2026-06-16"
---

# Design System do Portal Solar

> Referência de interface. Para qualquer dúvida de "qual classe eu uso?" ou "como faço isso funcionar em todos os temas?", a resposta está aqui.
>
> Regra de ouro: **nunca use cores hardcoded em componentes.** Qualquer `#RRGGBB` fora de `globals.css` quebra os 32 temas.

---

## 1. Tokens de Design — os 10 CSS vars

Todo o sistema de temas se baseia em 10 variáveis CSS. Quando você troca de tema, essas variáveis mudam — e tudo muda com elas. **Use apenas essas variáveis para cor em qualquer componente.**

| Variável | Significado semântico | Onde usar |
|---|---|---|
| `--c-void` | Fundo mais profundo | `body`, sidebar recolhida, fundo de página |
| `--c-deep` | Fundo elevado, primeiro nível | Painéis, cards principais, sidebar expandida |
| `--c-surface` | Superfície alta, interativa | Inputs, hover states, tooltips, dropdowns |
| `--c-border` | Bordas e divisores | `border`, `divide`, separadores visuais |
| `--c-text` | Texto primário | Títulos, corpo de texto principal |
| `--c-muted` | Texto secundário | Metadata, labels, datas, placeholders, subtítulos |
| `--c-accent` | Ação principal, marca Portal Solar | Links, botões primários, destaques, foco |
| `--c-accent-lt` | Versão clara do accent | Hover de botões accent, backgrounds de badges |
| `--c-teal` | Ação do Compass, ações pessoais | Botões/ícones de diário, metas, estudos |
| `--c-teal-lt` | Versão clara do teal | Hover de elementos teal, backgrounds suaves |

### Como usar em Tailwind:
```jsx
// Cor de texto
<p className="text-[var(--c-text)]">Texto principal</p>
<p className="text-[var(--c-muted)]">Metadata</p>

// Background
<div className="bg-[var(--c-deep)]">Painel</div>
<div className="bg-[var(--c-surface)]">Input</div>

// Borda
<div className="border border-[var(--c-border)]">Card</div>

// Accent
<button className="bg-[var(--c-accent)] text-[var(--c-void)]">Ação</button>
```

### Variáveis adicionais (tipografia, espaçamento, textura):
| Variável | Uso |
|---|---|
| `--font-display` | Fonte de display (Plus Jakarta Sans) — títulos grandes |
| `--font-sans` | Fonte de corpo (Inter) — texto corrido |
| `--font-ibm-plex-mono` | Monospace (JetBrains Mono) — código, labels UI |
| `--page-pad` | Padding lateral responsivo das páginas |
| `--grain` | SVG de textura grain (injetado via `--bg-pattern-image`) |
| `--grain-opacity` | Intensidade da textura |

---

## 2. Escala Tipográfica

Classes definidas em `globals.css`. Devem ser usadas consistentemente — não reinvente tipografia por página.

| Classe | Tamanho | Fonte | Quando usar |
|---|---|---|---|
| `.page-hero` | ~5–8rem, uppercase, tracking wide | Display | Abertura de páginas especiais (Monumento, telas de boas-vindas) |
| `.page-hero-sm` | Variante menor do hero | Display | Subtítulos de hero |
| `.page-hero-xl` | Variante maior do hero | Display | Momentos únicos de impacto máximo |
| `.page-title` | ~1.5–2rem, semibold | Display | **H1 de toda seção/página** — use sempre aqui |
| `.page-subtitle` | ~1rem, normal | Sans | Descrição de seção, subtítulo de módulo |
| `.page-label` | ~0.75rem, uppercase, tracking | Mono | Labels de categoria, área, status, metadata |

### Exemplo de hierarquia correta:
```jsx
<h1 className="page-title">Atlas</h1>
<p className="page-subtitle">Repositório de conhecimento catalogado</p>
<span className="page-label">247 itens · HUMANIDADE</span>
```

---

## 3. Classes de Componentes

### Containers

| Classe | Uso | Quando |
|---|---|---|
| `.card` | `bg-[--c-deep] border border-[--c-border] rounded-...` | Container padrão de conteúdo — item, post, nota, resultado de busca |
| `.glass` | Fundo translúcido com blur | Overlays, modais leves, elementos flutuantes sobre conteúdo |
| `.glass-strong` | Glass mais opaco | Modais/popovers que precisam de legibilidade sobre fundos complexos |

### Botões

Use **sempre uma das classes abaixo** — nunca monte a estilização de um botão do zero.

| Classe | Hierarquia visual | Quando usar |
|---|---|---|
| `.btn-primary` | Fundo accent, texto void | Ação principal única na tela (salvar, criar, confirmar) |
| `.btn-solid` | Fundo surface, texto text | Ação secundária sólida |
| `.btn-subtle` | Fundo muted/transparente | Ações de suporte (cancelar, detalhe) |
| `.btn-ghost` | Sem fundo, só texto | Ações terciárias, links de navegação com aparência de botão |
| `.btn` | Base sem estilo de cor | Combine com modificadores acima; use sozinho apenas para botões totalmente customizados |

```jsx
// Hierarquia em um modal:
<button className="btn btn-primary">Salvar</button>
<button className="btn btn-ghost">Cancelar</button>
```

### Navegação por abas

| Classe | Uso |
|---|---|
| `.tab-bar` | Container horizontal das abas |
| `.tab` | Aba individual (inativa) |
| `.tab.active` ou `data-active` | Aba ativa |

```jsx
<div className="tab-bar">
  <button className="tab">Listagem</button>
  <button className="tab active">Grafo</button>
</div>
```

### Efeitos visuais

| Classe | Uso | Quando |
|---|---|---|
| `.glow-accent` | Box-shadow accent | Destaque de elemento selecionado, foco especial |
| `.glow-teal` | Box-shadow teal | Elementos do Compass em destaque |

Use com moderação — máximo 1 elemento por view. São ênfase, não padrão.

### Largura de página

| Classe | Largura máxima | Quando |
|---|---|---|
| `.page-narrow` | ~640px | Leitura intensa, formulários, diário |
| `.page-standard` | ~960px | Listagens, dashboards, maioria das páginas |
| `.page-wide` | ~1280px | Atlas com múltiplas colunas, World, Workspace |
| `.prose-portal` | Prose para conteúdo longo | Blog, documentação, notas extensas |

---

## 4. Template de Página Padrão

**Toda nova página deve seguir essa estrutura** para manter coerência visual entre os 17+ módulos.

```tsx
// app/[modulo]/page.tsx
import { PageHeader } from "@/atlas/components/layout/PageHeader"
import { FAB } from "@/atlas/components/ui/FAB"

export default async function ModuloPage() {
  // dados do servidor aqui
  const data = await fetchData()

  return (
    <>
      <PageHeader
        title="Nome do Módulo"
        subtitle="Descrição curta do que esta seção faz"
        // actions={<BotaoDeAcao />}  ← opcional
      />

      <main className="page-standard pt-6 pb-16">
        {/* conteúdo da página */}
      </main>

      {/* FAB: apenas em páginas com ação de criação */}
      <FAB href="/modulo/novo" label="Novo item" />
    </>
  )
}
```

Referências de implementação real:
- `app/atlas/page.tsx` — listagem com filtros, ViewSwitcher, múltiplos modos de view
- `app/compass/diario/page.tsx` — form inline + listagem
- `app/hub/page.tsx` — dashboard com dados do servidor

---

## 5. Padrão Server + Client Component

O padrão do projeto é:

```
app/[modulo]/page.tsx          ← Server Component (busca dados, sem 'use client')
app/[modulo]/[Modulo]Client.tsx ← Client Component (interatividade, hooks, useState)
```

```tsx
// page.tsx (servidor)
import { ModuloClient } from "./ModuloClient"

export default async function Page() {
  const items = await db.findMany(...)
  return <ModuloClient items={items} />
}

// ModuloClient.tsx (cliente)
"use client"
export function ModuloClient({ items }) {
  const [filter, setFilter] = useState(...)
  // ...
}
```

---

## 6. Compatibilidade Temática — Checklist

Antes de considerar um componente pronto, verifique:

- [ ] Usa apenas `--c-*` vars para **todas as cores** (background, texto, borda, shadow)
- [ ] Não tem `bg-white`, `bg-black`, `text-gray-*`, `border-gray-*` hardcoded em nenhum lugar
- [ ] Estados de hover/focus usam `--c-surface` (fundo) ou `--c-accent` (ação)
- [ ] Estados desabilitados usam `--c-muted` (texto) + `--c-border` (fundo/borda)
- [ ] Testado visualmente em pelo menos: `editorial` (claro) + `terminal` (escuro) + `cosmos-violeta` (escuro saturado)
- [ ] Não tem `opacity: 0.x` em cores que já têm variante (`--c-accent-lt` existe para isso)

---

## 7. Fontes

Já carregadas no `app/layout.tsx`:

| Fonte | Variável CSS | Tailwind | Uso |
|---|---|---|---|
| Plus Jakarta Sans | `--font-display` | `font-display` | Títulos, heroes, `.page-title`, `.page-hero` |
| Inter | `--font-sans` | `font-sans` | Corpo de texto, parágrafos, UI geral |
| JetBrains Mono | `--font-ibm-plex-mono` | `font-mono` | Código, labels UI, `.page-label` |

```jsx
// Aplicar corretamente:
<h1 className="font-display text-2xl font-semibold">Título</h1>
<p className="font-sans text-base">Corpo</p>
<span className="font-mono text-xs tracking-widest uppercase">LABEL</span>
```

---

## 8. Modelos de componentes que já existem (reusar antes de criar)

| Componente | Arquivo | O que faz |
|---|---|---|
| `PageHeader` | `atlas/components/layout/PageHeader.tsx` | Header padrão de página com título, subtítulo e slot de ações |
| `FAB` | `atlas/components/ui/FAB.tsx` | Botão flutuante de ação principal |
| `ItemCard` | `atlas/components/ui/ItemCard.tsx` | Card de item do Atlas |
| `EntryCard` | `atlas/components/ui/EntryCard.tsx` | Card de entrada (diário, nota) |
| `Tag` / `TagLink` | `atlas/components/ui/Tag.tsx` | Badge de tag/categoria |
| `SearchBar` | `atlas/components/ui/SearchBar.tsx` | Campo de busca com Fuse.js |
| `GlobalSearch` | `atlas/components/ui/GlobalSearch.tsx` | Command palette global (⌘K) |
| `ViewSwitcher` | `atlas/components/ui/ViewSwitcher.tsx` | Alternador de modos de view |
| `RelationsPanel` | `atlas/components/ui/RelationsPanel.tsx` | Painel de relações entre itens |
| `CoverImage` | `atlas/components/ui/CoverImage.tsx` | Imagem de capa com geração via IA |
| `GenerativePlaceholder` | `atlas/components/ui/GenerativePlaceholder.tsx` | Placeholder generativo para covers |
| `QuickCapture` | `atlas/components/ui/QuickCapture.tsx` | Captura rápida flutuante |
| `ModeSwitch` | `atlas/components/ui/ModeSwitch.tsx` | Alternador de modo de interface |
| `SidebarNav` | `atlas/components/layout/SidebarNav.tsx` | Navegação lateral |
| `BottomNav` | `atlas/components/layout/BottomNav.tsx` | Navegação inferior mobile |
| `Breadcrumb` | `atlas/components/layout/Breadcrumb.tsx` | Trilha de navegação |
| `PageSkeleton` | `atlas/components/ui/PageSkeleton.tsx` | Skeleton de loading de página |

**Regra:** antes de criar qualquer componente novo, verifique se um dos acima já resolve (ou pode ser adaptado).

---

## 9. Padrões de animação

O projeto usa **três camadas de animação** — não misture:

| Ferramenta | Uso | Quando usar |
|---|---|---|
| **Framer Motion** | Transições de componentes React, `AnimatePresence`, `motion.div` | Entradas/saídas de elementos na UI, transições de página |
| **GSAP + ScrollTrigger** | Animações de alta performance, scrub com scroll | Sequências complexas, parallax, animações ligadas ao scroll |
| **Lenis** | Smooth scroll nativo | Já configurado globalmente via `LenisProvider` — não instanciar de novo |

Para animações simples de hover/transição em CSS, use `transition-*` do Tailwind — sem JS.

---

*Portal Solar · Design System · 2026-06-16*
