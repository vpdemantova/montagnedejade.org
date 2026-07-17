---
title: "Mapa da Plataforma — Módulos, Rotas e Conteúdo"
created: "2026-06-16"
---

# Mapa da Plataforma — Portal Solar

> Arquivo central de orientação. Para cada dúvida de "onde fica X?" ou "onde eu crio Y?", a resposta está aqui.
>
> As colunas **Figma** são slots para preencher com os nomes das páginas do seu arquivo Figma.

---

## 1. Módulos e Rotas

### ESFERA: ATLAS — O Repositório

| Módulo | Rota | Propósito | Figma | Status | Como preencher conteúdo |
|--------|------|-----------|-------|--------|-------------------------|
| Atlas | `/atlas` | Listagem geral de todo o conhecimento catalogado | — | funcionando | Crie itens em `/atlas/novo` |
| Item Individual | `/atlas/[slug]` | Visualização completa de um item: conteúdo BlockNote, relações, tags | — | funcionando | Edite dentro do próprio item |
| Novo Item | `/atlas/novo` | Editor de criação com IA, cover, categorização | — | funcionando | **Porta de entrada para todo conteúdo do Atlas** |
| Grafo | `/atlas/grafo` | Visualização das relações entre itens como grafo força-dirigido | — | funcionando | Alimentado automaticamente pelas relações dos itens |
| Vilas | `/portal/vilas` | Explorador de áreas temáticas — agrupa itens por área | — | funcionando | Alimentado automaticamente pelo Atlas |
| Vila de Área | `/portal/vilas/[area]` | Vista específica de uma área (ex: ARTES, ACADEMIA, POLÍTICA) | — | funcionando | Alimentado pelo Atlas; a área é definida ao criar o item |

**Áreas temáticas disponíveis no Atlas** (definem em qual Vila o item aparece):
- `ACADEMIA` — ciência, epistemologia, educação
- `ARTES` — artes visuais, música, literatura, teatro, cinema
- `COMPUTACAO` — tecnologia, programação, sistemas
- `AULAS` — material didático estruturado
- `POLITICA` — ciências políticas, filosofia política, história política
- Adicione novas áreas em `/settings` → aba Categorias

---

### ESFERA: COMPASS — O Espaço Pessoal

| Módulo | Rota | Propósito | Figma | Status | Como usar |
|--------|------|-----------|-------|--------|-----------|
| Diário | `/compass/diario` | Registro diário: energia (1–5), humor, intenção do dia | — | funcionando | Abrir todo dia e registrar |
| Notas | `/compass/notas` | Notas livres, linkáveis a itens do Atlas | — | funcionando | Capture pensamentos rápidos |
| Metas | `/compass/metas` | Objetivos com horizonte curto/longo e progresso | — | funcionando | Definir e atualizar periodicamente |
| Estudos | `/compass/estudos` | Rastreamento de sessões de estudo por disciplina | — | funcionando | Registrar cada sessão de estudo |
| Mapa | `/compass/mapa` | Mapa interior visual | — | parcial | — |

---

### ESFERA: PORTAL — A Presença Cultural

| Módulo | Rota | Propósito | Figma | Status | Como preencher conteúdo |
|--------|------|-----------|-------|--------|-------------------------|
| Cultura | `/portal/cultura` | Hub cultural: notices, eventos culturais, perfis | — | funcionando | Criar notices via API `/api/notices` |
| Perfil Cultural | `/portal/cultura/perfil/[slug]` | Perfil individual de pessoa/obra cultural | — | funcionando | — |
| Hub | `/hub` | Dashboard de descoberta: itens recentes, estatísticas, notices, item do dia | — | funcionando | Alimentado automaticamente pelo Atlas e notices |
| World | `/world` | Mapa mundial interativo com obras e pessoas | — | funcionando | Itens com localização geográfica |
| Monumento | `/monument` | Monumento Solar em 3D | — | funcionando | Conteúdo fixo / configurável no código |

---

### ESFERA: SOCIAL — A Rede e Comunidade

| Módulo | Rota | Propósito | Figma | Status | Como usar |
|--------|------|-----------|-------|--------|-----------|
| Feed | `/social` | Feed de posts, recomendações, descobertas | — | funcionando | Publicar via interface do feed |
| Eventos | `/social/eventos` | **Aqui ficam os eventos** — criação e listagem | — | funcionando | Criar eventos pela interface de Eventos |
| Mensagens | `/social/mensagens` | Mensagens entre usuários | — | parcial | — |
| Tokens | `/social/tokens` | Colecionáveis: avatares, badges, efeitos | — | funcionando | — |

---

### SISTEMA

| Módulo | Rota | Propósito | Figma | Status |
|--------|------|-----------|-------|--------|
| Blog | `/blog` | Escrita pública — posts longos | — | funcionando |
| Academia | `/academia` | Hub acadêmico estruturado | — | funcionando |
| Atelier | `/atelier` | Espaço criativo / obras em andamento | — | parcial |
| Workspace | `/workspace` | Área de trabalho com documentos | — | funcionando |
| Display | `/display` | Modo de exibição / apresentação | — | parcial |
| Sobre | `/sobre` | Como o site é feito | — | funcionando |
| Settings | `/settings` | Temas, seções, exportação, categorias, perfil | — | funcionando |
| Admin | `/admin` | Painel administrativo | — | funcionando |
| Perfil | `/perfil/[username]` | Perfil público de um usuário | — | funcionando |
| Convite | `/convite/[username]` | Página de convite personalizada | — | funcionando |

