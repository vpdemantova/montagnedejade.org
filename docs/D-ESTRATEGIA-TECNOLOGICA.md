---
title: "Estratégia Tecnológica — Caminhos, Stacks e Plano de Evolução"
created: "2026-06-13"
---

# Estratégia Tecnológica do Portal Solar

> Documento de referência para decisões de arquitetura, stack e plano de execução — web, mobile, desktop, backend, dados e design. Escrito para orientar tanto decisões de curto prazo quanto a visão de longo prazo (os "30 anos" mencionados em `VISAO.md`).

---

## 1. Diagnóstico honesto do estado atual

### O que já existe e funciona bem

- **Next.js 14 (App Router) + TypeScript strict** — base sólida, Server Components funcionando, rotas de API no mesmo projeto.
- **Prisma + SQLite (dev) / PostgreSQL (prod)** — funcional, mas com atrito (enums e Json não suportados em SQLite, contornado com `as const`).
- **BlockNote** — editor rico funcionando, com espelho em Markdown (`/content`) que garante portabilidade real — isso é **ouro** para a filosofia de soberania.
- **Tailwind + sistema de 32 temas via CSS vars** — flexível, fácil de estender.
- **Zustand + SWR + Fuse.js** — estado e busca local, leve, sem dependência de serviços externos.
- **R3F/Three.js** — Monumento Solar 3D funcionando, mas instalado com `--legacy-peer-deps` (sinal de atrito de dependências).
- **Auth própria (bcryptjs + jose + JWT em cookie httpOnly)** — simples, sem vendor lock-in.
- **Export/import via zip + scripts de rebuild a partir de Markdown** — já implementa parcialmente o ideal de "dados portáteis".

Esse conjunto já é **mais alinhado com "local-first" e "soberania" do que 90% dos produtos SaaS do mercado**. Isso é um ativo real — qualquer decisão de reescrita precisa preservar ou aumentar esse alinhamento, nunca diminuí-lo.

### Limitações reais (não cosméticas)

| Limitação | Impacto | Gravidade |
|---|---|---|
| Next.js 14 (atual é 15, com 16 em RC) | Perde melhorias de cache, Turbopack estável, React 19 | Média |
| Prisma + SQLite sem enum/Json nativo | Gambiarras de tipagem, risco de drift entre schema e `as const` | Média |
| Sem app mobile nativo | Uso fora do desktop é via navegador apenas (PWA parcial) | Alta (se mobile for prioridade) |
| Sem sincronização local-first real (CRDT) | "Soberania" hoje = export manual em zip, não sync contínuo entre dispositivos | Alta (é o coração filosófico do projeto) |
| R3F com `--legacy-peer-deps` | Dívida técnica silenciosa, pode quebrar em upgrades futuros | Baixa-Média |
| Stack 100% dependente do ecossistema React (BlockNote, R3F, react-force-graph, react-simple-maps) | Qualquer migração de framework de UI exige reescrever ou substituir todos esses componentes | Alta (relevante para Seção 4) |

Esse último ponto é crítico para a discussão de "continuar vs. reescrever" — veja Seção 4.

---

## 2. Panorama completo das tecnologias (2026)

### 2.1 Frontend Web

