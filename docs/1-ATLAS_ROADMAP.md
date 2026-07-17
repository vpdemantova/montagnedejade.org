# Atlas — Roadmap Completo de Implementação
> Portal Solar · Documento de Execução  
> Criado: 2026-04-26 | Status: Em desenvolvimento

---

## VISÃO GERAL

O Atlas deve ser o maior índice visual de conhecimento da plataforma — uma apostila e museu digital onde **cada categoria tem sua tabela, sua galeria e suas conexões**. A estrutura se baseia no print Notion compartilhado: seções agrupadas com tabs de subcategoria, cards com imagens, listas de pessoas por ofício.

---

## PARTE 1 — REFORMULAÇÃO DAS SEÇÕES EXISTENTES

### 1.1 Atlas (Home View) `/`
- [ ] Implementar view em grupos como no print Notion: seções por área com tabs horizontais
- [ ] Cada seção: header com ícone + nome + contador + tabs de tipo (Objeto, Pessoa, Conceito…)
- [ ] Cards com imagem (WikiImage automático), título, subtipo, metadado
- [ ] Seção "Em Destaque" no topo (itens favoritos/pinados)
- [ ] Seção "Recém Adicionados" (últimos 10 itens)
- [ ] Scroll horizontal dentro de cada seção — nunca quebra para nova linha
- [ ] "+ Novo item" ao final de cada seção (não requer clique para navegar, só para criar)
- [ ] Barra de filtros persistente acima das seções (por área, tipo, tag)
- [ ] Card redesenhado: bordas arredondadas (4-6px), fundo menos apagado, sombra leve

### 1.2 Display `/display`
- [ ] Seção exclusiva de curadoria editorial — **não é o Atlas geral**
- [ ] Layout: grade editorial assimétrica (estilo revista)
- [ ] Itens pinados/favoritos em destaque com imagem grande
- [ ] Separado do Atlas: tem seu próprio conteúdo selecionado manualmente
- [ ] Filtros: por tema, por data, por tipo de conteúdo

### 1.3 Cultura `/portal/cultura`
- [ ] Reestruturar como portal de **notícias + referências por área**
- [ ] Áreas: Arte, Música, Literatura, Cinema, Arquitetura, Gastronomia, Moda, Design
- [ ] Cada área: feed de links externos + items internos do Atlas relacionados
- [ ] Fontes a integrar: RSS de museus, jornais culturais, revistas especializadas
- [ ] Seção "Esta semana em Cultura" — curadoria manual semanal
- [ ] Links para Wikipedia, Britannica, Internet Archive por tópico

### 1.4 Academia `/academia`
- [ ] Reestruturar como portal de **aprendizado + manifestos + ensinamentos**
- [ ] Seções: Aulas, Manifestos, Guias, Contemplações, Problemas do Mundo
- [ ] Cada "aula" é um item do Atlas com type=AULA e conteúdo rich text
- [ ] Linha do Tempo do Conhecimento Humano (interativa)
- [ ] Seção "Grandes Questões" (por que guerras? conflitos? etc.)
- [ ] Conexões entre pessoas históricas e suas contribuições
- [ ] Hub→Academia: centralizar todos os recursos de aprendizado

### 1.5 Compass (Pessoal)
- [ ] **Quadro** `/compass/quadro`: dashboard pessoal — metas, diário recente, favoritos
- [ ] **Perfil** `/compass/perfil`: cartão de membro + abas + conexões com o Atlas (favoritos, interesses)
- [ ] **Estudos** `/compass/estudos`: tracker de aprendizado com progresso
- [ ] **Diário** `/compass/diario`: editor de entrada com tags e humor
- [ ] **Metas** `/compass/metas`: OKRs pessoais com progresso
- [ ] Unir Compass com Atlas: favoritos do Atlas aparecem no perfil

---

## PARTE 2 — TABELAS A CRIAR NO ATLAS (SEED)

Cada tabela abaixo é um conjunto de items no banco com `area` e `type` específicos.  
O seed já tem: **118 elementos (ELEMENTOS)** + cosmos + pessoas + obras + ciências + história.

