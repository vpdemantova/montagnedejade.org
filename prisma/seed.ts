import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing seed data (leave user data untouched by checking title prefix)
  // We use upsert by title to be idempotent

  const items: Array<{
    title: string
    type: string
    area: string
    coverImage?: string
    metadata?: Record<string, unknown>
    tags: string[]
    content?: string
  }> = [

    // ══════════════════════════════════════════════════════
    // NATUREZA — Animais
    // ══════════════════════════════════════════════════════
    {
      title: "Panthera leo",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/640px-Lion_waiting_in_Namibia.jpg",
      metadata: { location: "África Subsaariana", period: { start: -6000000, end: 2026 } },
      tags: ["Animais", "Natureza", "Mamíferos", "Predadores"],
      content: "O leão (Panthera leo) é uma espécie de felino grande da família Felidae. É o segundo maior felino vivo depois do tigre.",
    },
    {
      title: "Águia Harpia",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Harpia_harpyja_-_Houston_Zoo-8a.jpg/640px-Harpia_harpyja_-_Houston_Zoo-8a.jpg",
      metadata: { location: "Amazônia", period: { start: -1000000, end: 2026 } },
      tags: ["Animais", "Natureza", "Aves", "Predadores"],
      content: "A harpia (Harpia harpyja) é uma das maiores e mais poderosas águias do mundo, habitante das florestas tropicais das Américas.",
    },
    {
      title: "Octopus vulgaris",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Octopus2.jpg/640px-Octopus2.jpg",
      metadata: { location: "Oceanos Mundiais" },
      tags: ["Animais", "Natureza", "Oceanos", "Moluscos"],
      content: "O polvo-comum (Octopus vulgaris) é um molusco cefalópode altamente inteligente, capaz de alterar cor e textura da pele instantaneamente.",
    },

    // ══════════════════════════════════════════════════════
    // NATUREZA — Plantas e Biomas
    // ══════════════════════════════════════════════════════
    {
      title: "Floresta Amazônica",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/640px-24701-nature-natural-beauty.jpg",
      metadata: { location: "América do Sul", period: { start: -55000000, end: 2026 } },
      tags: ["Biomas", "Natureza", "Plantas", "Amazônia"],
      content: "A maior floresta tropical do mundo, cobrindo 5,5 milhões de km². Abriga 10% de todas as espécies da Terra.",
    },
    {
      title: "Sequoia sempervirens",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Sequoia_National_Park_Tunnel_Log.jpg/640px-Sequoia_National_Park_Tunnel_Log.jpg",
      metadata: { location: "Califórnia, EUA", period: { start: -20000000, end: 2026 } },
      tags: ["Plantas", "Natureza", "Árvores"],
      content: "A sequoia-vermelha é a árvore mais alta do mundo, podendo atingir mais de 115 metros de altura e viver mais de 2.000 anos.",
    },
    {
      title: "Recife de Coral",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Coral_reef_at_palmyra.jpg/640px-Coral_reef_at_palmyra.jpg",
      metadata: { location: "Oceanos Tropicais" },
      tags: ["Oceanos", "Natureza", "Biomas", "Ecossistemas"],
      content: "Os recifes de coral são chamados de 'florestas tropicais do mar', abrigando 25% de toda a vida marinha apesar de cobrir menos de 1% do fundo oceânico.",
    },

    // ══════════════════════════════════════════════════════
    // HUMANIDADE — Civilizações
    // ══════════════════════════════════════════════════════
    {
      title: "Mesopotâmia",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Ziggurat_of_Ur.jpg/640px-Ziggurat_of_Ur.jpg",
      metadata: { location: "Iraque atual", period: { start: -3500, end: -500 } },
      tags: ["Civilizações", "Humanidade", "Eras", "História"],
      content: "Berço da civilização, entre o Tigre e o Eufrates. Criadores da escrita cuneiforme, das primeiras leis (Código de Hammurabi) e das primeiras cidades.",
    },
    {
      title: "Império Romano",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/640px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg",
      metadata: { location: "Europa, África do Norte, Oriente Médio", period: { start: -27, end: 476 } },
      tags: ["Civilizações", "Humanidade", "História", "Europa"],
      content: "Um dos maiores impérios da história, que moldou a civilização ocidental com seu direito, arquitetura, língua e cultura.",
    },
    {
      title: "Civilização Maia",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/640px-Chichen_Itza_3.jpg",
      metadata: { location: "América Central", period: { start: -2000, end: 1500 } },
      tags: ["Civilizações", "Humanidade", "Américas", "Astronomia"],
      content: "Civilização mesoamericana conhecida pela escrita hieroglífica, calendário preciso, astronomia avançada e monumentais pirâmides.",
    },

    // ══════════════════════════════════════════════════════
    // CIÊNCIAS — Astronomia
    // ══════════════════════════════════════════════════════
    {
      title: "Via Láctea",
      type: "CONCEPT",
      area: "ACADEMIA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/ESO-VLT-Laser-phot-0a-99.jpg/640px-ESO-VLT-Laser-phot-0a-99.jpg",
      metadata: { location: "Galáxia Local" },
      tags: ["Astronomia", "Ciências", "Cosmos"],
      content: "Nossa galáxia espiral, com diâmetro de 100.000 anos-luz, contendo entre 100 e 400 bilhões de estrelas.",
    },
    {
      title: "Buracos Negros",
      type: "CONCEPT",
      area: "ACADEMIA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/640px-Black_hole_-_Messier_87_crop_max_res.jpg",
      metadata: {},
      tags: ["Astronomia", "Ciências", "Física", "Relatividade"],
      content: "Regiões do espaço-tempo onde a gravidade é tão intensa que nada, nem mesmo a luz, pode escapar. Previstos por Einstein em 1915.",
    },
    {
      title: "Nebulosa de Órion",
      type: "CONCEPT",
      area: "ACADEMIA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg/640px-Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg",
      metadata: { location: "Constelação de Órion", period: { start: -3000000, end: 2026 } },
      tags: ["Astronomia", "Ciências", "Nebulosas", "Cosmos"],
      content: "Nebulosa de formação estelar a 1.344 anos-luz da Terra. Uma das nebulosas mais estudadas e fotografadas do céu noturno.",
    },

    // ══════════════════════════════════════════════════════
    // CIÊNCIAS — Física e Descobertas
    // ══════════════════════════════════════════════════════
    {
      title: "Teoria da Relatividade",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1905, end: 1915 } },
      tags: ["Física", "Ciências", "Descobertas", "Einstein"],
      content: "A teoria especial (1905) e geral (1915) de Einstein revolucionaram nossa compreensão do espaço, tempo, gravidade e energia.",
    },
    {
      title: "Mecânica Quântica",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1900, end: 1930 } },
      tags: ["Física", "Ciências", "Quantum"],
      content: "Ramo da física que descreve o comportamento da matéria e energia em escala atômica e subatômica. Fundamento da tecnologia moderna.",
    },
    {
      title: "DNA — Estrutura Dupla Hélice",
      type: "CONCEPT",
      area: "ACADEMIA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png/640px-DNA_Structure%2BKey%2BLabelled.pn_NoBB.png",
      metadata: { period: { start: 1953, end: 1953 } },
      tags: ["Biologia", "Ciências", "Descobertas", "Genética"],
      content: "Em 1953, Watson e Crick, com dados de Rosalind Franklin, descreveram a estrutura da dupla hélice do DNA, revolucionando a biologia.",
    },

    // ══════════════════════════════════════════════════════
    // ARTES — Música
    // ══════════════════════════════════════════════════════
    {
      title: "Sinfonia nº 9 em Ré menor, Op. 125",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Beethoven_Deckblatt_9._Sinfonie.jpg/640px-Beethoven_Deckblatt_9._Sinfonie.jpg",
      metadata: { period: { start: 1824, end: 1824 }, location: "Viena" },
      tags: ["Música", "Artes", "Sinfonia", "Beethoven", "Barroco"],
      content: "A nona sinfonia de Beethoven, composta quando já estava completamente surdo. O 'Hino à Alegria' do quarto movimento tornou-se símbolo da humanidade.",
    },
    {
      title: "As Quatro Estações",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Vivaldi_-_Portrait.jpg/640px-Vivaldi_-_Portrait.jpg",
      metadata: { period: { start: 1723, end: 1725 }, location: "Veneza" },
      tags: ["Música", "Artes", "Concerto", "Vivaldi", "Barroco"],
      content: "Grupo de quatro concertos para violino de Antonio Vivaldi, compostos por volta de 1723. Uma das obras barrocas mais conhecidas do mundo.",
    },
    {
      title: "Mass in B minor",
      type: "WORK",
      area: "ARTES",
      metadata: { period: { start: 1748, end: 1749 }, location: "Leipzig" },
      tags: ["Música", "Artes", "Coral", "Bach", "Barroco"],
      content: "A Missa em Si menor de Johann Sebastian Bach é considerada uma das maiores conquistas da música vocal ocidental.",
    },

    // ══════════════════════════════════════════════════════
    // ARTES — Pintura e Escultura
    // ══════════════════════════════════════════════════════
    {
      title: "A Criação de Adão",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/640px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
      metadata: { period: { start: 1508, end: 1512 }, location: "Vaticano" },
      tags: ["Pintura", "Artes", "Renascimento", "Michelangelo", "Obras"],
      content: "Afresco pintado por Michelangelo na Capela Sistina entre 1508 e 1512. Uma das obras de arte mais reconhecidas do mundo.",
    },
    {
      title: "A Noite Estrelada",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
      metadata: { period: { start: 1889, end: 1889 }, location: "Saint-Rémy-de-Provence" },
      tags: ["Pintura", "Artes", "Pós-Impressionismo", "Van Gogh", "Obras"],
      content: "Óleo sobre tela pintado em junho de 1889 por Vincent van Gogh. Representa a vista de seu quarto no asilo de Saint-Paul-de-Mausole.",
    },
    {
      title: "Davi",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Michelangelo%27s_David_-_right_view_2.jpg/640px-Michelangelo%27s_David_-_right_view_2.jpg",
      metadata: { period: { start: 1501, end: 1504 }, location: "Florença" },
      tags: ["Escultura", "Artes", "Renascimento", "Michelangelo", "Obras"],
      content: "Escultura em mármore de Michelangelo representando o herói bíblico Davi. Considerada um ícone da arte renascentista.",
    },

    // ══════════════════════════════════════════════════════
    // TÉCNICA — Invenções
    // ══════════════════════════════════════════════════════
    {
      title: "Imprensa de Gutenberg",
      type: "OBJECT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/640px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg",
      metadata: { location: "Mainz, Alemanha", period: { start: 1440, end: 1450 } },
      tags: ["Invenções", "Técnica", "Tecnologias", "História"],
      content: "A prensa tipográfica de Johannes Gutenberg (c. 1450) revolucionou a disseminação do conhecimento, tornando os livros acessíveis.",
    },
    {
      title: "Máquina a Vapor",
      type: "OBJECT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Boulton_and_Watt_steam_engine_-_Thinktank%2C_Birmingham.jpg/640px-Boulton_and_Watt_steam_engine_-_Thinktank%2C_Birmingham.jpg",
      metadata: { location: "Reino Unido", period: { start: 1769, end: 1800 } },
      tags: ["Invenções", "Técnica", "Revolução Industrial", "Máquinas"],
      content: "James Watt aperfeiçoou a máquina a vapor de Newcomen (1769), motor da Revolução Industrial que transformou a produção e o transporte.",
    },
    {
      title: "Internet",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1969, end: 2026 } },
      tags: ["Tecnologias", "Técnica", "Computação", "Invenções"],
      content: "Rede global de computadores iniciada com a ARPANET em 1969. A maior rede de comunicação já criada, conectando bilhões de pessoas.",
    },

    // ══════════════════════════════════════════════════════
    // HISTÓRIA — Eventos e Eras
    // ══════════════════════════════════════════════════════
    {
      title: "Renascimento",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/640px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
      metadata: { location: "Europa", period: { start: 1300, end: 1600 } },
      tags: ["Eras", "História", "Arte", "Humanismo", "Revolução Cultural"],
      content: "Movimento cultural e intelectual europeu (séc. XIV–XVII) que marcou a transição da Idade Média para a Modernidade, com foco no humanismo e na razão.",
    },
    {
      title: "Revolução Francesa",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/640px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg",
      metadata: { location: "França", period: { start: 1789, end: 1799 } },
      tags: ["Revoluções", "História", "Eventos", "França"],
      content: "Período de transformação política e social radical na França (1789–1799) que aboliu a monarquia absolutista e proclamou os ideais de Liberdade, Igualdade, Fraternidade.",
    },
    {
      title: "Segunda Guerra Mundial",
      type: "CONCEPT",
      area: "ATLAS",
      metadata: { location: "Europa, Ásia, Oceania, Américas, África", period: { start: 1939, end: 1945 } },
      tags: ["Batalhas", "História", "Eventos", "Guerras"],
      content: "O maior conflito armado da história humana, envolvendo 30 países e causando entre 70 e 85 milhões de mortes.",
    },

    // ══════════════════════════════════════════════════════
    // GEOGRAFIA — Lugares
    // ══════════════════════════════════════════════════════
    {
      title: "Monte Everest",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg/640px-Everest_North_Face_toward_Base_Camp_Tibet_Luca_Galuzzi_2006.jpg",
      metadata: { location: "Nepal / Tibet", period: { start: -50000000, end: 2026 } },
      tags: ["Montanhas", "Geografia", "Paisagens", "Sítios UNESCO"],
      content: "O ponto mais alto da Terra, a 8.848,86 metros acima do nível do mar. Na fronteira entre Nepal e China, sagrado para budistas e hindus.",
    },
    {
      title: "Rio Amazonas",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Amazon_river_from_space.jpg/640px-Amazon_river_from_space.jpg",
      metadata: { location: "América do Sul", period: { start: -11000000, end: 2026 } },
      tags: ["Rios", "Geografia", "Biomas", "Amazônia"],
      content: "O maior rio do mundo em volume de descarga. Drena 40% da América do Sul e abriga a maior biodiversidade aquática do planeta.",
    },
    {
      title: "Grandes Muralha da China",
      type: "OBJECT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/640px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
      metadata: { location: "China", period: { start: -700, end: 1644 } },
      tags: ["Monumentos", "Geografia", "China", "Sítios UNESCO", "Estruturas"],
      content: "Série de muralhas construídas ao longo de mais de 2.000 anos para proteger os estados chineses das invasões. UNESCO 1987.",
    },

    // ══════════════════════════════════════════════════════
    // PESSOAS — Cientistas e Filósofos
    // ══════════════════════════════════════════════════════
    {
      title: "Marie Curie",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/640px-Marie_Curie_c1920.jpg",
      metadata: { period: { start: 1867, end: 1934 }, location: "Polônia / França" },
      tags: ["Cientistas", "Pessoas", "Físicos", "Química", "Radioatividade"],
      content: "Física e química polonesa-francesa, primeira mulher a ganhar o Nobel e única a ganhar em duas ciências diferentes (Física 1903, Química 1911). Descobriu o polônio e o rádio.",
    },
    {
      title: "Leonardo da Vinci",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/640px-Leonardo_self.jpg",
      metadata: { period: { start: 1452, end: 1519 }, location: "Florença, Itália" },
      tags: ["Pintores", "Pessoas", "Inventores", "Renascimento", "Ciência"],
      content: "Polímata florentino: pintor (Mona Lisa, A Última Ceia), escultor, arquiteto, músico, matemático, engenheiro e anatomista. O homem mais curioso da história.",
    },
    {
      title: "Johann Sebastian Bach",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Johann_Sebastian_Bach.jpg/640px-Johann_Sebastian_Bach.jpg",
      metadata: { period: { start: 1685, end: 1750 }, location: "Eisenach, Alemanha" },
      tags: ["Compositores", "Pessoas", "Músicos", "Barroco", "Música"],
      content: "Compositor e músico alemão do período Barroco. Criador de obras fundamentais como as Variações Goldberg, o Cravo Bem-Temperado e a Missa em Si menor.",
    },
    {
      title: "Nikola Tesla",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/640px-N.Tesla.JPG",
      metadata: { period: { start: 1856, end: 1943 }, location: "Sérvia / EUA" },
      tags: ["Inventores", "Pessoas", "Físicos", "Cientistas", "Eletricidade"],
      content: "Engenheiro elétrico e inventor sérvio-americano. Desenvolveu o sistema de corrente alternada (CA), o motor de indução e contribuiu imensamente para a eletromagnetismo.",
    },
    {
      title: "Aristóteles",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/640px-Aristotle_Altemps_Inv8575.jpg",
      metadata: { period: { start: -384, end: -322 }, location: "Macedônia / Atenas" },
      tags: ["Filósofos", "Pessoas", "Filósofos", "Grécia Antiga", "Lógica"],
      content: "Filósofo grego e polímata. Discípulo de Platão e tutor de Alexandre Magno. Fundou a lógica formal, classificou os seres vivos e teorizou sobre ética, política e poética.",
    },
    {
      title: "Ada Lovelace",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/640px-Ada_Lovelace_portrait.jpg",
      metadata: { period: { start: 1815, end: 1852 }, location: "Londres, Inglaterra" },
      tags: ["Cientistas", "Pessoas", "Matemáticos", "Computação", "Inventores"],
      content: "Matemática britânica, considerada a primeira programadora da história. Trabalhou com Charles Babbage na Máquina Analítica e descreveu o conceito de algoritmo.",
    },

    // ══════════════════════════════════════════════════════
    // CRIAÇÕES — Livros e Obras Literárias
    // ══════════════════════════════════════════════════════
    {
      title: "Dom Quixote",
      type: "READING",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Wikisource-logo.svg/640px-Wikisource-logo.svg.png",
      metadata: { period: { start: 1605, end: 1615 }, location: "Espanha" },
      tags: ["Livros", "Literatura", "Criações", "Artes", "Cervantes"],
      content: "Escrito por Miguel de Cervantes, Dom Quixote (1605/1615) é considerado o primeiro romance moderno e o mais importante da língua espanhola.",
    },
    {
      title: "A Divina Comédia",
      type: "READING",
      area: "ARTES",
      metadata: { period: { start: 1308, end: 1320 }, location: "Florença, Itália" },
      tags: ["Livros", "Literatura", "Criações", "Dante", "Poesia"],
      content: "Poema épico de Dante Alighieri, dividido em Inferno, Purgatório e Paraíso. Um dos maiores textos da literatura mundial e da língua italiana.",
    },
    {
      title: "Os Lusíadas",
      type: "READING",
      area: "ARTES",
      metadata: { period: { start: 1572, end: 1572 }, location: "Portugal" },
      tags: ["Livros", "Literatura", "Criações", "Camões", "Portugal"],
      content: "Epopeia de Luís de Camões (1572), celebrando a viagem de Vasco da Gama à Índia. O maior poema da língua portuguesa.",
    },

    // ══════════════════════════════════════════════════════
    // CRIAÇÕES — Partituras
    // ══════════════════════════════════════════════════════
    {
      title: "Variações Goldberg, BWV 988",
      type: "PARTITURA",
      area: "ARTES",
      metadata: { period: { start: 1741, end: 1741 }, location: "Leipzig" },
      tags: ["Partituras", "Música", "Bach", "Barroco", "Criações"],
      content: "Composição para cravo de J. S. Bach publicada em 1741. Consiste em uma ária e 30 variações, considerada obra-prima da música barroca.",
    },
    {
      title: "Sonata ao Luar, Op. 27 nº 2",
      type: "PARTITURA",
      area: "ARTES",
      metadata: { period: { start: 1801, end: 1801 }, location: "Viena" },
      tags: ["Partituras", "Música", "Beethoven", "Piano", "Criações"],
      content: "Sonata para piano de Ludwig van Beethoven (1801). O primeiro movimento, Adagio sostenuto, é um dos mais reconhecidos da música clássica.",
    },
    {
      title: "Le Sacre du Printemps",
      type: "PARTITURA",
      area: "ARTES",
      metadata: { period: { start: 1913, end: 1913 }, location: "Paris" },
      tags: ["Partituras", "Música", "Stravinsky", "Modernismo", "Criações"],
      content: "Ballet e suite orquestral de Igor Stravinsky (1913). Sua estreia causou um escândalo em Paris. Revolucionou a música do século XX com ritmos complexos e harmonias dissonantes.",
    },

    // ══════════════════════════════════════════════════════
    // PESSOAS — Artistas e Escritores
    // ══════════════════════════════════════════════════════
    {
      title: "Albert Einstein",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/640px-Albert_Einstein_Head.jpg",
      metadata: { period: { start: 1879, end: 1955 }, location: "Alemanha / EUA" },
      tags: ["Cientistas", "Pessoas", "Físicos", "Nobel", "Relatividade"],
      content: "Físico teórico alemão-americano que desenvolveu a teoria da relatividade especial e geral. Nobel de Física em 1921. Símbolo universal do gênio científico.",
    },
    {
      title: "Frida Kahlo",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/640px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg",
      metadata: { period: { start: 1907, end: 1954 }, location: "Cidade do México" },
      tags: ["Pintores", "Pessoas", "Arte Moderna", "México", "Surrealismo"],
      content: "Pintora mexicana conhecida por suas obras autobiográficas e surreais. Ícone cultural e feminista, sua obra combina realismo com fantasia e simbolismo mexicano.",
    },
    {
      title: "William Shakespeare",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/640px-Shakespeare.jpg",
      metadata: { period: { start: 1564, end: 1616 }, location: "Stratford-upon-Avon, Inglaterra" },
      tags: ["Escritores", "Pessoas", "Literatura", "Teatro", "Dramaturgia"],
      content: "Dramaturgo e poeta inglês, amplamente considerado o maior escritor da língua inglesa. Autor de 37 peças, incluindo Hamlet, Romeu e Julieta e Macbeth.",
    },
    {
      title: "Isaac Newton",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/640px-GodfreyKneller-IsaacNewton-1689.jpg",
      metadata: { period: { start: 1643, end: 1727 }, location: "Lincolnshire, Inglaterra" },
      tags: ["Cientistas", "Pessoas", "Físicos", "Matemáticos", "Gravidade"],
      content: "Matemático, físico e astrônomo inglês. Formulou as leis do movimento e da gravitação universal, desenvolveu o cálculo infinitesimal e a teoria das cores.",
    },
    {
      title: "Immanuel Kant",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Immanuel_Kant_%28painted_portrait%29.jpg/640px-Immanuel_Kant_%28painted_portrait%29.jpg",
      metadata: { period: { start: 1724, end: 1804 }, location: "Königsberg, Prússia" },
      tags: ["Filósofos", "Pessoas", "Filosofia", "Ética", "Iluminismo"],
      content: "Filósofo prussiano, figura central do Iluminismo. Autor da Crítica da Razão Pura, que revolucionou a filosofia ocidental com o conceito de imperativo categórico.",
    },
    {
      title: "Simone de Beauvoir",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Simone_de_Beauvoir2.png/640px-Simone_de_Beauvoir2.png",
      metadata: { period: { start: 1908, end: 1986 }, location: "Paris, França" },
      tags: ["Filósofos", "Pessoas", "Escritores", "Feminismo", "Existencialismo"],
      content: "Escritora e filósofa francesa existencialista. O Segundo Sexo (1949) é um dos textos fundadores do feminismo moderno.",
    },

    // ══════════════════════════════════════════════════════
    // CULTURA — Tradições e Manifestações
    // ══════════════════════════════════════════════════════
    {
      title: "Carnaval do Rio de Janeiro",
      type: "CONCEPT",
      area: "CULTURA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Karneval_in_Rio_de_Janeiro.jpg/640px-Karneval_in_Rio_de_Janeiro.jpg",
      metadata: { location: "Rio de Janeiro, Brasil", period: { start: 1723, end: 2026 } },
      tags: ["Festivais", "Cultura", "Brasil", "Música", "Tradições"],
      content: "O maior carnaval do mundo, com desfiles das escolas de samba no Sambódromo. Evento que mistura cultura africana, europeia e indígena em uma celebração única.",
    },
    {
      title: "Flamenco",
      type: "CONCEPT",
      area: "CULTURA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Tablao_de_flamenco_en_Sevilla.jpg/640px-Tablao_de_flamenco_en_Sevilla.jpg",
      metadata: { location: "Andaluzia, Espanha", period: { start: 1800, end: 2026 } },
      tags: ["Danças", "Cultura", "Espanha", "Música", "Tradições"],
      content: "Arte performática do sul da Espanha, envolvendo canto (cante), guitarra (toque) e dança (baile). Reconhecida como Patrimônio Imaterial da Humanidade pela UNESCO.",
    },
    {
      title: "Kabuki",
      type: "CONCEPT",
      area: "CULTURA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kuniyoshi_Utagawa%2C_The_actor_Arashi_Kichisaburo.jpg/640px-Kuniyoshi_Utagawa%2C_The_actor_Arashi_Kichisaburo.jpg",
      metadata: { location: "Japão", period: { start: 1603, end: 2026 } },
      tags: ["Teatro", "Cultura", "Japão", "Tradições", "Artes Cênicas"],
      content: "Forma clássica de teatro japonês desenvolvida no período Edo. Combina dança, música e drama com figurinos elaborados e maquiagem estilizada.",
    },
    {
      title: "Jazz",
      type: "CONCEPT",
      area: "CULTURA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Louis_Armstrong_%28NYWTS%29_2.jpg/640px-Louis_Armstrong_%28NYWTS%29_2.jpg",
      metadata: { location: "Nova Orleans, EUA", period: { start: 1900, end: 2026 } },
      tags: ["Música", "Cultura", "EUA", "Improvisação", "Jazz"],
      content: "Gênero musical nascido em Nova Orleans no início do século XX, resultado da fusão de blues, ragtime e música africana. Berço da música popular americana moderna.",
    },
    {
      title: "Cinema Novo Brasileiro",
      type: "CONCEPT",
      area: "CULTURA",
      metadata: { location: "Brasil", period: { start: 1960, end: 1972 } },
      tags: ["Cinema", "Cultura", "Brasil", "Arte", "Movimentos"],
      content: "Movimento cinematográfico brasileiro dos anos 60. Glauber Rocha, Nelson Pereira dos Santos e outros criaram filmes com estética política e social radical.",
    },
    {
      title: "Bauhaus",
      type: "CONCEPT",
      area: "CULTURA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Bauhaus-Dessau_Hauptgebaeude.jpg/640px-Bauhaus-Dessau_Hauptgebaeude.jpg",
      metadata: { location: "Weimar / Dessau, Alemanha", period: { start: 1919, end: 1933 } },
      tags: ["Design", "Cultura", "Arquitetura", "Arte", "Movimentos"],
      content: "Escola de design, arte e arquitetura fundada por Walter Gropius em 1919. Influenciou toda a arte, arquitetura e design modernos com o princípio 'a forma segue a função'.",
    },
    {
      title: "Renascimento Harlem",
      type: "CONCEPT",
      area: "CULTURA",
      metadata: { location: "Nova York, EUA", period: { start: 1920, end: 1940 } },
      tags: ["Literatura", "Cultura", "EUA", "Música", "Movimentos"],
      content: "Florescimento intelectual e cultural afro-americano centrado no bairro do Harlem nos anos 1920-30. Langston Hughes, Duke Ellington e Zora Neale Hurston.",
    },

    // ══════════════════════════════════════════════════════
    // OBRAS/MONUMENTOS — Maravilhas do Mundo
    // ══════════════════════════════════════════════════════
    {
      title: "Machu Picchu",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/640px-Machu_Picchu%2C_Peru.jpg",
      metadata: { period: { start: 1450, end: 1572 }, location: "Cusco, Peru" },
      tags: ["Monumentos", "Obras", "Peru", "Inca", "Sítios UNESCO"],
      content: "Cidade inca do século XV situada nos Andes peruanos a 2.430 metros de altitude. Uma das Sete Maravilhas do Mundo Moderno. UNESCO 1983.",
    },
    {
      title: "Partenon",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/640px-The_Parthenon_in_Athens.jpg",
      metadata: { period: { start: -447, end: -438 }, location: "Atenas, Grécia" },
      tags: ["Monumentos", "Obras", "Grécia Antiga", "Arquitetura", "Sítios UNESCO"],
      content: "Templo dedicado à deusa Atena, construído na Acrópole de Atenas entre 447 e 432 a.C. Ícone da arquitetura clássica e da civilização ocidental.",
    },
    {
      title: "Sagrada Família",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Sagrada_Familia_01.jpg/640px-Sagrada_Familia_01.jpg",
      metadata: { period: { start: 1882, end: 2030 }, location: "Barcelona, Espanha" },
      tags: ["Monumentos", "Obras", "Espanha", "Arquitetura", "Gaudí"],
      content: "Basílica projetada por Antoni Gaudí em Barcelona. Em construção desde 1882, é uma das obras arquitetônicas mais complexas e visitadas do mundo.",
    },
    {
      title: "Ópera de Sydney",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Opera_House%2C_botanic_gardens_1.jpg/640px-Sydney_Opera_House%2C_botanic_gardens_1.jpg",
      metadata: { period: { start: 1959, end: 1973 }, location: "Sydney, Austrália" },
      tags: ["Monumentos", "Obras", "Austrália", "Arquitetura", "Sítios UNESCO"],
      content: "Centro de artes cênicas projetado por Jørn Utzon. Inaugurado em 1973, é um dos edifícios mais icônicos do século XX. Patrimônio da Humanidade desde 2007.",
    },
    {
      title: "Catedral de Notre-Dame",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Cath%C3%A9drale_Notre-Dame_de_Paris%2C_20_March_2014.jpg/640px-Cath%C3%A9drale_Notre-Dame_de_Paris%2C_20_March_2014.jpg",
      metadata: { period: { start: 1163, end: 1345 }, location: "Paris, França" },
      tags: ["Monumentos", "Obras", "França", "Arquitetura Gótica", "Religião"],
      content: "Catedral gótica no coração de Paris, construída entre os séculos XII e XIV. Exemplo máximo da arquitetura gótica, com famosas vitrais e gárgulas.",
    },
    {
      title: "Angkor Wat",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Angkor_Wat_from_the_air.JPG/640px-Angkor_Wat_from_the_air.JPG",
      metadata: { period: { start: 1113, end: 1150 }, location: "Siem Reap, Camboja" },
      tags: ["Monumentos", "Obras", "Camboja", "Templos", "Sítios UNESCO"],
      content: "O maior complexo religioso do mundo, originalmente construído como templo hindu e depois transformado em budista. Patrimônio da Humanidade.",
    },

    // ══════════════════════════════════════════════════════
    // ACADEMIA — Filosofia e Pensamento
    // ══════════════════════════════════════════════════════
    {
      title: "Estoicismo",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: -300, end: 200 } },
      tags: ["Filosofia", "Academia", "Ética", "Grécia Antiga", "Pensamento"],
      content: "Escola filosófica grega fundada por Zenão de Cítio. Prega o autocontrole, a razão e a indiferença às paixões como caminho para a virtude e a felicidade.",
    },
    {
      title: "Método Científico",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1600, end: 2026 } },
      tags: ["Ciências", "Academia", "Epistemologia", "Pensamento"],
      content: "Conjunto de procedimentos para investigação de fenômenos, obtenção e refinamento de conhecimento. Base da ciência moderna desde Galileu e Bacon.",
    },
    {
      title: "Iluminismo",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { location: "Europa", period: { start: 1685, end: 1815 } },
      tags: ["Filosofia", "Academia", "História", "Revolução", "Pensamento"],
      content: "Movimento intelectual europeu do século XVIII que enfatizou a razão, o individualismo e o ceticismo religioso. Influenciou as revoluções americana e francesa.",
    },
    {
      title: "Evolução por Seleção Natural",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1859, end: 2026 } },
      tags: ["Biologia", "Academia", "Ciências", "Darwin", "Descobertas"],
      content: "Teoria proposta por Charles Darwin em 'A Origem das Espécies' (1859). Explica como os seres vivos se adaptam ao ambiente através de seleção natural ao longo do tempo.",
    },
    {
      title: "Psicanálise",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1890, end: 2026 } },
      tags: ["Psicologia", "Academia", "Freud", "Mente", "Ciências"],
      content: "Método terapêutico e teoria psicológica criado por Sigmund Freud. Explora o inconsciente, os sonhos e os conflitos internos como origem dos comportamentos humanos.",
    },
    {
      title: "Computação e Algoritmos",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1936, end: 2026 } },
      tags: ["Computação", "Academia", "Tecnologia", "Turing", "Matemática"],
      content: "Alan Turing (1936) estabeleceu as bases teóricas da computação com a 'Máquina de Turing'. O conceito de algoritmo é fundamental para toda a ciência da computação.",
    },

    // ══════════════════════════════════════════════════════
    // ARTES — Cinema e Fotografia
    // ══════════════════════════════════════════════════════
    {
      title: "2001: Uma Odisseia no Espaço",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/2001_A_Space_Odyssey_%281968%29.png/640px-2001_A_Space_Odyssey_%281968%29.png",
      metadata: { period: { start: 1968, end: 1968 } },
      tags: ["Cinema", "Artes", "Kubrick", "Ficção Científica", "Obras"],
      content: "Filme de Stanley Kubrick (1968), baseado em Arthur C. Clarke. Revolucionou o cinema com efeitos visuais inovadores e uma narrativa filosófica sobre tecnologia e humanidade.",
    },
    {
      title: "Migrant Mother",
      type: "WORK",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Lange-MigrantMother02.jpg/640px-Lange-MigrantMother02.jpg",
      metadata: { period: { start: 1936, end: 1936 }, location: "Califórnia, EUA" },
      tags: ["Fotografia", "Artes", "Dorothea Lange", "Documentário", "Obras"],
      content: "Fotografia de Dorothea Lange (1936), retratando Florence Owens Thompson durante a Grande Depressão. Uma das fotografias mais reconhecidas e impactantes da história.",
    },
    {
      title: "Cidadão Kane",
      type: "WORK",
      area: "ARTES",
      metadata: { period: { start: 1941, end: 1941 } },
      tags: ["Cinema", "Artes", "Orson Welles", "Narrativa", "Obras"],
      content: "Dirigido e estrelado por Orson Welles (1941), frequentemente eleito o melhor filme de todos os tempos. Revolucionou a linguagem cinematográfica com sua narrativa não-linear.",
    },
    {
      title: "Os Guerrilheiros de Pernambuco",
      type: "WORK",
      area: "ARTES",
      metadata: { period: { start: 1971, end: 1971 }, location: "Brasil" },
      tags: ["Cinema", "Artes", "Brasil", "Glauber Rocha", "Cinema Novo"],
      content: "Referência ao Cinema Novo brasileiro e à produção de Glauber Rocha, que transformou o cinema nacional em expressão política e artística de vanguarda.",
    },

    // ══════════════════════════════════════════════════════
    // ARTES — Literatura Mundial
    // ══════════════════════════════════════════════════════
    {
      title: "Grande Sertão: Veredas",
      type: "READING",
      area: "ARTES",
      metadata: { period: { start: 1956, end: 1956 }, location: "Brasil" },
      tags: ["Livros", "Literatura", "Brasil", "João Guimarães Rosa", "Modernismo"],
      content: "Romance de João Guimarães Rosa (1956). Um dos maiores romances da literatura brasileira, explorando o sertão mineiro com linguagem inventiva e profundidade filosófica.",
    },
    {
      title: "Cem Anos de Solidão",
      type: "READING",
      area: "ARTES",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/100_Years_of_Solitude_%281967%2C_first_edition%29.jpg/640px-100_Years_of_Solitude_%281967%2C_first_edition%29.jpg",
      metadata: { period: { start: 1967, end: 1967 }, location: "Colômbia" },
      tags: ["Livros", "Literatura", "García Márquez", "Realismo Mágico", "Nobel"],
      content: "Romance de Gabriel García Márquez (1967). Obra fundadora do realismo mágico latino-americano, narra a saga da família Buendía por sete gerações em Macondo.",
    },
    {
      title: "Hamlet",
      type: "WORK",
      area: "ARTES",
      metadata: { period: { start: 1600, end: 1601 }, location: "Londres, Inglaterra" },
      tags: ["Teatro", "Literatura", "Shakespeare", "Drama", "Obras"],
      content: "Tragédia de William Shakespeare (c. 1600). A mais longa e considerada a melhor peça do dramaturgo, explorando temas de vingança, moralidade e existência humana.",
    },
    {
      title: "Crime e Castigo",
      type: "READING",
      area: "ARTES",
      metadata: { period: { start: 1866, end: 1866 }, location: "São Petersburgo, Rússia" },
      tags: ["Livros", "Literatura", "Dostoiévski", "Romance Russo", "Psicologia"],
      content: "Romance de Fiódor Dostoiévski (1866). Explora a psicologia do crime através do personagem Raskólnikov, um estudante que comete um assassinato e lida com as consequências.",
    },

    // ══════════════════════════════════════════════════════
    // ACADEMIA — Matemática e Linguagens
    // ══════════════════════════════════════════════════════
    {
      title: "Elementos de Euclides",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: -300, end: -300 } },
      tags: ["Matemática", "Academia", "Geometria", "Grécia Antiga", "Lógica"],
      content: "Obra matemática de Euclides (c. 300 a.C.) em 13 volumes, que sistematizou a geometria plana e espacial. O texto científico mais publicado e usado da história.",
    },
    {
      title: "Cálculo Diferencial e Integral",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1665, end: 1684 } },
      tags: ["Matemática", "Academia", "Newton", "Leibniz", "Ciências"],
      content: "Desenvolvido independentemente por Newton e Leibniz no século XVII. O cálculo é fundamental para física, engenharia, economia e toda ciência moderna.",
    },
    {
      title: "Linguística Estrutural",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1916, end: 2026 } },
      tags: ["Linguística", "Academia", "Saussure", "Linguagem", "Ciências"],
      content: "Fundada por Ferdinand de Saussure com o Curso de Linguística Geral (1916). Estuda a linguagem como sistema estruturado de signos, separando língua (langue) e fala (parole).",
    },

    // ══════════════════════════════════════════════════════
    // ATLAS — Fenômenos e Conceitos Globais
    // ══════════════════════════════════════════════════════
    {
      title: "Mudanças Climáticas",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/AYool_topography_15min.png/640px-AYool_topography_15min.png",
      metadata: { period: { start: 1750, end: 2026 } },
      tags: ["Ciências", "Ambiente", "Clima", "Contemporâneo", "Desafios"],
      content: "Alterações de longo prazo nos padrões climáticos globais, principalmente causadas por emissões humanas de CO₂ desde a Revolução Industrial.",
    },
    {
      title: "Inteligência Artificial",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1950, end: 2026 } },
      tags: ["Tecnologia", "Academia", "Computação", "Futuro", "IA"],
      content: "Campo da ciência da computação dedicado ao desenvolvimento de sistemas capazes de realizar tarefas que normalmente requerem inteligência humana.",
    },
    {
      title: "Globalização",
      type: "CONCEPT",
      area: "ATLAS",
      metadata: { period: { start: 1980, end: 2026 } },
      tags: ["Economia", "Contemporâneo", "Cultura", "Política", "Sociedade"],
      content: "Processo de crescente interdependência econômica, cultural e política entre países. Acelerado pela internet e queda de barreiras comerciais a partir dos anos 1980.",
    },
    {
      title: "Direitos Humanos",
      type: "CONCEPT",
      area: "ATLAS",
      metadata: { period: { start: 1948, end: 2026 } },
      tags: ["Direito", "Humanidade", "ONU", "Política", "Ética"],
      content: "Declaração Universal dos Direitos Humanos adotada pela ONU em 1948, estabelecendo direitos fundamentais inalienáveis de todos os seres humanos.",
    },
    {
      title: "Democracia",
      type: "CONCEPT",
      area: "ATLAS",
      metadata: { period: { start: -500, end: 2026 } },
      tags: ["Política", "Humanidade", "Grécia Antiga", "Filosofia", "Governança"],
      content: "Sistema de governo baseado na soberania popular, nascido na Atenas do século V a.C. com Clístenes e Péricles. Fundamento das repúblicas modernas.",
    },

    // ══════════════════════════════════════════════════════
    // NATUREZA — Geologia e Fenômenos
    // ══════════════════════════════════════════════════════
    {
      title: "Deriva Continental",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: 1912, end: 2026 } },
      tags: ["Geologia", "Academia", "Ciências", "Wegener", "Tectônica"],
      content: "Teoria proposta por Alfred Wegener (1912) e confirmada pela tectônica de placas. Explica como os continentes já foram um único supercontinente chamado Pangeia.",
    },
    {
      title: "Vulcão Vesúvio",
      type: "CONCEPT",
      area: "ATLAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Vs8-050(%23b).jpg/640px-Vs8-050(%23b).jpg",
      metadata: { location: "Nápoles, Itália" },
      tags: ["Geologia", "Natureza", "Vulcões", "Itália", "História"],
      content: "Vulcão ativo próximo a Nápoles, famoso pela erupção de 79 d.C. que destruiu Pompeia e Herculano. O único vulcão ativo da Europa continental.",
    },
    {
      title: "Sistema Solar",
      type: "CONCEPT",
      area: "ACADEMIA",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Planets2013.svg/640px-Planets2013.svg.png",
      metadata: { period: { start: -4600000000, end: 2026 } },
      tags: ["Astronomia", "Academia", "Cosmos", "Planetas", "Ciências"],
      content: "Sistema planetário do Sol, composto por 8 planetas (Mercúrio a Netuno), planetas anões, asteroides, cometas e outras estruturas que orbitam nossa estrela.",
    },
    {
      title: "Pangeia",
      type: "CONCEPT",
      area: "ACADEMIA",
      metadata: { period: { start: -335000000, end: -175000000 } },
      tags: ["Geologia", "Academia", "Tectônica", "Paleontologia", "Continentes"],
      content: "Supercontinente que existiu há 335-175 milhões de anos, quando todas as massas continentais da Terra estavam unidas. Começou a se fragmentar no Triássico.",
    },

    // ══════════════════════════════════════════════════════
    // PESSOAS — Exploradores e Líderes
    // ══════════════════════════════════════════════════════
    {
      title: "Vasco da Gama",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Vasco_da_Gama_-_1524_portrait.jpg/640px-Vasco_da_Gama_-_1524_portrait.jpg",
      metadata: { period: { start: 1460, end: 1524 }, location: "Portugal" },
      tags: ["Exploradores", "Pessoas", "Portugal", "Navegação", "Descobrimentos"],
      content: "Navegador português que completou a primeira viagem marítima da Europa à Índia (1497-1499), abrindo a rota das especiarias e transformando o comércio mundial.",
    },
    {
      title: "Cleópatra VII",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kleopatra-VII.-Altes-Museum-Berlin1.jpg/640px-Kleopatra-VII.-Altes-Museum-Berlin1.jpg",
      metadata: { period: { start: -69, end: -30 }, location: "Alexandria, Egito" },
      tags: ["Líderes", "Pessoas", "Egito Antigo", "Política", "História"],
      content: "Última rainha ativa do Egito ptolemaico. Aliada de Júlio César e Marco Antônio, era fluente em 9 idiomas e conhecida por sua habilidade política e diplomática.",
    },
    {
      title: "Nelson Mandela",
      type: "PERSON",
      area: "PESSOAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nelson_Mandela_in_Johannesburg%2C_Gauteng%2C_on_13_May_1998.jpg/640px-Nelson_Mandela_in_Johannesburg%2C_Gauteng%2C_on_13_May_1998.jpg",
      metadata: { period: { start: 1918, end: 2013 }, location: "África do Sul" },
      tags: ["Líderes", "Pessoas", "África do Sul", "Direitos Humanos", "Nobel"],
      content: "Líder anti-apartheid e primeiro presidente negro da África do Sul (1994-1999). Passou 27 anos preso e tornou-se símbolo mundial da luta por igualdade racial.",
    },

    // ══════════════════════════════════════════════════════
    // STUDIO — Criação e Processo
    // ══════════════════════════════════════════════════════
    {
      title: "Teoria das Cores de Goethe",
      type: "CONCEPT",
      area: "STUDIO",
      metadata: { period: { start: 1810, end: 1810 } },
      tags: ["Design", "Studio", "Cores", "Arte", "Percepção"],
      content: "Johann Wolfgang von Goethe publicou 'Zur Farbenlehre' (1810), uma teoria que aborda as cores pela perspectiva humana e psicológica, influenciando artistas e designers.",
    },
    {
      title: "Grid Sistema Tipográfico",
      type: "CONCEPT",
      area: "STUDIO",
      metadata: { period: { start: 1950, end: 2026 } },
      tags: ["Design", "Studio", "Tipografia", "Grid", "Layout"],
      content: "O sistema de grid suíço (International Style), desenvolvido nos anos 1950, estabeleceu as bases do design gráfico moderno com regras de alinhamento e hierarquia visual.",
    },
    {
      title: "Design Thinking",
      type: "CONCEPT",
      area: "STUDIO",
      metadata: { period: { start: 1969, end: 2026 } },
      tags: ["Design", "Studio", "Metodologia", "Inovação", "Processo"],
      content: "Abordagem de resolução de problemas centrada no ser humano, popularizada pela IDEO nos anos 1990. Combina empatia, ideação e prototipagem iterativa.",
    },
    {
      title: "Movimento Arts & Crafts",
      type: "CONCEPT",
      area: "STUDIO",
      metadata: { location: "Reino Unido", period: { start: 1880, end: 1920 } },
      tags: ["Design", "Studio", "Artesanato", "Arte", "Movimentos"],
      content: "Movimento estético surgido na Inglaterra como reação à industrialização, valorizando o artesanato tradicional e a beleza dos materiais naturais. William Morris foi sua figura central.",
    },

    // ══════════════════════════════════════════════════════
    // CRIAÇÕES — Arquitetura/Estruturas
    // ══════════════════════════════════════════════════════
    {
      title: "Coliseu de Roma",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/640px-Colosseo_2020.jpg",
      metadata: { period: { start: 70, end: 80 }, location: "Roma, Itália" },
      tags: ["Estruturas", "Técnica", "Monumentos", "Roma", "Sítios UNESCO"],
      content: "Anfiteatro elíptico construído no século I d.C. O maior anfiteatro já construído, com capacidade para 50.000 a 80.000 espectadores.",
    },
    {
      title: "Taj Mahal",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/640px-Taj_Mahal_%28Edited%29.jpeg",
      metadata: { period: { start: 1632, end: 1653 }, location: "Agra, Índia" },
      tags: ["Estruturas", "Monumentos", "Obras", "Islão", "Sítios UNESCO"],
      content: "Mausoléu de mármore branco construído pelo imperador mogol Shah Jahan em memória de sua esposa Mumtaz Mahal. Patrimônio da Humanidade desde 1983.",
    },
    {
      title: "Pirâmides de Gizé",
      type: "WORK",
      area: "OBRAS",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/640px-All_Gizah_Pyramids.jpg",
      metadata: { period: { start: -2560, end: -2500 }, location: "Cairo, Egito" },
      tags: ["Estruturas", "Monumentos", "Obras", "Egito Antigo", "Sítios UNESCO"],
      content: "Complexo funerário do Egito Antigo, incluindo a Grande Pirâmide de Quéops — a única das Sete Maravilhas do Mundo Antigo ainda em pé.",
    },
  ]

  console.log(`Semeando ${items.length} itens no Atlas...`)

  for (const item of items) {
    const { tags, metadata, ...fields } = item

    // Check if item already exists
    const existing = await prisma.atlasItem.findFirst({
      where: { title: item.title },
    })

    if (existing) {
      console.log(`  ↳ Já existe: ${item.title}`)
      continue
    }

    await prisma.atlasItem.create({
      data: {
        ...fields,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        status: "ACTIVE",
        hemisphere: "PORTAL",
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    })
    console.log(`  ✓ ${item.title}`)
  }

  console.log("\n✓ Seed completo!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