| Stack | Estado atual (2026) | Futuro / trajetória | Quando faz sentido |
|---|---|---|---|
| **React + Next.js** | React 19 estável, React Compiler (memoização automática) saindo de experimental, Next 15 estável / Next 16 em RC, Turbopack como bundler padrão (substituindo Webpack) | Caminho mais "chato e seguro" — maior ecossistema do planeta, contratação fácil, RSC maduro | Produtos que precisam de SEO, SSR, ecossistema gigante de libs (caso do Portal Solar hoje) |
| **Remix / React Router v7** | Fundiu-se com React Router; "framework mode" do RR7 é o sucessor espiritual do Remix | Tende a ficar nicho frente ao Next, mas é a opção "menos vendor" dentro do React | Equipes que querem React sem dependência forte da Vercel |
| **SvelteKit 5 (runes)** | Reatividade reescrita (`$state`, `$derived`), bundles menores, DX muito elogiada | Crescimento constante, comunidade pequena mas fiel; cada vez mais usado em produtos indie/solo | Projetos solo onde performance e simplicidade pesam mais que ecossistema de libs |
| **Vue 3 + Nuxt 4** | Maduro, Composition API estabilizada, Nuxt 4 com melhor DX de roteamento e cache | Estável, forte na Ásia e Europa, menos hype mas muito sólido | Equipes que vêm de Vue ou preferem templates a JSX |
| **SolidStart** | Reatividade fine-grained (sem virtual DOM), muito rápido | Nicho técnico, comunidade pequena, mas referência de performance | Projetos que precisam de performance extrema com sintaxe JSX-like |
| **Astro** | "Islands architecture" — HTML estático + JS só onde precisa, multi-framework (pode misturar React, Vue, Svelte na mesma página) | Domina o nicho de sites de conteúdo (blogs, docs, marketing) | Páginas estáticas/conteúdo pesado (ex.: `/blog`, `/sobre`, landing pages do Portal Solar) |
| **Qwik** | "Resumability" (zero hidratação) — promete TTI quase instantâneo | Ainda nicho, adoção lenta, mas tecnicamente influente | Produtos onde o time-to-interactive é a métrica nº1 |

**Conclusão da seção 2.1:** Next.js continua sendo a escolha "profissional padrão" — não é hype, é o caminho de menor risco e maior pool de talentos/libs. A única dor real (Next 14 → 15/16) é uma **atualização**, não uma reescrita.

---

### 2.2 Mobile

| Stack | Estado atual (2026) | Futuro / trajetória | Exemplos reais que funcionam bem |
|---|---|---|---|
| **Flutter / Dart** | Dart 3 estável, motor Impeller (substitui Skia) padrão em iOS/Android, suporta também Web, Desktop (macOS/Windows/Linux) e até embedded | Google segue investindo pesado; Flutter é hoje a stack cross-platform com melhor performance percebida e UI mais consistente entre plataformas | Google Pay, Google Ads, BMW (app do carro), Toyota, Alibaba (Xianyu), eBay Motors, Nubank (partes do app) |
| **React Native + Expo** | "New Architecture" (Fabric + TurboModules + JSI) é o padrão; Expo Router unifica navegação file-based (parecido com Next.js App Router) | Continua dominante para equipes que já são React/web — reaproveita conhecimento de JS/TS, mas não código de UI diretamente | Instagram, Discord, Shopify, Coinbase, X (Twitter) parcialmente |
| **Kotlin Multiplatform (KMP) + Compose Multiplatform** | Compose Multiplatform para iOS saiu de beta e está estável; compartilha lógica de negócio e, opcionalmente, UI | Aposta estratégica do Google/JetBrains para equipes Android-first que querem expandir para iOS sem reescrever tudo | McDonald's app, Philips Hue, Forbes, Netflix (ferramentas internas), Cash App (parcial) |
| **Nativo (Swift/SwiftUI + Kotlin/Jetpack Compose)** | Cada plataforma com seu próprio framework declarativo moderno (SwiftUI e Compose), maturidade alta | Sempre será o "teto" de performance e integração com a plataforma, mas custo de 2 times/2 códigos | Apps de bancos grandes, apps que dependem fortemente de APIs novas do iOS/Android no dia 1 |
| **PWA (Progressive Web App)** | Suporte excelente em Android (instala como app, push notification, offline via service worker); no iOS é mais limitado mas funcional desde iOS 16.4+ | Continua sendo o caminho de **menor custo e maior alinhamento com "soberania"** — o mesmo código web roda como app | Twitter/X Lite, Starbucks (PWA famoso por funcionar bem até offline), Spotify web em modo app |
| **Capacitor (Ionic)** | "Empacota" um app web (incluindo Next.js exportado estaticamente) como app nativo real, com acesso a APIs nativas via plugins | Caminho de menor esforço para colocar um app **na loja** sem reescrever UI | Muitos apps híbridos de médio porte; usado por equipes pequenas que já têm um app web pronto |

**Onde o Portal Solar se encaixa:** já existe `@ducanh2912/next-pwa` instalado — ou seja, **o caminho PWA já foi iniciado e não foi totalmente explorado**. Esse é o caminho de menor custo/maior retorno para "ter um app" sem abandonar o investimento em Next.js + BlockNote + R3F (que são 100% React/web).