### 2.1 TABELA PERIÓDICA INTERATIVA *(prioridade máxima)*
- [ ] Página dedicada `/atlas/tabela-periodica`
- [ ] Layout visual em grade periódica real (18 colunas × 7 períodos + lantanídeos/actinídeos)
- [ ] Cada célula: símbolo grande, número atômico, nome, massa, cor por categoria
- [ ] Clique abre drawer com: foto, modelo 3D (link Sketchfab/embed), usos, curiosidades, relações
- [ ] Filtros visuais: por categoria (metais, gases nobres, etc.), por período, por grupo
- [ ] Integração WikiImage para foto de cada elemento
- [ ] Estado dos elementos: sólido/líquido/gasoso à temperatura ambiente (indicador)
- [ ] **Seed:** 118 elementos já existem — adicionar `coverImage` via Wikipedia

### 2.2 PROFISSÕES E OFÍCIOS *(400+ items)*
```
area: PESSOAS | type: PERSON (profissões como conceito) ou CONCEPT (definição do ofício)
```
Categorias a criar:
- **Artes Plásticas:** Pintor, Escultor, Gravurista, Ceramista, Ilustrador, Desenhista, Muralista, Fotógrafo
- **Música:** Compositor, Maestro, Instrumentista, Cantor, DJ, Produtor Musical, Arranjador, Luthier
- **Literatura:** Escritor, Poeta, Dramaturgo, Roteirista, Jornalista, Editor, Tradutor, Crítico Literário
- **Ciências:** Físico, Químico, Biólogo, Matemático, Astrônomo, Geólogo, Médico, Psicólogo, Antropólogo
- **Filosofia:** Filósofo, Teólogo, Ético, Lógico, Epistemólogo, Metafísico
- **Tecnologia:** Engenheiro, Arquiteto, Programador, Designer, UX Designer, Cientista de Dados
- **Artes Performáticas:** Ator, Dançarino, Coreógrafo, Diretor Teatral, Circense
- **Artesanato:** Marceneiro, Ferreiro, Oleiro, Tecelão, Sapateiro, Joalheiro, Vidreiro
- **Gastronomia:** Chef, Confeiteiro, Sommelier, Padeiro, Chocolatier
- **Educação:** Professor, Pedagogo, Tutor, Mentor, Orientador
- **Medicina Tradicional:** Curandeiro, Herbalista, Xamã, Acupunturista
- **Espiritualidade:** Monge, Padre, Rabino, Imã, Yogi, Druida
- **Política e Direito:** Estadista, Diplomata, Juiz, Advogado, Legislador
- **Exploradores e Navegadores:** Cartógrafo, Explorador, Navegador, Alpinista, Mergulhador
- **Comunicação:** Jornalista, Apresentador, Podcaster, Fotojornalista, Documentarista

### 2.3 INSTRUMENTOS MUSICAIS *(200+ items)*
```
area: MUSICA | type: INSTRUMENT
```
Famílias:
- **Cordas:** Violino, Viola, Violoncelo, Contrabaixo, Guitarra, Violão, Alaúde, Harpa, Bandolim, Kora, Sitar, Erhu, Oud
- **Sopros Madeira:** Flauta, Oboé, Clarinete, Fagote, Saxofone, Flautim, Corne Inglês
- **Sopros Metal:** Trompete, Trombone, Trompa, Tuba, Cornet, Eufônio, Trompete de Piston
- **Percussão:** Bateria, Timpani, Xilofone, Marimba, Vibrafone, Glockenspiel, Pandeiro, Djembe, Taiko
- **Teclados:** Piano, Órgão, Cravo, Clavicórdio, Acordeão, Harmônica, Sintetizador
- **Eletrônicos:** Theremin, Keytar, Controlador MIDI, Samplers, Vocoder
- **Étnicos:** Didgeridoo, Balafon, Gayageum, Sitar, Tabla, Cavaquinho, Berimbau, Cuíca

### 2.4 MOVIMENTOS ARTÍSTICOS E INTELECTUAIS *(150+ items)*
```
area: HISTORIA | type: MOVEMENT
```
- **Arte:** Renascimento, Barroco, Rococó, Neoclassicismo, Romantismo, Realismo, Impressionismo, Pós-impressionismo, Expressionismo, Cubismo, Futurismo, Dadaísmo, Surrealismo, Abstracionismo, Pop Art, Minimalismo, Arte Conceitual, Street Art
- **Música:** Barroco Musical, Classicismo, Romantismo, Impressionismo Musical, Serialismo, Minimalismo, Jazz, Blues, Rock, Punk, Hip-Hop, Eletrônica, Música Concreta
- **Literatura:** Classicismo, Barroco Literário, Romantismo Literário, Realismo, Naturalismo, Modernismo, Surrealismo Literário, Beat Generation, Existencialismo, Pós-modernismo
- **Filosofia:** Pré-socráticos, Platonismo, Aristotelismo, Estoicismo, Epicurismo, Escolástica, Humanismo, Iluminismo, Idealismo, Materialismo, Existencialismo, Fenomenologia, Estruturalismo, Pós-estruturalismo, Pragmatismo
- **Política:** Liberalismo, Conservadorismo, Socialismo, Anarquismo, Feminismo, Ecologismo, Libertarianismo