---

## 2. Tipos de Conteúdo e Onde Vivem

| Tipo de conteúdo | Onde criar | Onde aparece | Formato armazenado |
|---|---|---|---|
| Item de conhecimento | `/atlas/novo` | Atlas, Vilas, Hub, World (se geolocalizado), Grafo | `AtlasItem` no banco + `.md` em `/content/` |
| Aviso cultural (notice) | API `/api/notices` | Portal/Cultura, Hub | `Notice` no banco |
| Evento | `/social/eventos` | Social/Eventos | `Event` no banco |
| Entrada de diário | `/compass/diario` | Compass/Diário | `JournalEntry` no banco |
| Nota livre | `/compass/notas` | Compass/Notas | `Note` no banco |
| Meta | `/compass/metas` | Compass/Metas | `Goal` no banco |
| Post do feed | `/social` | Social/Feed | `Post` no banco |
| Post de blog | `/blog` | Blog | conteúdo estruturado |
| Sessão de estudo | `/compass/estudos` | Compass/Estudos | `StudySession` no banco |

**Conteúdo sobre Política, Ciências Políticas, Filosofia Política:**
→ Criar em `/atlas/novo`, selecionar categoria `POLITICA` (ou categoria correspondente).
→ Aparece automaticamente em `/atlas`, em `/portal/vilas/POLITICA`, e no grafo.

---

## 3. Mapeamento Figma → Código

> Preencha a coluna **Figma** com o nome exato da página no seu arquivo Figma.
> Use isso para saber exatamente qual código corresponde a cada design.

| Figma (nome da página) | Módulo/Rota | Componente/arquivo principal | Notas |
|---|---|---|---|
| — | `/atlas` | `app/atlas/page.tsx` + `atlas/components/views/` | 12+ modos de view |
| — | `/atlas/[slug]` | `app/atlas/[slug]/page.tsx` | Item completo com BlockNote |
| — | `/atlas/novo` | `app/atlas/novo/page.tsx` | Editor + IA |
| — | `/hub` | `app/hub/page.tsx` | Dashboard |
| — | `/compass/diario` | `app/compass/diario/page.tsx` | |
| — | `/compass/notas` | `app/compass/notas/page.tsx` | |
| — | `/compass/metas` | `app/compass/metas/page.tsx` | |
| — | `/compass/estudos` | `app/compass/estudos/page.tsx` | |
| — | `/portal/cultura` | `app/portal/cultura/page.tsx` | |
| — | `/portal/vilas` | `app/portal/vilas/page.tsx` | |
| — | `/social` | `app/social/page.tsx` | |
| — | `/social/eventos` | `app/social/eventos/` | |
| — | `/world` | `app/world/page.tsx` | Mapa interativo |
| — | `/monument` | `app/monument/page.tsx` | Three.js / R3F |
| — | `/blog` | `app/blog/page.tsx` | |
| — | `/academia` | `app/academia/page.tsx` | |
| — | `/atelier` | `app/atelier/page.tsx` | |
| — | `/settings` | `app/settings/page.tsx` | 10 abas |
| — | `/perfil/[username]` | `app/perfil/[username]/page.tsx` | |
| — | Referências visuais | `docs/DESIGN-SYSTEM.md` | Design tokens, padrões |

---

## 4. APIs Disponíveis (referência rápida)

| Endpoint | Método | O que faz |
|---|---|---|
| `/api/atlas` | GET, POST, PATCH, DELETE | CRUD completo de itens do Atlas |
| `/api/atlas/[slug]` | GET, PATCH, DELETE | Item individual |
| `/api/atlas/[slug]/relations` | GET, POST, DELETE | Relações entre itens |
| `/api/notices` | GET, POST | Notices culturais |
| `/api/journal` | GET, POST | Entradas de diário |
| `/api/goals` | GET, POST, PATCH | Metas |
| `/api/study` | GET, POST | Disciplinas e sessões de estudo |
| `/api/social/posts` | GET, POST | Feed de posts |
| `/api/ai/suggest` | POST | Sugestão de metadata via Gemini |
| `/api/ai/image` | POST | Geração de imagem de capa |
| `/api/export` | GET | Export completo em .zip |
| `/api/rss` | GET | Cache de feeds RSS |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |

---

## 5. Configurações e Personalização

| O que configurar | Onde ir |
|---|---|
| Tema visual (32 opções) | `/settings` → aba Aparência |
| Cores customizadas por tema | `/settings` → aba Aparência → Editor de Cores |
| Textura de fundo | `/settings` → aba Aparência |
| Seções da home | `/settings` → aba Início |
| Categorias do Atlas | `/settings` → aba Categorias |
| Feeds RSS | `/settings` → aba RSS |
| Exportar/importar dados | `/settings` → aba Exportação |
| Nome e perfil | `/settings` → aba Perfil |

---

*Portal Solar · última atualização: 2026-06-16*