---

### 2.3 Desktop

| Stack | Estado atual | Quando faz sentido |
|---|---|---|
| **Tauri 2.0** | Usa WebView do sistema (não empacota um Chromium inteiro como Electron) → binários de ~3-10MB vs ~100MB+ do Electron; backend em Rust, mas o frontend pode ser **exatamente o seu Next.js exportado** | Ideal para o Portal Solar: dá um `.app`/`.exe`/`.deb` real, reaproveitando 100% do frontend, alinhado com "permanência" (binário que roda offline, sem depender de navegador) |
| **Electron** | Maduro, usado por VS Code, Slack, Discord, Obsidian | Mais pesado, mas ecossistema gigante de plugins; ainda é "o padrão" se equipe não quer aprender Rust |
| **Flutter Desktop** | Suporta macOS/Windows/Linux nativamente | Só vale a pena se o mobile também for Flutter (ver seção 4) |

**Obsidian é o paralelo mais próximo filosoficamente ao Portal Solar** (local-first, Markdown como fonte de verdade, app desktop + mobile + plugins) — e Obsidian é construído em **Electron + TypeScript**, provando que essa filosofia funciona muito bem mesmo com stacks "web".

---

### 2.4 Backend & API

| Opção | Estado atual | Quando trocar |
|---|---|---|
| **Next.js API Routes / Server Actions** (atual) | Suficiente para a maioria dos casos; Server Actions eliminam boilerplate de fetch | Manter, é a opção certa enquanto o backend não precisar escalar separado do frontend |
| **Hono** | Framework leve, roda em qualquer runtime (Node, Bun, Deno, Cloudflare Workers, Vercel Edge) | Se precisar de endpoints de altíssima performance/edge separados do Next |
| **tRPC** | Tipagem end-to-end entre API e frontend sem gerar código | Vale considerar se a API crescer muito — elimina a necessidade de validar tipos manualmente em fetch/SWR |
| **Go / Rust (Axum)** | Para serviços isolados de altíssima performance (ex.: processamento de imagens, indexação) | Só se houver um gargalo real medido — não antecipar |
| **Supabase / PocketBase / Convex (BaaS auto-hospedável)** | PocketBase é um único binário Go com SQLite embutido + admin UI + auth + realtime — extremamente alinhado com "soberania" (você roda seu próprio backend) | Interessante como *alternativa* ao Prisma+API custom se quiser menos código de boilerplate, mas exigiria migração de schema |

---

### 2.5 Banco de dados & sincronização local-first (o coração da filosofia)

Esta é a área onde a **Visão** do Portal Solar (soberania, portabilidade, permanência) e a **implementação atual** estão mais distantes.

| Tecnologia | O que é | Por que importa para o Portal Solar |
|---|---|---|
| **Drizzle ORM** | ORM TypeScript "fino", gera SQL real, suporta enums nativos no SQLite via `CHECK` constraints, sem o atrito que o Prisma tem | Resolveria a dor documentada no ADR sobre `as const` — migração é incremental, não é um "rewrite" |
| **libSQL / Turso** | Fork do SQLite com replicação embutida — você pode ter o `.db` local **e** réplicas na nuvem sincronizadas | Mantém a filosofia "o arquivo é seu" mas adiciona sync multi-dispositivo sem virar um SaaS fechado |
| **CRDTs (Automerge, Yjs)** | Estruturas de dados que permitem merge automático de edições feitas offline em dispositivos diferentes | É **o** caminho para "Compass" (diário, notas) funcionar perfeitamente offline em celular e desktop e sincronizar sem conflitos — sem precisar de um servidor "dono" dos dados |
| **ElectricSQL / PowerSync** | Camadas de sincronização local-first sobre Postgres/SQLite — sincronizam um subconjunto do banco para o dispositivo local automaticamente | Dariam ao Portal Solar sync real entre desktop/mobile/web mantendo Postgres como "backup central" opcional |
| **RxDB** | Banco local-first no navegador/app com plugins de sync para vários backends | Alternativa mais simples de adotar incrementalmente no frontend, sem trocar o backend ainda |