### 2.5 UNIDADES DE MEDIDA E SISTEMAS *(100+ items)*
```
area: CIENCIAS | type: CONCEPT | metadata: { category: "unit", system: "SI" }
```
Sistemas:
- **SI (Sistema Internacional):** metro, kg, segundo, ampere, kelvin, mol, candela + derivadas
- **Imperial:** polegada, pé, jarda, milha, libra, galão, Fahrenheit
- **Náutico:** nó, milha náutica, braça
- **Astronômico:** unidade astronômica, ano-luz, parsec, magnitude estelar
- **Computação:** bit, byte, kilobyte→yottabyte, baud, hertz
- **Tempo:** segundo, minuto, hora, dia, semana, mês, ano, década, século, milênio, éon
- **Ângulos:** grau, radiano, minuto de arco, segundo de arco
- **Energia:** joule, caloria, BTU, watt-hora, eletronvolt, quilowatt-hora
- **Pressão:** pascal, bar, atm, mmHg, psi
- **Temperatura:** kelvin, celsius, fahrenheit, rankine

### 2.6 ERAS E LINHAS DO TEMPO *(200+ items)*
```
area: HISTORIA | type: ERA
```
Divisões:
- **Geológicas:** Hadaico, Arqueano, Proterozoico, Fanerozóico → Paleozoico, Mesozoico, Cenozoico
- **Pré-história:** Paleolítico, Mesolítico, Neolítico, Idade do Cobre, Idade do Bronze, Idade do Ferro
- **Antiga:** Antiguidade Oriental, Grécia Antiga, Roma Antiga, Civilizações da Mesopotâmia
- **Medieval:** Alta, Plena e Baixa Idade Média, Bizâncio, Califados
- **Moderna:** Renascimento, Expansão Marítima, Reforma Protestante, Iluminismo, Revoluções
- **Contemporânea:** Industrial, Belle Époque, Guerras Mundiais, Guerra Fria, Era Digital, Antropoceno
- **Por Região:** linha do tempo da China, Índia, África, Américas Pré-colombianas, Oriente Médio

### 2.7 FORMAS GEOMÉTRICAS E MATEMÁTICAS *(100+ items)*
```
area: GEOMETRIA | type: CONCEPT
```
- **Planas:** triângulo (todos os tipos), quadrilátero, polígono regular, círculo, elipse, parábola, hipérbole
- **Sólidos:** tetraedro, cubo, octaedro, dodecaedro, icosaedro, esfera, cilindro, cone, toroide
- **Fractais:** Conjunto de Mandelbrot, Triângulo de Sierpinski, Floco de Koch, Curva de Dragon
- **Curvas:** espiral de Áureo, espiral logarítmica, lemniscata, espiral de Fibonacci
- **Teoremas:** Pitágoras, Euler, Fermat, Riemann, Gödel, Banach-Tarski, Quatro Cores
- **Sequências:** Fibonacci, Primos, Números Perfeitos, Números de Catalan, Pi, e, Phi

### 2.8 LÍNGUAS DO MUNDO *(200+ items)*
```
area: HISTORIA | type: CONCEPT | metadata: { category: "language", family: "...", speakers: N }
```
Famílias:
- Indo-europeia: Português, Espanhol, Francês, Italiano, Inglês, Alemão, Russo, Hindi, Bengali, Persa
- Sino-tibetana: Mandarim, Wu, Cantonês, Tibetano, Birmanês
- Afro-asiática: Árabe, Hebraico, Amárico, Hauçá
- Niger-Congo: Suaíli, Iorubá, Igbo, Zulu
- Dravidiana: Tâmil, Telugu, Canarês, Malaiala
- Austro-asiática, Austronésia, Turcas, Mongólica, Japonesa, Coreana
- Línguas mortas: Latim, Sânscrito, Grego Antigo, Sumério, Acadiano, Egípcio Antigo
- Línguas artificiais: Esperanto, Klingon, Alto Valiriano, Quenya

### 2.9 BIOMAS E ECOSSISTEMAS *(80+ items)*
```
area: NATUREZA | type: PLACE | metadata: { category: "biome" }
```
- Florestas: Tropical, Temperada, Boreal (Taiga), Nublada, Mediterrânea, Galeria
- Savanas: African Savanna, Cerrado Brasileiro, Llanos Venezuelanos
- Desertos: Quente (Saara), Frio (Gobi, Atacama), Costeiro, Ártico
- Pastagens: Pradaria, Pampa, Estepe, Puszta
- Aquáticos: Oceano Abissal, Zona Nerítica, Recifes de Coral, Manguezal, Estuário, Pântano, Tundra Ártica
- Montanhas: Altas, Subalpino, Alpino, Nival

### 2.10 MITOLOGIAS DO MUNDO *(150+ items)*
```
area: HISTORIA | type: CONCEPT | metadata: { category: "mythology" }
```
- **Grega:** Zeus, Apolo, Atena, Hermes, Afrodite, Ártemis, Hefesto, Ares, Poseidon, Deméter, Hades, Hera
- **Romana:** Júpiter, Marte, Vênus, Mercúrio, Diana, Minerva, Juno, Netuno, Plutão
- **Nórdica:** Odin, Thor, Loki, Freya, Baldur, Tyr, Hel, Fenrir, Jormungandr, Yggdrasil
- **Egípcia:** Rá, Osíris, Ísis, Hórus, Anúbis, Thoth, Set, Hathor, Bastet, Amun
- **Mesopotâmica:** Enlil, Marduk, Ishtar, Gilgamesh, Enkidu, Tiamat
- **Hindu:** Brahma, Vishnu, Shiva, Lakshmi, Saraswati, Ganesh, Krishna, Rama, Durga, Kali
- **Celta:** Dagda, Morrigan, Lugh, Brigid, Cernunnos, Tuatha Dé Danann
- **Asteca:** Quetzalcoatl, Huitzilopochtli, Tlaloc, Coatlicue, Tezcatlipoca
- **Inca:** Inti, Pachamama, Supay, Viracocha, Mama Quilla
- **Africana:** Anansi, Ogun, Shango, Yemanjá, Oxum, Exu, Orixás do Candomblé
- **Japonesa:** Amaterasu, Susanoo, Tsukuyomi, Inari, Izanagi, Izanami, Kami, Yokai

### 2.11 PAÍSES E NAÇÕES *(195 items)*
```
area: HISTORIA | type: PLACE | metadata: { category: "country", continent: "...", capital: "...", population: N }
```
- Todos os 195 países reconhecidos pela ONU
- Metadados: capital, continente, população, IDH, língua oficial, moeda, área
- Imagem: bandeira via Wikipedia

### 2.12 RELIGIÕES E FILOSOFIAS *(50+ items)*
```
area: FILOSOFIA | type: CONCEPT | metadata: { category: "religion" }
```
- Monoteístas: Cristianismo, Islão, Judaísmo, Bahaísmo, Zoroastrismo, Sikhismo
- Politeístas: Hinduísmo, Xintoísmo, Religiões Greco-romanas, Nórdicas, Celtas, Astecas
- Não-teístas: Budismo, Jainismo, Taoísmo, Confucionismo
- Filosóficas: Estoicismo, Epicurismo, Pitagorismo, Neoplatonismo, Hermetismo
- Modernas: Espiritismo, Espiritualidade Nova Era, Wicca, Paganismo Contemporâneo
- Ateísmo, Agnosticismo, Humanismo Secular

### 2.13 TÉCNICAS E PROCESSOS ARTÍSTICOS *(100+ items)*
```
area: ARTES | type: CONCEPT | metadata: { category: "technique" }
```
- **Pintura:** Óleo, Aquarela, Acrílico, Têmpera, Fresco, Encáustica, Pastel, Guache, Nanquim
- **Escultura:** Mármore, Bronze (fundição a cera perdida), Argila, Madeira, Pedra, Instalação
- **Gravura:** Água-forte, Xilogravura, Litografia, Serigrafia, Linogravura, Mezzotinto
- **Fotografia:** Daguerreótipo, Analógica (P&B, Color), Digital, Polaroid, Pinhole, Drone
- **Têxtil:** Tecelagem, Bordado, Tapeçaria, Crochê, Tricô, Batik, Tie-dye, Shibori
- **Cerâmica:** Raku, Porcelana, Grés, Faiança, Terracota, Cozedura em Anagama
- **Joalheria:** Fundição, Granulação, Filigrana, Esmaltação, Cravação de Pedras, Forjamento
- **Arquitetura:** Arco Romano, Abóbada Gótica, Cúpula, Cantilever, Estrutura de Aço, Paramétrica