**Importante:** nada disso exige abandonar Prisma/Postgres *hoje*. É uma evolução em camadas — primeiro Drizzle (resolve dor imediata), depois, se "um app no celular que funciona no avião e sincroniza depois" for prioridade real, entra um motor de sync (ElectricSQL/PowerSync ou CRDT manual para módulos específicos como Diário).

---

### 2.6 Design system & UI

| Item | Estado atual | Observação |
|---|---|---|
| **Tailwind CSS** | v3.4 no projeto, v4 já é estável (motor Oxide em Rust, builds muito mais rápidos, config em CSS nativo) | Upgrade de baixo risco, ganho real de DX e performance de build |
| **shadcn/ui** | Não é uma lib instalada — é um gerador de componentes (Radix + Tailwind) que você "copia" para o projeto | Encaixaria perfeitamente no sistema de 32 temas via CSS vars já existente, sem trazer dependência pesada |
| **Framer Motion / GSAP / Lenis** | Já no projeto, são os melhores da categoria | Manter — não há "futuro melhor" claro que justifique troca |
| **React Three Fiber** | Já no projeto, padrão de fato para 3D declarativo em React | Manter; alternativa "no-code" seria Spline para cenas simples, mas o Monumento já está em R3F |

---

### 2.7 Inteligência Artificial

| Opção | Estado | Alinhamento com "soberania" |
|---|---|---|
| **Gemini (atual)** | Bom custo/benefício, multimodal | Depende de API externa — é "opcional" no projeto, o que já é a postura certa |
| **Claude API (Anthropic)** | Melhor para raciocínio/redação longa, bom para sumarização de conhecimento (caso de uso do Atlas) | Mesma categoria — externo, opcional |
| **Ollama + modelos locais (Llama, Mistral, Gemma)** | Roda 100% local, sem internet, sem custo por token | **Máximo alinhamento filosófico** — "o conhecimento e a IA que o organiza vivem no seu hardware". Viável hoje para sumarização/tags em máquinas com 16GB+ RAM |

---

## 3. Exemplos reais — o que funciona bem e por quê

| App | Stack | Por que funciona |
|---|---|---|
| **Obsidian** | Electron + TypeScript + arquivos `.md` locais | Prova que "Markdown como fonte de verdade + app desktop/mobile" é viável e amado por usuários — é o paralelo mais próximo do Portal Solar |
| **Linear** | React + sync engine local-first próprio (offline-first, IndexedDB) | Mostra o padrão "app parece instantâneo porque os dados já estão no dispositivo" — referência para o Compass |
| **Notion** | Stack própria, mas conceito de blocos editáveis = exatamente o que BlockNote oferece | Valida a escolha de BlockNote como editor |
| **Figma** | CRDT (multiplayer em tempo real) | Referência de como CRDTs resolvem colaboração/sync sem servidor "dono" |
| **Google Pay / BMW App** | Flutter | Mostra Flutter em produção de altíssima escala, UI idêntica entre iOS/Android |
| **Discord** | React Native (mobile) + Electron (desktop) + React (web) | Mostra uma empresa grande optando por **JS/TS em todas as plataformas** em vez de unificar tudo numa stack só — pragmatismo > pureza |
| **Starbucks PWA** | PWA pura | Prova que PWA é suficiente para um app de uso diário, inclusive com presença offline |

**Padrão que emerge:** as empresas que **já tinham um produto web forte** (Discord, Notion, Linear) **não jogaram tudo fora** para ir para Flutter — elas estenderam com React Native/Electron/PWA. Empresas que escolheram Flutter desde o início (Google Pay) o fizeram porque começaram do zero, sem investimento prévio em React.

**O Portal Solar está no primeiro grupo**: já tem ~meses de investimento em Next.js + BlockNote + R3F + sistema de temas. Isso pesa muito na recomendação da Seção 4.

---

## 4. Caminhos estratégicos — continuar ou reescrever?

### Opção A — Evolução incremental (recomendado como base, baixo risco)

Atualizar a fundação sem quebrar nada:

1. Next.js 14 → 15/16, React 18 → 19 (+ React Compiler)
2. Tailwind 3 → 4
3. Prisma → Drizzle (resolve a dor de enums/Json no SQLite de forma definitiva)
4. Remover `--legacy-peer-deps` (resolver conflito real do R3F/Expo)

**Esforço:** 1-3 semanas de trabalho focado. **Risco:** baixo (upgrades incrementais, testáveis um a um). **Resultado:** mesma plataforma, mais rápida, mais sólida, sem dívida técnica de tipagem.

### Opção B — Portal Solar como app de desktop real (Tauri)

Empacotar o Next.js existente com Tauri 2.0:

- Gera `.app` (macOS), `.exe` (Windows), `.deb`/`.AppImage` (Linux)
- Roda offline com o SQLite local embutido no próprio binário
- **Reaproveita 100% do código atual** — zero reescrita de UI

**Esforço:** 1-2 semanas (configuração do Tauri + ajustes de paths para SQLite local). **Risco:** baixo. **Resultado:** concretiza literalmente a frase da Visão — *"um sistema que você constrói, carrega consigo e deixa como obra ao mundo"* — agora como um app de verdade, não só um site.

### Opção C — Mobile via PWA + Capacitor (sem reescrever)

Já existe `next-pwa` instalado. Próximos passos:

1. Completar manifest, ícones, service worker com cache offline real para rotas do Atlas/Compass
2. Testar "Adicionar à tela inicial" no Android/iOS
3. Se precisar estar na App Store/Play Store (notificações push nativas, etc.), envolver o build exportado com **Capacitor** — ainda é o mesmo código React

**Esforço:** 2-4 semanas para PWA robusto; +2-3 semanas para Capacitor + publicação nas lojas. **Risco:** baixo-médio. **Resultado:** app instalável em qualquer dispositivo, alinhado com "portátil" da Visão, sem duplicar a base de código.

### Opção D — App mobile nativo dedicado (Flutter) para um módulo específico

Em vez de reescrever *tudo*, criar um **app Flutter satélite** focado só no **Compass** (diário, notas rápidas, metas — uso diário, precisa ser rápido e offline-first), consumindo a mesma API REST/tRPC do Next.js.

- Flutter dá UI nativa de altíssima qualidade para o caso de uso "abrir o app, escrever 2 linhas, fechar"
- Atlas, Portal, Monumento 3D continuam só na web (onde BlockNote/R3F brilham)
- Backend permanece único (Next.js API)

**Esforço:** 2-3 meses para um app Flutter focado e bem feito. **Risco:** médio (novo time/skillset em Dart, manutenção de 2 codebases). **Quando vale:** se o uso diário do Compass em celular for uma prioridade real de produto, não só "seria legal ter".

### Opção E — Reescrita total em Flutter (web + mobile + desktop unificados)

Tecnicamente possível — Flutter roda em tudo. Mas:

- **BlockNote não existe em Flutter** — precisaria reescrever o editor de blocos do zero ou adotar `appflowy_editor` (Flutter, open-source, mas com curva de adoção e menos maduro que BlockNote)
- **R3F/Three.js → Flutter** exigiria recriar o Monumento 3D com `flutter_gl`/`three_dart`, ecossistema muito menor
- **react-force-graph, react-simple-maps** (usados no grafo do Atlas e no mapa mundial) não têm equivalente direto maduro em Flutter
- SEO de páginas públicas (`/perfil/[username]`, `/blog`) seria prejudicado — Flutter Web não faz SSR real

**Esforço estimado:** 6-12+ meses para recriar o que já existe, com risco alto de qualidade inferior nos módulos 3D/editor durante a transição. **Recomendação: não fazer agora.** Reavaliar só se, no futuro, o produto pivotar para ser **mobile-first** com conteúdo simples (sem 3D, sem editor de blocos complexo).

### Opção F — Arquitetura local-first profunda (CRDT/sync engine)

Independente da UI, evoluir a camada de dados:

1. Curto prazo: Drizzle + libSQL/Turso (sync simples de SQLite entre dispositivos)
2. Médio prazo: para módulos de "escrita pessoal contínua" (Diário, Notas), introduzir Automerge/Yjs — permite escrever offline no celular (via PWA) e no desktop e sincronizar sem conflito
3. Isso transforma a "exportação manual em zip" (hoje) em **sincronização contínua e automática**, sem depender de um servidor central como "dono" dos dados — o servidor passa a ser só um *relay* opcional