### 2.14 ESTILOS ARQUITETÔNICOS *(60+ items)*
```
area: ARQUITETURA | type: MOVEMENT
```
- Pré-histórico (Megalítico), Mesopotâmico, Egípcio, Grego (Dórico/Jônico/Coríntio), Romano
- Bizantino, Islâmico, Românico, Gótico, Renascentista, Barroco, Rococó
- Neoclássico, Historicismo, Art Nouveau, Art Déco
- Modernismo (Bauhaus, Le Corbusier, Mies van der Rohe), Brutalismo, Metabolismo
- Pós-modernismo, Desconstrutivismo, High-Tech, Paramétrico, Biofílico

### 2.15 FÓRMULAS E LEIS DA FÍSICA *(80+ items)*
```
area: CIENCIAS | type: CONCEPT | metadata: { category: "physics-law", formula: "..." }
```
- Mecânica Clássica: F=ma, E=mgh, E=½mv², p=mv, Lei de Hooke
- Termodinâmica: ΔU=Q-W, S≥0, PV=nRT, η=1-Tc/Th
- Eletromagnetismo: F=qE, V=IR, P=VI, Leis de Maxwell, F=qv×B
- Óptica: c=λf, n=c/v, Lei de Snell, Difração, Interferência
- Relatividade: E=mc², γ=1/√(1-v²/c²), Dilatação do Tempo
- Quântica: E=hf, Δx·Δp≥ħ/2, ψ(x,t), Equação de Schrödinger
- Astronomia: F=Gm₁m₂/r², v=√(GM/r), Lei de Hubble: v=H₀d

---

## PARTE 3 — ESTRUTURA DO ATLAS (COMO O PRINT NOTION)

Baseado no screenshot Notion compartilhado, o Atlas Home deve ter:

### 3.1 Seção: DIVISÕES DO CONHECIMENTO
Tabs: Todas · Cosmos · Natureza · Ciências · História · Filosofia · Tecnologia  
Vista: galeria horizontal com grupos por tab

### 3.2 Seção: ERAS E MOVIMENTOS
Tabs: Todas · Pré-história · Antiga · Medieval · Moderna · Contemporânea  
Tabs extras: Arte · Música · Literatura · Ciência · Política  
Vista: linha do tempo visual + cards

### 3.3 Seção: PESSOAS
Tabs: Todos · Compositores · Pintores · Escritores · Cientistas · Filósofos · Arquitetos · Matemáticos · Físicos · Botânicos · Arqueólogos  
Vista: galeria de retratos com nome + ano de nascimento

### 3.4 Seção: OBRAS
Tabs: Todas · Livros · Composições · Pinturas · Esculturas · Filmes · Arquitetura  
Vista: galeria com imagem e metadados

### 3.5 Seção: OBJETOS E INSTRUMENTOS
Tabs: Todos · Instrumentos Musicais · Ferramentas · Objetos Rituais · Utensílios · Armas Históricas  
Vista: galeria densa

### 3.6 Seção: REFERÊNCIAS RÁPIDAS (Tabelas)
- Tabela Periódica (link para `/atlas/tabela-periodica`)
- Unidades SI
- Constantes Físicas
- Sequências Matemáticas
- Línguas do Mundo (top 50)
- Países por Continente

---

## PARTE 4 — TABELA PERIÓDICA INTERATIVA

### 4.1 Página `/atlas/tabela-periodica`
- [ ] Grade visual fiel à tabela real (18 grupos × 7 períodos)
- [ ] Lantanídeos e actinídeos em linha separada abaixo
- [ ] Cada elemento: célula com símbolo (grande), nº atômico, nome, massa atômica
- [ ] Cores por categoria: metais alcalinos, alcalinos terrosos, lantanídeos, actinídeos, metais de transição, pós-transição, metaloides, não-metais, halogênios, gases nobres
- [ ] Hover: preview expandido com mais info
- [ ] Clique: drawer/modal com:
  - Foto do elemento em estado natural
  - Modelo 3D (embed Sketchfab)
  - História da descoberta
  - Usos práticos no cotidiano
  - Propriedades físicas e químicas
  - Relações com outros elementos
  - Curiosidades