**Esforço:** 1-2 meses para o primeiro módulo (ex.: Diário) como prova de conceito. **Risco:** médio (CRDTs têm curva de aprendizado). **Por que importa:** é a peça que mais diretamente realiza o valor "Soberania" da Visão — hoje o dado "pertence ao usuário" no sentido de que pode ser exportado; com CRDT, ele pertence ao usuário no sentido de que **vive primeiro no dispositivo dele**, sempre.

---

## 5. Plano de execução recomendado (faseado)

### Fase 1 — Fundação sólida (1 mês)
- [ ] Opção A completa: Next 15/16, React 19, Tailwind 4, Drizzle no lugar do Prisma
- [ ] Resolver `--legacy-peer-deps` (atualizar R3F/drei para versões compatíveis com React 19)
- [ ] Atualizar `docs/STACK.md` e `docs/ARQUITETURA.md` refletindo as mudanças (novos ADRs)

### Fase 2 — Portal Solar como objeto físico (1-2 meses, paralelo possível)
- [ ] Opção B: empacotar com Tauri 2.0 → app desktop real (macOS/Windows/Linux)
- [ ] Opção C: PWA completo (offline cache, manifest, ícones) → instalável em celular

Ao fim da Fase 2, a frase *"um sistema que você constrói, carrega consigo e deixa como obra ao mundo"* deixa de ser metáfora — existe um arquivo `.app`/`.exe` e um ícone na tela inicial do celular.

### Fase 3 — Sincronização e soberania de dados (2-3 meses)
- [ ] Opção F, fase 1: libSQL/Turso para sync básico entre dispositivos
- [ ] Prova de conceito com CRDT (Automerge) no módulo Diário/Notas do Compass
- [ ] Documentar como ADR (`docs/ARQUITETURA.md`) o novo modelo de sync

### Fase 4 — Avaliar app mobile dedicado (decisão, não execução imediata)
- [ ] Medir uso real do Compass via PWA (Fase 2) por 1-2 meses
- [ ] Se uso diário em mobile for alto E PWA tiver limitações sentidas → Opção D (Flutter satélite para Compass)
- [ ] Se PWA for suficiente → não fazer nada, economizar o esforço

### Fora do roadmap (não recomendado no horizonte atual)
- Reescrita total em Flutter/Dart (Opção E) — custo/benefício desfavorável dado o investimento já feito em BlockNote/R3F/sistema de temas
- Troca de Next.js por outro framework web (Svelte/Vue/Astro) — nenhum ganho que justifique reescrever ~17 módulos de rotas já implementados

---

## 6. Recomendação consolidada

O Portal Solar **não precisa ser refeito** — precisa de **três camadas de evolução** que, juntas, aproximam radicalmente a implementação da Visão:

1. **Atualizar a fundação** (Next 15/16, React 19, Drizzle) — elimina dívida técnica documentada nos próprios ADRs.
2. **Materializar a soberania como objeto** — Tauri (desktop) + PWA (mobile) transformam o "site" em "app que é seu", sem reescrever uma linha de UI.
3. **Materializar a soberania como dado** — libSQL/CRDT fazem o dado viver primeiro no dispositivo do usuário, com sync como bônus, não como dependência.

Cada fase é **independente e reversível** — exatamente o tipo de progresso modular que `VISAO.md` define como valor fundamental. Nenhuma fase exige "pausar" o projeto para uma grande reescrita; cada uma entrega valor sozinha e pode ser feita por sessões, no ritmo do projeto.

A pergunta "Flutter ou React?" tem, neste contexto, uma resposta clara: **React/Next.js continua sendo o caminho certo** porque o produto já existe nessa stack, o ecossistema é o maior do mundo, e as únicas peças que "faltam" (app de desktop, app mobile instalável, sync offline) **podem ser adicionadas em camadas sobre o que já existe** — via Tauri, PWA/Capacitor e libSQL/CRDT — sem o custo e o risco de uma reescrita total.