### 4.2 Filtros interativos
- [ ] Por estado físico à temperatura ambiente (sólido/líquido/gasoso)
- [ ] Por época de descoberta (slider de anos)
- [ ] Por aplicação (eletrônica, medicina, construção...)
- [ ] Por origem (natural/sintético)
- [ ] Busca por nome ou símbolo

---

## PARTE 5 — CARD REDESIGN *(task.main.md)*

- [ ] Bordas arredondadas: `border-radius: 6px` em todos os cards
- [ ] Fundo menos apagado: `background-color: opacity 0.6→0.85`
- [ ] Sombra leve ao hover: `box-shadow: 0 4px 16px rgba(0,0,0,0.12)`
- [ ] Imagem com transição mais suave no hover
- [ ] Texto nunca truncado sem ellipsis visível
- [ ] Linha de meta sempre presente (tipo + área + ano se houver)
- [ ] Tag badges abaixo do título com max 3 tags visíveis

---

## PARTE 6 — SEED ADICIONAL A EXECUTAR

Ordem de prioridade para adicionar ao banco:

| # | Tabela | Items Est. | Area | Type |
|---|--------|-----------|------|------|
| 1 | Profissões e Ofícios | ~120 | PESSOAS | CONCEPT |
| 2 | Instrumentos Musicais | ~120 | MUSICA | INSTRUMENT |
| 3 | Movimentos Artísticos | ~80 | HISTORIA | MOVEMENT |
| 4 | Eras Históricas | ~60 | HISTORIA | ERA |
| 5 | Países (todos 195) | 195 | HISTORIA | PLACE |
| 6 | Unidades de Medida | ~80 | CIENCIAS | CONCEPT |
| 7 | Línguas do Mundo | ~100 | HISTORIA | CONCEPT |
| 8 | Mitologias | ~100 | HISTORIA | CONCEPT |
| 9 | Técnicas Artísticas | ~80 | ARTES | CONCEPT |
| 10 | Biomas | ~60 | NATUREZA | PLACE |
| 11 | Estilos Arquitetônicos | ~50 | ARQUITETURA | MOVEMENT |
| 12 | Leis da Física | ~60 | CIENCIAS | CONCEPT |
| 13 | Fórmulas Matemáticas | ~50 | CIENCIAS | CONCEPT |
| 14 | Religiões e Filosofias | ~50 | FILOSOFIA | CONCEPT |
| 15 | Mitologia por Panteão | ~80 | HISTORIA | CONCEPT |

**Total estimado: ~1.300 novos items** (além dos ~435 já existentes)

---

## PARTE 7 — ATELIER DE INTERFACES

- [x] Página `/atelier` criada com 24 direções visuais
- [x] Documento `/docs/design-plan` com diagnóstico e plano de execução
- [ ] Implementar design-token.ts para aplicar estilo escolhido
- [ ] Criar script `npm run apply-style [nome-do-estilo]` que aplica as variáveis CSS
- [ ] Revisar cada página com o estilo escolhido

---

## STATUS GERAL

| Seção | Status |
|-------|--------|
| Seed inicial (435 items) | ✅ Criado — executar em /atlas/seed |
| Tabela Periódica (118 elementos) | ✅ No seed — falta página interativa |
| AtlasHomeView (seções agrupadas) | ✅ Implementado |
| WikiImage (fotos automáticas) | ✅ Implementado |
| EntryCard (24s) | ✅ Implementado |
| ProfileCard (carteirinha) | ✅ Implementado |
| Atelier (24 interfaces) | ✅ Implementado |
| Tabela Periódica Interativa | ⏳ Planejado |
| Profissões e Ofícios (seed) | ⏳ Planejado |
| Instrumentos (seed) | ⏳ Planejado |
| Movimentos e Eras (seed) | ⏳ Planejado |
| Países (seed) | ⏳ Planejado |
| Unidades de Medida (seed) | ⏳ Planejado |
| Card redesign (bordas, fundo) | ⏳ A fazer |
| Cultura como portal de notícias | ⏳ A fazer |
| Academia reformulada | ⏳ A fazer |

---

*Atualizar este documento a cada sessão. Marcar [x] quando concluído.*
