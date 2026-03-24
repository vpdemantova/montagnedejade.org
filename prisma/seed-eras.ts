import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ── Item definition ───────────────────────────────────────────────────────────

type SeedItem = {
  title:       string
  type:        string
  area:        string
  coverImage?: string
  metadata?:   Record<string, unknown>
  tags:        string[]
  content:     string
}

type SeedRelation = {
  from: string
  to:   string
  type: string
}

// ── ERAS DA HUMANIDADE ────────────────────────────────────────────────────────

const ERAS: SeedItem[] = [
  {
    title: "Paleolítico",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Lascaux_painting.jpg/640px-Lascaux_painting.jpg",
    metadata: { period: { start: -2500000, end: -10000 }, location: "Global" },
    tags: ["Eras", "Humanidade", "Pré-história", "Caçadores-Coletores"],
    content: "A mais longa era da humanidade, da emergência do Homo habilis até o fim da última glaciação. Caracterizada pela caça, coleta, ferramentas de pedra lascada e arte rupestre. As pinturas de Lascaux e Altamira testemunham uma imaginação simbólica já plena.",
  },
  {
    title: "Neolítico",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/640px-Stonehenge2007_07_30.jpg",
    metadata: { period: { start: -10000, end: -3300 }, location: "Oriente Médio → Global" },
    tags: ["Eras", "Humanidade", "Pré-história", "Agricultura", "Revolução Neolítica"],
    content: "A Revolução Neolítica transformou caçadores-coletores em agricultores sedentários. O cultivo de cereais no Crescente Fértil (c. 10.000 a.C.), a domesticação de animais, a cerâmica e os primeiros aldeamentos inauguraram a civilização. Göbekli Tepe (c. 9600 a.C.) desafia a ideia de que a religião organizada veio depois da agricultura.",
  },
  {
    title: "Era do Bronze",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Nebra_disc.jpg/640px-Nebra_disc.jpg",
    metadata: { period: { start: -3300, end: -1200 }, location: "Eurásia e Mediterrâneo" },
    tags: ["Eras", "Humanidade", "Metalurgia", "Escrita", "Primeiras Cidades"],
    content: "A liga de cobre e estanho revolucionou ferramentas e armas. Neste período florescem Suméria, Egito Antigo, Harappa, Minoicos e os primeiros impérios. A escrita cuneiforme (Mesopotâmia) e hieroglífica (Egito) emergem. O Disco de Nebra (c. 1600 a.C.) é o mais antigo mapa astronômico conhecido.",
  },
  {
    title: "Era do Ferro",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Iron_electrolytic_and_electrolytic_reduced.jpg/640px-Iron_electrolytic_and_electrolytic_reduced.jpg",
    metadata: { period: { start: -1200, end: -550 }, location: "Eurásia" },
    tags: ["Eras", "Humanidade", "Metalurgia", "Colapso Bronze"],
    content: "O colapso da Idade do Bronze (c. 1200 a.C.) destruiu Micenas, Hititas e perturbou o Egito. O ferro, mais abundante que o estanho, democratizou as ferramentas. Surgem os Fenícios, o alfabeto semítico, os reinos de Israel, a Assíria e a Pérsia dos Medos.",
  },
  {
    title: "Egito Antigo",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/640px-Kheops-Pyramid.jpg",
    metadata: { period: { start: -3100, end: -30 }, location: "Vale do Nilo, África" },
    tags: ["Eras", "Civilizações", "Humanidade", "Faraós", "Pirâmides"],
    content: "Três mil anos de civilização contínua no Vale do Nilo. Unificado por Menés c. 3100 a.C., o Egito desenvolveu uma das culturas mais duradouras da história: hieróglifos, papiro, arquitetura monumental (Pirâmides de Gizé, Templo de Karnak), medicina avançada, astronomia calendárica e uma teologia de ressurreição expressa no Livro dos Mortos.",
  },
  {
    title: "Grécia Clássica",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/640px-The_Parthenon_in_Athens.jpg",
    metadata: { period: { start: -800, end: -146 }, location: "Grécia e Mediterrâneo" },
    tags: ["Eras", "Civilizações", "Humanidade", "Filosofia", "Democracia", "Grécia Antiga"],
    content: "Berço da filosofia ocidental, da democracia e do teatro. Atenas produziu Sócrates, Platão, Aristóteles, Ésquilo, Sófocles, Tucídides e Heródoto. Esparta criou o modelo militar mais disciplinado da Antiguidade. As Guerras Médicas (490-479 a.C.) e a Guerra do Peloponeso moldaram a geopolítica mediterrânea. A polis grega inventou a cidadania.",
  },
  {
    title: "Período Helenístico",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/AlexanderTheGreat_Bust.jpg/640px-AlexanderTheGreat_Bust.jpg",
    metadata: { period: { start: -323, end: -31 }, location: "Do Mediterrâneo à Índia" },
    tags: ["Eras", "Civilizações", "Alexandre Magno", "Grécia Antiga", "Sincretismo"],
    content: "Da morte de Alexandre Magno (323 a.C.) à conquista romana do Egito ptolemaico. A cultura grega fundiu-se com egípcia, persa, mesopotâmica e indiana. Alexandria tornou-se o centro intelectual do mundo: a Biblioteca, o Museu, Euclides, Arquimedes, Eratóstenes. A koiné grega tornou-se língua franca do Mediterrâneo oriental.",
  },
  {
    title: "Pérsia Aquemênida",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Persepolis_Apadana_north_stairs_detail.jpg/640px-Persepolis_Apadana_north_stairs_detail.jpg",
    metadata: { period: { start: -550, end: -330 }, location: "Oriente Médio e Ásia Central" },
    tags: ["Eras", "Civilizações", "Pérsia", "Ciro o Grande", "Humanidade"],
    content: "O primeiro grande império multicultural da história. Ciro II (o Grande) fundou o Império Aquemênida c. 550 a.C., proclamando os primeiros direitos humanos documentados (Cilindro de Ciro). Dario I criou a rede de estradas reais, o correio imperial e a administração por satrapias. O zoroastrismo permeou a filosofia e a religião ocidentais.",
  },
  {
    title: "China Clássica",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/640px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
    metadata: { period: { start: -500, end: 220 }, location: "China" },
    tags: ["Eras", "Civilizações", "China", "Confucionismo", "Taoismo"],
    content: "Do Período dos Estados Combatentes ao fim da Dinastia Han. Confúcio, Laozi, Sun Tzu e Mêncio definiram o pensamento ético e político chinês. A Dinastia Qin (221 a.C.) unificou a China, padronizou pesos, medidas e escrita. A Han criou o serviço civil por mérito, o papel, a seda e a Rota da Seda.",
  },
  {
    title: "Índia Clássica",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ashoka_Pillar_at_Vaishali.jpg/640px-Ashoka_Pillar_at_Vaishali.jpg",
    metadata: { period: { start: -1500, end: 550 }, location: "Subcontinente Indiano" },
    tags: ["Eras", "Civilizações", "Índia", "Budismo", "Hinduismo", "Sânscrito"],
    content: "Do período védico (Rig-Veda, c. 1500 a.C.) ao Império Gupta. Asoka (304-232 a.C.) propagou o Budismo pelo continente. O zero e o sistema decimal foram inventados aqui. O Mahabharata e o Ramayana são épicos que codificam valores civilizacionais ainda vivos. A matemática, astronomia e medicina (Ayurveda) atingiram altíssimo nível.",
  },
  {
    title: "Civilização Inca",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/640px-Machu_Picchu%2C_Peru.jpg",
    metadata: { period: { start: 1438, end: 1533 }, location: "Andes, América do Sul" },
    tags: ["Eras", "Civilizações", "Américas", "Inca", "Andino"],
    content: "O maior império pré-colombiano, estendendo-se por 4.000 km ao longo dos Andes. Sem escrita alfabética, os Incas usavam o quipu (nós de cordas) para registros. Machu Picchu (c. 1450) demonstra arquitetura sem argamassa de precisão extraordinária. O sistema de redistribuição de alimentos via tambos eliminou a fome entre 12 milhões de súditos.",
  },
  {
    title: "Civilização Asteca",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Piedra_del_sol_en_MNA.jpg/640px-Piedra_del_sol_en_MNA.jpg",
    metadata: { period: { start: 1345, end: 1521 }, location: "México Central" },
    tags: ["Eras", "Civilizações", "Américas", "Asteca", "Mesoamérica"],
    content: "Tenochtitlan (atual Cidade do México), fundada em 1325 numa ilha do Lago Texcoco, era uma das maiores cidades do mundo em 1500, com ~300.000 habitantes. A Triple Alianza Asteca controlava o comércio mesoamericano. A Pedra do Sol (Calendário Asteca) codifica uma cosmologia de cinco eras cósmicas. A conquista espanhola (1519-1521) destruiu 90% da população indígena.",
  },
  {
    title: "Vikings",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/SFEC_BM_VikingAge-01.JPG/640px-SFEC_BM_VikingAge-01.JPG",
    metadata: { period: { start: 793, end: 1066 }, location: "Escandinávia → Atlântico Norte" },
    tags: ["Eras", "Civilizações", "Escandinávia", "Nórdicos", "Expansão Marítima"],
    content: "De 793 (saque de Lindisfarne) a 1066 (Batalha de Hastings). Os povos nórdicos navegaram até América do Norte (Leif Erikson, c. 1000), Constantinopla, Bagdá e o Mediterrâneo. Criaram as Sagas islandesas, a mitologia nórdica (Edda Poética e Prosaica). Estabeleceram rotas comerciais da Irlanda à Rússia (Varangos). Normandia, Irlanda, Rússia e Sicília têm raízes viquing.",
  },
  {
    title: "Idade de Ouro Islâmica",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Al-Jazari_Automata_1206.jpg/640px-Al-Jazari_Automata_1206.jpg",
    metadata: { period: { start: 750, end: 1258 }, location: "Califado Abássida, Bagdá" },
    tags: ["Eras", "Civilizações", "Islão", "Ciência", "Filosofia", "Bagdá"],
    content: "Sob os califas abássidas, Bagdá tornou-se o centro intelectual do mundo. A Casa da Sabedoria (Bayt al-Hikma) traduziu e preservou obras gregas. Al-Khwarizmi fundou a álgebra. Ibn Sina (Avicena) escreveu o Cânon da Medicina. Ibn al-Haytham fundou a óptica experimental. Al-Biruni mediu a circunferência da Terra. Ibn Rushd (Averroés) preservou Aristóteles para o Ocidente.",
  },
  {
    title: "Idade Média Europeia",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Bayeux_Tapestry_WP_1.jpg/640px-Bayeux_Tapestry_WP_1.jpg",
    metadata: { period: { start: 476, end: 1492 }, location: "Europa Ocidental" },
    tags: ["Eras", "Civilizações", "Europa", "Feudalismo", "Igreja Católica"],
    content: "Do colapso do Império Romano do Ocidente (476) à queda de Constantinopla (1453) e à chegada às Américas (1492). O feudalismo organizou a sociedade em suseranos e vassalos. Monastérios preservaram o conhecimento clássico. As Cruzadas (1096-1291) conectaram Europa e Oriente. As universidades medievais (Bologna 1088, Paris c. 1150, Oxford c. 1167) institucionalizaram o saber. A Peste Negra (1347-1351) matou 1/3 da Europa.",
  },
  {
    title: "Renascimento Italiano",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/640px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
    metadata: { period: { start: 1300, end: 1600 }, location: "Itália → Europa" },
    tags: ["Eras", "Renascimento", "Arte", "Humanismo", "Europa", "Itália"],
    content: "Renascimento (\"Rinascimento\") foi um movimento de renovação cultural centrado no humanismo: o ser humano como medida de todas as coisas. Florença sob os Médici atraiu Botticelli, Leonardo da Vinci, Michelangelo, Rafael. A perspectiva linear (Brunelleschi, Alberti) revolucionou as artes visuais. O helenismo redescoberto via Bizâncio alimentou Pico della Mirandola, Ficino e o neoplatonismo.",
  },
  {
    title: "Reforma Protestante",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg/640px-Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg",
    metadata: { period: { start: 1517, end: 1648 }, location: "Europa" },
    tags: ["Eras", "Religião", "Europa", "Lutero", "Calvino", "Protestantismo"],
    content: "Em 31 de outubro de 1517, Martinho Lutero afixou as 95 Teses em Wittenberg. A imprensa de Gutenberg multiplicou as ideias a velocidade sem precedente. Calvino em Genebra e Zuínglio em Zurique radicalizaram a reforma. A Guerra dos Trinta Anos (1618-1648) terminou com a Paz de Westfália, fundando o sistema moderno de estados soberanos. A tradução bíblica de Lutero para o alemão popular criou a língua literária alemã.",
  },
  {
    title: "Revolução Científica",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/640px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg",
    metadata: { period: { start: 1543, end: 1687 }, location: "Europa" },
    tags: ["Eras", "Ciência", "Europa", "Iluminismo", "Método Científico"],
    content: "De Copérnico (De Revolutionibus, 1543) a Newton (Principia, 1687). A Terra deixou de ser o centro do universo. Galileu inventou o telescópio astronômico, descobriu as luas de Júpiter e foi julgado pela Inquisição. Kepler formulou as leis do movimento planetário. Harvey descobriu a circulação sanguínea. Vesalius fez anatomia sistemática. Francis Bacon propôs o método indutivo; Descartes o dedutivo.",
  },
  {
    title: "Era das Grandes Navegações",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Sao_gabriel.jpg/640px-Sao_gabriel.jpg",
    metadata: { period: { start: 1415, end: 1600 }, location: "Atlântico, Índico, Pacífico" },
    tags: ["Eras", "Exploração", "Portugal", "Espanha", "Colonialismo"],
    content: "Portugal e Espanha redesenharam o mapa-múndi. Henrique o Navegador financiou a exploração africana a partir de 1415. Bartolomeu Dias dobrou o Cabo da Boa Esperança (1488). Vasco da Gama chegou à Índia (1498). Colombo chegou às Américas (1492). Magalhães-Elcano completou a primeira circum-navegação (1519-1522). O resultado foi a Troca Colombiana, conectando ecossistemas e iniciando o colonialismo moderno.",
  },
  {
    title: "Revolução Francesa",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg/640px-Eug%C3%A8ne_Delacroix_-_La_libert%C3%A9_guidant_le_peuple.jpg",
    metadata: { period: { start: 1789, end: 1799 }, location: "França" },
    tags: ["Eras", "Revolução", "França", "Iluminismo", "Direitos", "Modernidade"],
    content: "A Declaração dos Direitos do Homem e do Cidadão (1789) proclamou liberdade, igualdade e fraternidade. A Bastilha caiu em 14 de julho. Robespierre e o Terror (1793-1794) mostraram a violência potencial dos ideais revolucionários. Napoleão Bonaparte emergiu do caos, redesenhando a Europa e espalhando o Código Napoleônico, que uniformizou o direito civil em dezenas de países.",
  },
  {
    title: "Revolução Industrial",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Hartmann_Maschinenhalle_1868_%28Wiener_Weltausstellung%29.jpg/640px-Hartmann_Maschinenhalle_1868_%28Wiener_Weltausstellung%29.jpg",
    metadata: { period: { start: 1760, end: 1840 }, location: "Reino Unido → Europa → Mundo" },
    tags: ["Eras", "Tecnologia", "Capitalismo", "Urbanização", "Vapor"],
    content: "A máquina a vapor de James Watt (1769) e o tear mecânico transformaram a produção têxtil britânica. Manchester tornou-se a primeira cidade industrial. A ferrovia conectou continentes. O trabalho infantil em minas e fábricas gerou a questão social que Engels e Marx documentaram. A Revolução Industrial duplicou a expectativa de vida e o PIB per capita em menos de 100 anos, mas ao custo de condições de trabalho brutais.",
  },
  {
    title: "Modernismo",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/640px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    metadata: { period: { start: 1890, end: 1945 }, location: "Europa e América do Norte" },
    tags: ["Eras", "Arte", "Literatura", "Ruptura", "Vanguardas"],
    content: "Ruptura com o passado em todas as artes. Em literatura: Joyce (fluxo de consciência), Woolf (tempo interior), Kafka (absurdo burocrático), Proust (memória involuntária). Em pintura: Cézanne, Picasso (Cubismo), Kandinsky (abstração), Duchamp (readymade). Em música: Schoenberg (dodecafonismo), Stravinsky (poliritmia). Freud e Einstein transformaram a compreensão da mente e do universo.",
  },
  {
    title: "Primeira Guerra Mundial",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Cheshire_Regiment_trench_Somme_1916.jpg/640px-Cheshire_Regiment_trench_Somme_1916.jpg",
    metadata: { period: { start: 1914, end: 1918 }, location: "Europa e Oriente Médio" },
    tags: ["Eras", "Guerra", "Europa", "Imperialismo", "Século XX"],
    content: "A \"guerra para acabar com todas as guerras\" matou 20 milhões de pessoas. A tecnologia industrial — metralhadoras, gás venenoso, aviões, tanques — tornou obsoleta a guerra de cavalaria. A guerra de trincheiras na Frente Ocidental simbolizou o absurdo. O Tratado de Versalhes (1919) humilhou a Alemanha, plantando as sementes do nazismo. Impérios Otomano, Austro-Húngaro e Russo desapareceram.",
  },
  {
    title: "Segunda Guerra Mundial",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Family_watching_television_1958.jpg/640px-Family_watching_television_1958.jpg",
    metadata: { period: { start: 1939, end: 1945 }, location: "Global" },
    tags: ["Eras", "Guerra", "Fascismo", "Holocausto", "Século XX"],
    content: "O maior conflito da história: 70-85 milhões de mortos. O Holocausto aniquilou 6 milhões de judeus e milhões de outras vítimas. As bombas atômicas de Hiroshima e Nagasaki inauguraram a era nuclear. A ONU (1945) e a Declaração Universal dos Direitos Humanos (1948) nasceram das ruínas. O Plano Marshall reconstruiu a Europa. A Guerra Fria substituiu imediatamente a paz.",
  },
  {
    title: "Guerra Fria",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Checkpoint_Charlie_1961-10-27.jpg/640px-Checkpoint_Charlie_1961-10-27.jpg",
    metadata: { period: { start: 1947, end: 1991 }, location: "Global" },
    tags: ["Eras", "Geopolítica", "EUA", "URSS", "Nuclear", "Século XX"],
    content: "EUA x URSS: uma guerra de ideologias, tecnologias e proxies que nunca foi diretamente quente entre as superpotências. Corrida espacial (Sputnik 1957, Lua 1969), corrida nuclear (MAD — Destruição Mútua Assegurada), guerras da Coreia, Vietnam, Afeganistão. Berlim dividida. Muro de Berlim (1961-1989). A queda do Muro e a dissolução da URSS (1991) encerraram o século americano.",
  },
  {
    title: "Era Digital",
    type: "CONCEPT", area: "ATLAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/ENIAC_Penn1.jpg/640px-ENIAC_Penn1.jpg",
    metadata: { period: { start: 1945, end: 2026 }, location: "Global" },
    tags: ["Eras", "Tecnologia", "Internet", "Computação", "Século XX", "Contemporâneo"],
    content: "Do ENIAC (1945) ao smartphone. ARPANET (1969) → World Wide Web (Berners-Lee, 1991) → Google (1998) → iPhone (2007) → IA generativa (2022). A digitalização transformou toda produção cultural, econômica e social. O algoritmo tornou-se o novo poder. O debate sobre privacidade, desinformação e soberania da IA define o início do século XXI.",
  },
]

// ── AUTORES ───────────────────────────────────────────────────────────────────

const AUTHORS: SeedItem[] = [
  {
    title: "Homero",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Homer_British_Museum.jpg/640px-Homer_British_Museum.jpg",
    metadata: { period: { start: -800, end: -700 }, location: "Grécia" },
    tags: ["Escritores", "Pessoas", "Poetas", "Grécia Antiga", "Literatura"],
    content: "Poeta épico grego, presumivelmente autor da Ilíada e da Odisseia — as duas pedras angulares da literatura ocidental. Sua existência histórica é debatida; o que é certo é que essas epopeias moldaram a identidade cultural do mundo grego e, via Roma, toda a literatura europeia.",
  },
  {
    title: "Platão",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/640px-Plato_Silanion_Musei_Capitolini_MC1377.jpg",
    metadata: { period: { start: -428, end: -348 }, location: "Atenas, Grécia" },
    tags: ["Filósofos", "Pessoas", "Grécia Antiga", "Academia", "Idealismo"],
    content: "Filósofo ateniense, discípulo de Sócrates e mestre de Aristóteles. Fundou a Academia em Atenas (~387 a.C.), a primeira instituição de ensino superior. Seus diálogos — A República, Fédon, O Banquete, Mênon — inventaram a filosofia como gênero literário e estabeleceram o problema da realidade (mundo das ideias vs. aparências) que domina o pensamento ocidental.",
  },
  {
    title: "Heródoto",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Herodotos_Met_91.8.jpg/640px-Herodotos_Met_91.8.jpg",
    metadata: { period: { start: -484, end: -425 }, location: "Halicarnasso, Grécia" },
    tags: ["Historiadores", "Pessoas", "Grécia Antiga", "História", "Viajantes"],
    content: "\"Pai da História\" (Cícero). Suas Histórias narram as Guerras Médicas e os povos do mundo conhecido. Viajou pelo Egito, Pérsia, Escítia e Babilônia, coletando relatos. Distinguiu entre o que viu e o que ouviu dizer — inaugurando o método historiográfico.",
  },
  {
    title: "Júlio César",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Gaius_Iulius_Caesar_%28100-44_BC%29.jpg/640px-Gaius_Iulius_Caesar_%28100-44_BC%29.jpg",
    metadata: { period: { start: -100, end: -44 }, location: "Roma, Itália" },
    tags: ["Líderes", "Pessoas", "Roma Antiga", "Generais", "Escritores"],
    content: "General, estadista e escritor romano. Sua campanha na Gália (58-50 a.C.) relatada em De Bello Gallico é obra literária e estratégica. Cruzou o Rubicão (49 a.C.), venceu a guerra civil e reformou o calendário (juliano). Seu assassinato (15 de março, 44 a.C.) por senadores republicanos precipitou o fim da República Romana.",
  },
  {
    title: "Marco Aurélio",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-61-b-1.jpg/640px-MSR-ra-61-b-1.jpg",
    metadata: { period: { start: 121, end: 180 }, location: "Roma, Itália" },
    tags: ["Filósofos", "Pessoas", "Roma Antiga", "Estoicismo", "Líderes"],
    content: "Imperador romano e filósofo estoico. Governou o Império Romano de 161 a 180 d.C., período de guerras constantes. Suas Meditações são um diário filosófico pessoal, nunca destinado à publicação — e talvez o mais honesto retrato de um governante tentando ser virtuoso. Símbolo do rei-filósofo de Platão realizado.",
  },
  {
    title: "Confúcio",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/640px-Confucius_Tang_Dynasty.jpg",
    metadata: { period: { start: -551, end: -479 }, location: "Estado de Lu, China" },
    tags: ["Filósofos", "Pessoas", "China", "Confucionismo", "Ética"],
    content: "Filósofo e mestre chinês cujos ensinamentos sobre ética, família, governança e educação moldaram a civilização do Extremo Oriente por 2.500 anos. Seus Analetos (compilados por discípulos) formam o núcleo do confucionismo, que enfatiza a benevolência (ren), os rituais (li) e a virtude como fundamento da ordem social.",
  },
  {
    title: "Sun Tzu",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Sun_Tzu_by_Tanaka_Kakuzo.jpg/640px-Sun_Tzu_by_Tanaka_Kakuzo.jpg",
    metadata: { period: { start: -544, end: -496 }, location: "Estado de Qi, China" },
    tags: ["Generais", "Pessoas", "China", "Estratégia", "Filosofia Militar"],
    content: "General e estrategista militar chinês do século V a.C. A Arte da Guerra (13 capítulos) é o tratado militar mais influente já escrito. Traduzida para francês em 1772, influenciou Napoleão. No século XX: Mao Tsé-tung, estratégias corporativas e de negócios. Sua filosofia vai além da guerra: é uma meditação sobre conhecimento, adaptação e eficiência.",
  },
  {
    title: "Dante Alighieri",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Portrait_de_Dante.jpg/640px-Portrait_de_Dante.jpg",
    metadata: { period: { start: 1265, end: 1321 }, location: "Florença, Itália" },
    tags: ["Poetas", "Pessoas", "Renascimento", "Itália", "Literatura Medieval"],
    content: "Poeta florentino, autor da Divina Comédia. Exilado de Florença em 1302, escreveu a obra-prima em volgare (italiano popular) em vez do latim — ato político e estético que fundou a língua italiana literária. O poema é simultaneamente teologia medieval, filosofia, política e autobiografia: Dante guiado por Virgílio pelo Inferno e Purgatório, e por Beatriz ao Paraíso.",
  },
  {
    title: "Niccolò Maquiavel",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg/640px-Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg",
    metadata: { period: { start: 1469, end: 1527 }, location: "Florença, Itália" },
    tags: ["Filósofos", "Pessoas", "Renascimento", "Itália", "Política"],
    content: "Diplomata, historiador e filósofo florentino. O Príncipe (1513) fundou o realismo político moderno: o governante deve usar tanto a força quanto a astúcia, e fins políticos podem justificar meios moralmente questionáveis. Maquiavel separou a política da ética religiosa, inaugurando a ciência política secular.",
  },
  {
    title: "Nicolau Copérnico",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Copernicus.jpg/640px-Copernicus.jpg",
    metadata: { period: { start: 1473, end: 1543 }, location: "Polônia" },
    tags: ["Cientistas", "Pessoas", "Astronomia", "Revolução Científica", "Heliocentrimo"],
    content: "Astrônomo polonês que propôs o modelo heliocêntrico do sistema solar em De Revolutionibus Orbium Coelestium (1543), publicado no ano de sua morte. A \"revolução copernicana\" é metáfora de qualquer mudança radical de perspectiva. Iniciou a Revolução Científica ao remover a Terra (e o ser humano) do centro do universo.",
  },
  {
    title: "Galileu Galilei",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg/640px-Justus_Sustermans_-_Portrait_of_Galileo_Galilei%2C_1636.jpg",
    metadata: { period: { start: 1564, end: 1642 }, location: "Pisa / Florença / Pádua, Itália" },
    tags: ["Cientistas", "Pessoas", "Astronomia", "Física", "Revolução Científica"],
    content: "\"Pai da ciência moderna\" (Einstein). Aprimorou o telescópio e descobriu as luas de Júpiter (1610), as fases de Vênus e crateras lunares. Formulou as leis do pêndulo e da queda livre. Seu Diálogo Sobre os Dois Grandes Sistemas do Mundo (1632) defendeu Copérnico e resultou em processo inquisitorial. \"Eppur si muove\" — e no entanto ela se move.",
  },
  {
    title: "René Descartes",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/640px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg",
    metadata: { period: { start: 1596, end: 1650 }, location: "França / Países Baixos" },
    tags: ["Filósofos", "Pessoas", "Matemáticos", "Revolução Científica", "Racionalismo"],
    content: "\"Pai da filosofia moderna\". O Discurso do Método (1637) propôs a dúvida metódica como fundamento do conhecimento: Cogito ergo sum (Penso, logo existo). Inventou a geometria analítica (coordenadas cartesianas), unindo álgebra e geometria. Seu dualismo mente-corpo (res cogitans vs. res extensa) ainda estrutura debates na filosofia da mente.",
  },
  {
    title: "Francis Bacon",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Francis_Bacon%2C_Viscount_St_Alban_from_NPG_%283%29.jpg/640px-Francis_Bacon%2C_Viscount_St_Alban_from_NPG_%283%29.jpg",
    metadata: { period: { start: 1561, end: 1626 }, location: "Londres, Inglaterra" },
    tags: ["Filósofos", "Pessoas", "Empirismo", "Revolução Científica", "Método Científico"],
    content: "Filósofo e estadista inglês, pai do empirismo e do método indutivo. O Novum Organum (1620) propôs que o conhecimento deve partir da observação dos fatos e não da autoridade aristotélica. \"Saber é poder\" (Scientia potestas est). Seu projeto de enciclopédia universal influenciou diretamente o Iluminismo francês e a Encyclopédie de Diderot.",
  },
  {
    title: "Jean-Jacques Rousseau",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Jean-Jacques_Rousseau_%28painted_portrait%29.jpg/640px-Jean-Jacques_Rousseau_%28painted_portrait%29.jpg",
    metadata: { period: { start: 1712, end: 1778 }, location: "Genebra / Paris" },
    tags: ["Filósofos", "Pessoas", "Iluminismo", "Contrato Social", "Política"],
    content: "Filósofo genebrino cujo pensamento inflamou a Revolução Francesa. O Contrato Social (1762) propõe que a soberania pertence ao povo, não ao rei — a \"vontade geral\" como fundamento da república. O Emílio (1762) revolucionou a pedagogia ao tratar a infância como estágio próprio. Criticou a civilização como corruptora do \"bom selvagem\" natural.",
  },
  {
    title: "Voltaire",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Nicolas_de_Largilli%C3%A8re%2C_Fran%C3%A7ois-Marie_Arouet_dit_Voltaire_%28vers_1724-1725%29_-_Mus%C3%A9es_de_Versailles.jpg/640px-Nicolas_de_Largilli%C3%A8re%2C_Fran%C3%A7ois-Marie_Arouet_dit_Voltaire_%28vers_1724-1725%29_-_Mus%C3%A9es_de_Versailles.jpg",
    metadata: { period: { start: 1694, end: 1778 }, location: "Paris, França" },
    tags: ["Filósofos", "Pessoas", "Iluminismo", "Escritores", "Tolerância"],
    content: "François-Marie Arouet, conhecido como Voltaire. O escritor mais prolífico e influente do Iluminismo: mais de 2.000 livros, ensaios e peças. Sua arma era a ironia. Cândido (1759) satirizou o otimismo leibniziano e a intolerância religiosa. Lutou pelo caso Calas, defendendo a tolerância religiosa. \"Esmagai o infame!\" — sua campanha contra o fanatismo religioso.",
  },
  {
    title: "Adam Smith",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/AdamSmith.jpg/640px-AdamSmith.jpg",
    metadata: { period: { start: 1723, end: 1790 }, location: "Kirkcaldy, Escócia" },
    tags: ["Economistas", "Pessoas", "Iluminismo", "Capitalismo", "Economia"],
    content: "Filósofo moral e economista escocês, fundador da economia política moderna. A Riqueza das Nações (1776) analisou a divisão do trabalho, o mercado e a \"mão invisível\" que coordena a produção sem planejamento central. Publicado no mesmo ano da Declaração de Independência americana, tornou-se a bíblia do liberalismo econômico.",
  },
  {
    title: "Karl Marx",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/640px-Karl_Marx_001.jpg",
    metadata: { period: { start: 1818, end: 1883 }, location: "Tréveris / Londres" },
    tags: ["Filósofos", "Pessoas", "Economistas", "Socialismo", "Revolução Industrial"],
    content: "Filósofo, economista e revolucionário alemão. Com Engels, escreveu o Manifesto Comunista (1848). O Capital (1867) analisou o modo de produção capitalista: mais-valia, alienação do trabalho, luta de classes. Sua teoria influenciou as Revoluções Russa (1917), Chinesa (1949) e dezenas de movimentos de libertação. Eleito o maior filósofo do milênio em poll da BBC.",
  },
  {
    title: "Friedrich Nietzsche",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/640px-Nietzsche187a.jpg",
    metadata: { period: { start: 1844, end: 1900 }, location: "Röcken, Alemanha" },
    tags: ["Filósofos", "Pessoas", "Existencialismo", "Moralidade", "Vontade de Poder"],
    content: "Filósofo alemão que proclamou \"Deus está morto\" (A Gaia Ciência, 1882) — não como ateísmo trivial, mas como diagnóstico cultural: os valores metafísicos ocidentais entraram em colapso. Assim Falou Zaratustra (1883-85) propôs o Super-Homem e a vontade de poder. Nietzsche influenciou Heidegger, Foucault, o existencialismo e a psicanálise.",
  },
  {
    title: "Franz Kafka",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_1923.jpg/640px-Franz_Kafka%2C_1923.jpg",
    metadata: { period: { start: 1883, end: 1924 }, location: "Praga, Bohemia" },
    tags: ["Escritores", "Pessoas", "Literatura", "Absurdo", "Modernismo"],
    content: "Escritor tcheco de língua alemã, um dos mais influentes do século XX. A Metamorfose (1915), O Processo (1925) e O Castelo (1926, póstumo) criaram o \"kafkiano\" — adjetivo para burocracia absurda, culpa sem acusação definida, impotência do indivíduo ante sistemas opacos. Kafka pediu que seus manuscritos fossem destruídos; Max Brod os publicou após sua morte.",
  },
  {
    title: "James Joyce",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/James_Joyce_by_Alex_Ehrenzweig%2C_1915_restored.jpg/640px-James_Joyce_by_Alex_Ehrenzweig%2C_1915_restored.jpg",
    metadata: { period: { start: 1882, end: 1941 }, location: "Dublin / Paris" },
    tags: ["Escritores", "Pessoas", "Modernismo", "Literatura", "Irlanda"],
    content: "Romancista irlandês, o maior experimentalista da língua inglesa. Ulisses (1922) narra um único dia em Dublin com 18 estilos literários distintos, stream of consciousness e referências homéricas. Finnegans Wake (1939) vai além: uma língua inventada fusionando 60 idiomas. Joyce revolucionou o que o romance pode fazer com a linguagem.",
  },
  {
    title: "Virginia Woolf",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg/640px-George_Charles_Beresford_-_Virginia_Woolf_in_1902_-_Restoration.jpg",
    metadata: { period: { start: 1882, end: 1941 }, location: "Londres, Inglaterra" },
    tags: ["Escritoras", "Pessoas", "Modernismo", "Feminismo", "Literatura"],
    content: "Romancista e ensaísta inglesa, figura central do modernismo literário e do feminismo. Mrs. Dalloway (1925) e Ao Farol (1927) criaram o fluxo de consciência feminino. Um Teto Todo Seu (1929) é ensaio fundador do feminismo literário: \"Uma mulher precisa de dinheiro e um quarto só seu para escrever ficção.\" Membro do Grupo de Bloomsbury.",
  },
  {
    title: "George Orwell",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/640px-George_Orwell_press_photo.jpg",
    metadata: { period: { start: 1903, end: 1950 }, location: "Índia / Reino Unido" },
    tags: ["Escritores", "Pessoas", "Política", "Século XX", "Distopia"],
    content: "Eric Arthur Blair, pseudônimo George Orwell. Jornalista, ensaísta e romancista britânico. Lutou na Guerra Civil Espanhola. A Revolução dos Bichos (1945) e 1984 (1949) são as mais poderosas críticas ao totalitarismo do século XX. Criou \"Grande Irmão\", \"doublethink\", \"newspeak\". Defendia um socialismo democrático contra o stalinismo e o imperialismo britânico.",
  },
  {
    title: "Hannah Arendt",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hannah_Arendt_1975.jpg/640px-Hannah_Arendt_1975.jpg",
    metadata: { period: { start: 1906, end: 1975 }, location: "Alemanha / EUA" },
    tags: ["Filósofas", "Pessoas", "Política", "Holocausto", "Totalitarismo"],
    content: "Filósofa política alemã-americana, judia. Fugiu do nazismo para os EUA. As Origens do Totalitarismo (1951) analisa como o nazismo e o stalinismo emergiram. A Condição Humana (1958) distingue trabalho, obra e ação. Eichmann em Jerusalém (1963) cunhou \"banalidade do mal\" — o horror perpetrado não por monstros, mas por burocratas que simplesmente obedecem ordens.",
  },
  {
    title: "Michel Foucault",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Foucault5.jpg/640px-Foucault5.jpg",
    metadata: { period: { start: 1926, end: 1984 }, location: "Poitiers / Paris" },
    tags: ["Filósofos", "Pessoas", "Pós-Modernismo", "Poder", "Genealogia"],
    content: "Filósofo francês, um dos pensadores mais influentes do século XX. Seu método genealógico rastreia como discursos de verdade são inseparáveis de relações de poder. Vigiar e Punir (1975) analisou a prisão como paradigma da sociedade disciplinar. História da Sexualidade (3 vols.) questionou as categorias \"naturais\" do desejo. Foucault transformou a história, a sociologia e os estudos culturais.",
  },
  {
    title: "Avicena (Ibn Sina)",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Avicenna_-_by_Ernest_Board.jpg/640px-Avicenna_-_by_Ernest_Board.jpg",
    metadata: { period: { start: 980, end: 1037 }, location: "Pérsia (atual Uzbequistão/Irã)" },
    tags: ["Médicos", "Pessoas", "Islão", "Filosofia", "Ciência Medieval"],
    content: "Polímata persa, o maior médico e filósofo da era islâmica. O Cânon da Medicina (Al-Qanun fi al-Tibb) sistematizou o conhecimento médico greco-árabe e foi manual universitário na Europa até o século XVII. Filosoficamente, reconciliou Aristóteles com o islão neoplatônico. Seu Livro da Cura enciclopedizou ciência, lógica, matemática e metafísica.",
  },
  {
    title: "Al-Khwarizmi",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Al-Khwarizmi_portrait_2.jpg/640px-Al-Khwarizmi_portrait_2.jpg",
    metadata: { period: { start: 780, end: 850 }, location: "Bagdá, Califado Abássida" },
    tags: ["Matemáticos", "Pessoas", "Islão", "Álgebra", "Algoritmos"],
    content: "Matemático, astrônomo e geógrafo persa da Casa da Sabedoria em Bagdá. Seu tratado Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala fundou a álgebra (\"al-jabr\" → algebra em latim). O nome latinizado de Al-Khwarizmi originou a palavra \"algoritmo\". Introduziu os algarismos indo-arábicos (incluindo o zero) na matemática ocidental.",
  },
]

// ── LIVROS E OBRAS ────────────────────────────────────────────────────────────

const BOOKS: SeedItem[] = [
  {
    title: "Epopeia de Gilgamesh",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/The_Flood_Tablet_of_the_Epic_of_Gilgamesh.jpg/640px-The_Flood_Tablet_of_the_Epic_of_Gilgamesh.jpg",
    metadata: { period: { start: -2100, end: -600 }, location: "Mesopotâmia" },
    tags: ["Livros", "Literatura", "Mesopotâmia", "Épicos", "Mitologia", "Eras"],
    content: "O poema épico mais antigo da humanidade, originário da Suméria (c. 2100 a.C.). Narra as aventuras de Gilgamesh, rei de Uruk, sua amizade com Enkidu, a busca pela imortalidade e um dilúvio universal notavelmente semelhante ao do Gênesis bíblico. O Dilúvio de Gilgamesh, na Tábua XI, antecede em mil anos a narrativa de Noé.",
  },
  {
    title: "Ilíada",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Homeros_Epiktetos.jpg/640px-Homeros_Epiktetos.jpg",
    metadata: { period: { start: -750, end: -700 }, location: "Grécia" },
    tags: ["Livros", "Literatura", "Grécia Antiga", "Épicos", "Homero", "Guerra"],
    content: "Épico atribuído a Homero, narrando a cólera de Aquiles durante o cerco de Troia. A guerra de dez anos por Helena, os duelos de heróis, a intervenção dos deuses e a morte de Pátroclo e Heitor formam o poema fundador da literatura ocidental. A Ilíada não é apenas sobre guerra — é sobre honra, luto e a condição mortal.",
  },
  {
    title: "Odisseia",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Odysseus_Polyphemus_Met_41.83.jpg/640px-Odysseus_Polyphemus_Met_41.83.jpg",
    metadata: { period: { start: -725, end: -675 }, location: "Grécia" },
    tags: ["Livros", "Literatura", "Grécia Antiga", "Épicos", "Homero", "Viagem"],
    content: "A continuação da Ilíada: o retorno de Odisseu (Ulisses) a Ítaca após a guerra de Troia, dez anos de viagem marcados por Ciclopes, sereias, Circe, Escila e Caríbdis. É o arquétipo de toda narrativa de viagem e retorno. James Joyce reescreveu a Odisseia como um dia em Dublin (Ulisses, 1922).",
  },
  {
    title: "A República",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Plato_Silanion_Musei_Capitolini_MC1377.jpg/640px-Plato_Silanion_Musei_Capitolini_MC1377.jpg",
    metadata: { period: { start: -380, end: -370 }, location: "Atenas, Grécia" },
    tags: ["Livros", "Filosofia", "Platão", "Grécia Antiga", "Política", "Justiça"],
    content: "Diálogo de Platão em dez livros sobre a natureza da justiça e o estado ideal. A Alegoria da Caverna (Livro VII) é a mais famosa metáfora filosófica ocidental: prisioneiros que confundem sombras com a realidade. A cidade ideal de Platão seria governada por filósofos-reis, com censura das artes e abolição da família nas classes dirigentes.",
  },
  {
    title: "Ética a Nicômaco",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/640px-Aristotle_Altemps_Inv8575.jpg",
    metadata: { period: { start: -350, end: -330 }, location: "Atenas, Grécia" },
    tags: ["Livros", "Filosofia", "Aristóteles", "Grécia Antiga", "Ética", "Felicidade"],
    content: "A principal obra moral de Aristóteles, dedicada ao filho Nicômaco. Define a felicidade (eudaimonia) como a atividade da alma de acordo com a virtude. A virtude é um meio-termo entre extremos (coragem entre covardia e temeridade). A amizade é tratada com profundidade única. A ética aristotélica influenciou Tomás de Aquino, o renascimento e a filosofia analítica contemporânea.",
  },
  {
    title: "De Bello Gallico",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Gaius_Iulius_Caesar_%28100-44_BC%29.jpg/640px-Gaius_Iulius_Caesar_%28100-44_BC%29.jpg",
    metadata: { period: { start: -58, end: -49 }, location: "Roma / Gália" },
    tags: ["Livros", "História", "Júlio César", "Roma Antiga", "Gália"],
    content: "Comentários de Júlio César sobre a Guerra da Gália (58-50 a.C.), escritos em latim claro e preciso — modelo de prosa latina ensinado até hoje. Narra a conquista do que é hoje a França, Bélgica e parte da Alemanha. Escrito na terceira pessoa (\"César fez...\"), é ao mesmo tempo autobiografia, propaganda política e relato etnográfico dos povos celtas.",
  },
  {
    title: "Meditações",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/MSR-ra-61-b-1.jpg/640px-MSR-ra-61-b-1.jpg",
    metadata: { period: { start: 161, end: 180 }, location: "Campos de batalha do Danúbio" },
    tags: ["Livros", "Filosofia", "Marco Aurélio", "Estoicismo", "Roma Antiga"],
    content: "Diário filosófico pessoal do Imperador Romano Marco Aurélio, escrito em grego durante as campanhas militares. Doze livros de reflexões estoicas sobre o dever, a efemeridade, a morte e a virtude. Nunca publicado em vida. Descoberto no século X. Ryan Holiday, Tim Ferriss e líderes modernos citam-no como o livro de filosofia prática mais útil já escrito.",
  },
  {
    title: "Analetos de Confúcio",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Confucius_Tang_Dynasty.jpg/640px-Confucius_Tang_Dynasty.jpg",
    metadata: { period: { start: -479, end: -400 }, location: "China" },
    tags: ["Livros", "Filosofia", "Confúcio", "China", "Ética", "Confucionismo"],
    content: "Compilação dos ensinamentos e conversas de Confúcio, organizada por seus discípulos após sua morte. Os 20 capítulos abordam ética, política, educação e relações humanas. Tornou-se o texto central do exame imperial chinês por 1.300 anos (605-1905 d.C.), moldando gerações de governantes e intelectuais na China, Japão, Coreia e Vietnã.",
  },
  {
    title: "A Arte da Guerra",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Sun_Tzu_by_Tanaka_Kakuzo.jpg/640px-Sun_Tzu_by_Tanaka_Kakuzo.jpg",
    metadata: { period: { start: -500, end: -400 }, location: "China" },
    tags: ["Livros", "Estratégia", "Sun Tzu", "China", "Filosofia Militar"],
    content: "Tratado militar em 13 capítulos atribuído a Sun Tzu (c. 500 a.C.). Princípios como \"Conhece o inimigo e conhece-te a ti mesmo\" transcendem a guerra: são aplicados em negócios, esportes e política. Traduzido para francês por volta de 1772 pelo jesuíta Amiot, dizem que Napoleão o estudou. Mao Tsé-tung o aplicou na guerrilha. O livro de estratégia mais lido do mundo.",
  },
  {
    title: "Bhagavad Gita",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Mahabharata_Bharata_Varsha.jpg/640px-Mahabharata_Bharata_Varsha.jpg",
    metadata: { period: { start: -400, end: -200 }, location: "Índia" },
    tags: ["Livros", "Filosofia", "Índia", "Hinduismo", "Épicos", "Dharma"],
    content: "700 versos extraídos do Mahabharata, o diálogo entre o guerreiro Arjuna e seu cocheiro Krishna (avatar de Vishnu) às vésperas da Batalha de Kurukshetra. Krishna ensina sobre dever (dharma), ação desapegada (karma yoga), devoção (bhakti) e conhecimento (jnana). Robert Oppenheimer citou o Gita ao ver a primeira explosão atômica: \"Tornei-me a Morte, destruidor de mundos.\"",
  },
  {
    title: "Suma Teológica",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Thomas_Aquinas_in_Stained_Glass.jpg/640px-Thomas_Aquinas_in_Stained_Glass.jpg",
    metadata: { period: { start: 1265, end: 1274 }, location: "Paris / Nápoles" },
    tags: ["Livros", "Filosofia", "Tomás de Aquino", "Escolástica", "Religião", "Idade Média"],
    content: "A obra-prima de Tomás de Aquino: três partes sobre Deus, o ser humano e Cristo, organizada em 512 questões, 2.669 artigos e ~10.000 objeções/respostas. Reconciliou Aristóteles com o Cristianismo, criando a escolástica. As \"cinco vias\" para a existência de Deus ainda são debatidas. Base da filosofia oficial da Igreja Católica (tomismo).",
  },
  {
    title: "O Príncipe",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg/640px-Portrait_of_Niccol%C3%B2_Machiavelli_by_Santi_di_Tito.jpg",
    metadata: { period: { start: 1513, end: 1532 }, location: "Florença, Itália" },
    tags: ["Livros", "Política", "Maquiavel", "Renascimento", "Poder"],
    content: "Escrito em 1513 por Maquiavel enquanto estava exilado, dedicado a Lorenzo de Médici na esperança de reconquistar um cargo. 26 capítulos sobre como um príncipe conquista e mantém o poder: é melhor ser temido que amado, os fins justificam os meios, a fortuna é uma mulher que deve ser dominada pela força. O primeiro manual de ciência política secular.",
  },
  {
    title: "De Revolutionibus Orbium Coelestium",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Copernicus-heliocentric.jpg/640px-Copernicus-heliocentric.jpg",
    metadata: { period: { start: 1543, end: 1543 }, location: "Nuremberg, Alemanha" },
    tags: ["Livros", "Astronomia", "Copérnico", "Revolução Científica", "Heliocentrismo"],
    content: "Publicado no ano da morte de Copérnico (1543), propôs que o Sol, não a Terra, está no centro do universo. A \"Revolução Copernicana\" tornou-se metáfora de qualquer mudança radical de perspectiva. Colocado no Index de livros proibidos pela Igreja até 1835. Thomas Kuhn citou-o como paradigma de \"revolução científica\" em sua obra homônima.",
  },
  {
    title: "Novum Organum",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Francis_Bacon%2C_Viscount_St_Alban_from_NPG_%283%29.jpg/640px-Francis_Bacon%2C_Viscount_St_Alban_from_NPG_%283%29.jpg",
    metadata: { period: { start: 1620, end: 1620 }, location: "Londres, Inglaterra" },
    tags: ["Livros", "Filosofia", "Francis Bacon", "Método Científico", "Empirismo"],
    content: "\"Novo Instrumento\" (em latim), publicado por Bacon em 1620. Critica a lógica aristotélica dedutiva e propõe a indução como método científico: observar, acumular dados, formular hipóteses testáveis. Identifica os \"ídolos\" que distorcem o conhecimento (tribos, caverna, mercado, teatro). Fundou o empirismo britânico que culminaria em Locke, Hume e a Royal Society (1660).",
  },
  {
    title: "Discurso do Método",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/640px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg",
    metadata: { period: { start: 1637, end: 1637 }, location: "Leiden, Países Baixos" },
    tags: ["Livros", "Filosofia", "Descartes", "Método Científico", "Racionalismo"],
    content: "Publicado anonimamente em 1637 como prefácio a três tratados científicos (A Dióptrica, Os Meteoros, A Geometria). Descartes descreve seu método de dúvida sistemática: rejeitar tudo o que possa ser duvidado até chegar a uma certeza irredutível — Cogito ergo sum. Propõe quatro regras de método que definiram o racionalismo filosófico ocidental.",
  },
  {
    title: "Principia Mathematica",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/640px-GodfreyKneller-IsaacNewton-1689.jpg",
    metadata: { period: { start: 1687, end: 1687 }, location: "Londres, Inglaterra" },
    tags: ["Livros", "Física", "Newton", "Matemática", "Gravidade", "Revolução Científica"],
    content: "Philosophiæ Naturalis Principia Mathematica (1687) de Isaac Newton: o livro mais influente da história da ciência. Apresenta as três leis do movimento, a lei da gravitação universal e o cálculo. Unificou mecânica terrestre e celeste: a mesma lei que faz uma maçã cair governa a órbita da Lua. Vigiu por 200 anos como paradigma da ciência \"exata\".",
  },
  {
    title: "Contrato Social",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Jean-Jacques_Rousseau_%28painted_portrait%29.jpg/640px-Jean-Jacques_Rousseau_%28painted_portrait%29.jpg",
    metadata: { period: { start: 1762, end: 1762 }, location: "Paris, França" },
    tags: ["Livros", "Filosofia", "Rousseau", "Iluminismo", "Democracia", "Política"],
    content: "\"O homem nasce livre, e em todo lugar está acorrentado\" — primeira frase do Contrato Social (1762). Rousseau argumenta que a soberania legítima emana do povo (vontade geral), não de um monarca. Propõe um contrato entre cidadãos como fundamento da república. Texto mais citado pelos revolucionários de 1789. Robespierre dormia com ele debaixo do travesseiro.",
  },
  {
    title: "Cândido",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Nicolas_de_Largilli%C3%A8re%2C_Fran%C3%A7ois-Marie_Arouet_dit_Voltaire_%28vers_1724-1725%29_-_Mus%C3%A9es_de_Versailles.jpg/640px-Nicolas_de_Largilli%C3%A8re%2C_Fran%C3%A7ois-Marie_Arouet_dit_Voltaire_%28vers_1724-1725%29_-_Mus%C3%A9es_de_Versailles.jpg",
    metadata: { period: { start: 1759, end: 1759 }, location: "Paris, França" },
    tags: ["Livros", "Literatura", "Voltaire", "Iluminismo", "Sátira", "Filosofia"],
    content: "Novela filosófica de Voltaire (1759), sátira ao otimismo leibniziano personificado pelo Professor Pangloss: \"Tudo está bem no melhor dos mundos possíveis.\" Cândido, expulso de casa, enfrenta terremotos, inquisições, guerras e escravidão. Conclusão pragmática: abandone a metafísica e \"cultive o seu jardim\". Escrito em três dias, publicado clandestinamente.",
  },
  {
    title: "A Riqueza das Nações",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/AdamSmith.jpg/640px-AdamSmith.jpg",
    metadata: { period: { start: 1776, end: 1776 }, location: "Londres, Inglaterra" },
    tags: ["Livros", "Economia", "Adam Smith", "Iluminismo", "Capitalismo"],
    content: "An Inquiry into the Nature and Causes of the Wealth of Nations (1776). Smith analisa como a divisão do trabalho aumenta a produtividade (a fábrica de alfinetes), como a \"mão invisível\" do mercado aloca recursos, e por que o livre-comércio beneficia as nações. Publicado no mesmo ano que a Declaração de Independência, moldou dois séculos de política econômica.",
  },
  {
    title: "A Origem das Espécies",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Darwin_ape.jpg/640px-Darwin_ape.jpg",
    metadata: { period: { start: 1859, end: 1859 }, location: "Londres, Inglaterra" },
    tags: ["Livros", "Biologia", "Darwin", "Evolução", "Revolução Científica"],
    content: "On the Origin of Species (1859): Charles Darwin apresenta a teoria da evolução por seleção natural após 20 anos de coleta de evidências. A primeira edição de 1.250 cópias esgotou em um dia. Aboliu o criacionismo como explicação científica da diversidade biológica. Marx queria dedicar-lhe O Capital (Darwin recusou). O livro mais importante das ciências naturais.",
  },
  {
    title: "O Capital",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/640px-Karl_Marx_001.jpg",
    metadata: { period: { start: 1867, end: 1894 }, location: "Londres, Inglaterra" },
    tags: ["Livros", "Economia", "Marx", "Capitalismo", "Revolução Industrial"],
    content: "Das Kapital (vol. I, 1867; vols. II-III póstumos, org. Engels). Marx analisa o modo de produção capitalista: como o trabalho cria valor, como o capitalista extrai mais-valia do trabalhador, como o capital se acumula e se concentra, e por que o sistema tende a crises cíclicas. Fundamento teórico de movimentos socialistas e comunistas do século XX.",
  },
  {
    title: "A Interpretação dos Sonhos",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg/640px-Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg",
    metadata: { period: { start: 1899, end: 1900 }, location: "Viena, Áustria" },
    tags: ["Livros", "Psicologia", "Freud", "Psicanálise", "Inconsciente"],
    content: "Die Traumdeutung (1900) fundou a psicanálise como disciplina. Freud propõe que os sonhos são a \"estrada real\" ao inconsciente, expressando desejos reprimidos através de distorção e simbolismo. Apresenta o complexo de Édipo, os mecanismos de defesa e a estrutura da psique (id, ego, superego nas obras posteriores). Vendeu apenas 351 cópias nos primeiros seis anos.",
  },
  {
    title: "Ulisses",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/James_Joyce_by_Alex_Ehrenzweig%2C_1915_restored.jpg/640px-James_Joyce_by_Alex_Ehrenzweig%2C_1915_restored.jpg",
    metadata: { period: { start: 1922, end: 1922 }, location: "Paris, França (publicado)" },
    tags: ["Livros", "Literatura", "Joyce", "Modernismo", "Stream of Consciousness"],
    content: "Publicado em Paris pela Shakespeare and Company (1922), com a ajuda de Sylvia Beach. 18 capítulos que narram um dia (16 de junho de 1904) em Dublin através de Leopold Bloom, Stephen Dedalus e Molly Bloom. Cada capítulo usa um estilo literário diferente. Proibido nos EUA e Reino Unido por obscenidade. Considerado o maior romance em língua inglesa.",
  },
  {
    title: "A Metamorfose",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_1923.jpg/640px-Franz_Kafka%2C_1923.jpg",
    metadata: { period: { start: 1915, end: 1915 }, location: "Praga, Bohemia" },
    tags: ["Livros", "Literatura", "Kafka", "Modernismo", "Absurdo"],
    content: "\"Ao despertar de Gregor Samsa numa manhã de angústia, ele deu por si transformado num monstruoso inseto.\" A novela (1915) é a mais famosa de Kafka. A transformação em inseto é a alienação do trabalho tornada literal. A família de Gregor aceita a situação com burocrática indiferença. Kafka leu a primeira frase para amigos e chorou de rir — é também uma comédia.",
  },
  {
    title: "Admirável Mundo Novo",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Aldous_Huxley_psychical_researcher.jpg/640px-Aldous_Huxley_psychical_researcher.jpg",
    metadata: { period: { start: 1932, end: 1932 }, location: "Londres, Inglaterra" },
    tags: ["Livros", "Literatura", "Huxley", "Distopia", "Ficção Científica"],
    content: "Brave New World (1932) de Aldous Huxley. Uma distopia diferente de 1984: não o totalitarismo do terror, mas o totalitarismo do prazer e do consumo. Condicionamento genético e químico (soma) produz felicidade sem liberdade. O \"Mundo Novo\" de 2540 d.C. sacrificou arte, religião e família em troca de estabilidade. Huxley considerou-o mais profético que Orwell.",
  },
  {
    title: "O Processo",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Franz_Kafka%2C_1923.jpg/640px-Franz_Kafka%2C_1923.jpg",
    metadata: { period: { start: 1925, end: 1925 }, location: "Praga / Berlim" },
    tags: ["Livros", "Literatura", "Kafka", "Burocracia", "Absurdo", "Modernismo"],
    content: "Josef K. acorda na manhã do seu 30º aniversário e é preso sem saber a acusação. Kafka escreveu O Processo (1914-15, publicado póstumo 1925) no mesmo ano que a Metamorfose. É o retrato definitivo da burocracia como horror: acusação sem motivo, julgamento sem transparência, execução como formalidade. Kafka nunca terminou o romance — mas o final que escreveu é perfeito.",
  },
  {
    title: "Vigiar e Punir",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Foucault5.jpg/640px-Foucault5.jpg",
    metadata: { period: { start: 1975, end: 1975 }, location: "Paris, França" },
    tags: ["Livros", "Filosofia", "Foucault", "Poder", "Prisões", "Pós-Modernismo"],
    content: "Surveiller et Punir (1975): Foucault inicia com o suplício público de Damiens (1757) e termina no Panopticon de Bentham — a prisão onde os guardas podem ver tudo mas os presos nunca sabem quando são observados. A vigilância internalizada cria o \"sujeito disciplinar\": o indivíduo moderno que se auto-policia. Da escola ao hospital, da fábrica ao exército: a mesma arquitetura de poder.",
  },
  {
    title: "A Banalidade do Mal",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Hannah_Arendt_1975.jpg/640px-Hannah_Arendt_1975.jpg",
    metadata: { period: { start: 1963, end: 1963 }, location: "Nova York, EUA" },
    tags: ["Livros", "Filosofia", "Hannah Arendt", "Holocausto", "Ética", "Política"],
    content: "Eichmann in Jerusalem: A Report on the Banality of Evil (1963). Arendt cobriu o julgamento de Adolf Eichmann em Jerusalém para a New Yorker. Conclusão controversa: Eichmann não era um monstro, mas um burocrata medíocre incapaz de pensar moralmente. O mal extremo pode ser perpetrado sem intenção maligna — apenas pela obediência acrítica a ordens.",
  },
  {
    title: "Sapiens: Uma Breve História da Humanidade",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Sapiens_A_Brief_History_of_Humankind%2C_book_cover.jpg/640px-Sapiens_A_Brief_History_of_Humankind%2C_book_cover.jpg",
    metadata: { period: { start: 2011, end: 2011 }, location: "Israel / Global" },
    tags: ["Livros", "História", "Harari", "Humanidade", "Contemporâneo"],
    content: "Yuval Noah Harari narra 70.000 anos da história humana do Homo sapiens — da Revolução Cognitiva à Revolução Agrícola, à Revolução Científica e à unificação global. Tese central: o que nos torna únicos é a capacidade de acreditar em ficções coletivas (nações, dinheiro, direitos humanos, religião). Traduzido para 65 idiomas, 25 milhões de cópias.",
  },
  {
    title: "A Estrutura das Revoluções Científicas",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Thomas_Kuhn.jpg/640px-Thomas_Kuhn.jpg",
    metadata: { period: { start: 1962, end: 1962 }, location: "Chicago, EUA" },
    tags: ["Livros", "Filosofia da Ciência", "Kuhn", "Paradigma", "Epistemologia"],
    content: "The Structure of Scientific Revolutions (1962) de Thomas Kuhn. Propõe que a ciência não avança por acumulação linear, mas por \"revoluções\": longos períodos de ciência normal dentro de um paradigma, seguidos de crises e mudança de paradigma (Copérnico, Newton, Einstein, Quântica). Introduziu \"paradigma\" no vocabulário cultural. Livro acadêmico mais citado de todos os tempos.",
  },
  {
    title: "Guerra e Paz",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/640px-L.N.Tolstoy_Prokudin-Gorsky.jpg",
    metadata: { period: { start: 1869, end: 1869 }, location: "Rússia" },
    tags: ["Livros", "Literatura", "Tolstói", "Rússia", "Romance Histórico", "Napoleão"],
    content: "Voyna i mir (1869) de Leon Tolstói. O maior romance da literatura russa: 580 personagens, a invasão napoleônica da Rússia (1812), cinco famílias aristocráticas, quatro volumes. Tolstói rejeita o \"grande homem\" da história (Napoleão, Alexandre) em favor das forças anônimas que moldam os eventos. Mais uma filosofia da história narrada como ficção do que um romance convencional.",
  },
  {
    title: "Assim Falou Zaratustra",
    type: "READING", area: "ACADEMIA",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/640px-Nietzsche187a.jpg",
    metadata: { period: { start: 1883, end: 1885 }, location: "Sils Maria / Roma" },
    tags: ["Livros", "Filosofia", "Nietzsche", "Super-Homem", "Niilismo"],
    content: "Also sprach Zarathustra (1883-85). Nietzsche usa o profeta Zaratustra para proclamar a morte de Deus e propor o Übermensch (Super-Homem) como ideal além do bem e do mal cristãos. O eterno retorno — viver de forma que desejarias repetir infinitamente — é seu maior desafio existencial. Richard Strauss transformou o incipit em sinfonismo (usado em 2001: Odisseia no Espaço).",
  },
  {
    title: "Diário de Anne Frank",
    type: "READING", area: "ARTES",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Anne_Frank_crop.jpg/640px-Anne_Frank_crop.jpg",
    metadata: { period: { start: 1942, end: 1944 }, location: "Amsterdã, Países Baixos" },
    tags: ["Livros", "História", "Holocausto", "Segunda Guerra Mundial", "Testemunho"],
    content: "Escrito entre junho de 1942 e agosto de 1944 pela adolescente judia Anne Frank, escondida com sua família no annexo secreto em Amsterdã. Publicado pelo pai Otto Frank (único sobrevivente) em 1947. Traduzido para 70 idiomas. Humaniza o Holocausto através de uma voz íntima e literária. Anne Frank foi descoberta, deportada a Bergen-Belsen, e morreu aos 15 anos em março de 1945.",
  },
]

// ── TOMÁS DE AQUINO (autor referenciado nos livros) ───────────────────────────

const EXTRA_AUTHORS: SeedItem[] = [
  {
    title: "Tomás de Aquino",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/St-thomas-aquinas.jpg/640px-St-thomas-aquinas.jpg",
    metadata: { period: { start: 1225, end: 1274 }, location: "Aquino / Paris / Nápoles" },
    tags: ["Filósofos", "Pessoas", "Escolástica", "Religião", "Idade Média"],
    content: "Frade dominicano italiano, doutor da Igreja Católica. A Suma Teológica é sua obra maior. Reconciliou o pensamento aristotélico com a teologia cristã, criando o tomismo. Canonizado em 1323. Declarado Doutor da Igreja em 1567. Base filosófica do catolicismo até hoje.",
  },
  {
    title: "Aldous Huxley",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Aldous_Huxley_psychical_researcher.jpg/640px-Aldous_Huxley_psychical_researcher.jpg",
    metadata: { period: { start: 1894, end: 1963 }, location: "Surrey, Inglaterra" },
    tags: ["Escritores", "Pessoas", "Ficção Científica", "Distopia", "Filosofia"],
    content: "Romancista, ensaísta e humanista britânico. Membro de uma família de cientistas (neto de T. H. Huxley). Admirável Mundo Novo (1932) é sua obra mais conhecida. Em seus últimos anos pesquisou estados alterados de consciência com mescalina (As Portas da Percepção, 1954). Morreu no mesmo dia que JFK e C. S. Lewis (22 nov 1963).",
  },
  {
    title: "Yuval Noah Harari",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Yuval_Noah_Harari_2022_%28cropped%29.jpg/640px-Yuval_Noah_Harari_2022_%28cropped%29.jpg",
    metadata: { period: { start: 1976, end: 2026 }, location: "Israel" },
    tags: ["Historiadores", "Pessoas", "Contemporâneo", "Filosofia", "Humanidade"],
    content: "Historiador israelense e professor na Universidade Hebraica de Jerusalém. Sapiens (2011) tornou-se um dos livros de não-ficção mais vendidos do século XXI. Homo Deus (2015) e 21 Lições para o Século 21 (2018) completam a trilogia. Assessor intelectual de líderes mundiais sobre IA, bioengenharia e o futuro da humanidade.",
  },
  {
    title: "Thomas Kuhn",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Thomas_Kuhn.jpg/640px-Thomas_Kuhn.jpg",
    metadata: { period: { start: 1922, end: 1996 }, location: "Cincinnati / Cambridge, EUA" },
    tags: ["Filósofos", "Pessoas", "Filosofia da Ciência", "Epistemologia", "Academia"],
    content: "Físico e historiador da ciência americano. A Estrutura das Revoluções Científicas (1962) transformou a compreensão de como a ciência funciona. Cunhou \"paradigma\" e \"ciência normal\". O livro mais citado de qualquer área acadêmica no século XX. Trabalhou em Harvard, Berkeley, Princeton e MIT.",
  },
  {
    title: "Leon Tolstói",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/640px-L.N.Tolstoy_Prokudin-Gorsky.jpg",
    metadata: { period: { start: 1828, end: 1910 }, location: "Yasnaya Polyana, Rússia" },
    tags: ["Escritores", "Pessoas", "Literatura", "Rússia", "Realismo"],
    content: "Conde russo, um dos maiores romancistas da história. Guerra e Paz (1869) e Anna Kariênina (1877) são picos do realismo literário. Em seus últimos 30 anos, tornou-se pregador de um Cristianismo radical, pacifista e vegetariano. Gandhi foi profundamente influenciado por Tolstói. Excomunhado pela Igreja Ortodoxa Russa em 1901.",
  },
  {
    title: "Anne Frank",
    type: "PERSON", area: "PESSOAS",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Anne_Frank_crop.jpg/640px-Anne_Frank_crop.jpg",
    metadata: { period: { start: 1929, end: 1945 }, location: "Frankfurt / Amsterdã" },
    tags: ["Escritores", "Pessoas", "Holocausto", "Segunda Guerra Mundial", "Testemunho"],
    content: "Adolescente judia alemã cuja família fugiu para os Países Baixos. Escondeu-se com a família por dois anos no Annexo Secreto em Amsterdã. Descoberta pela Gestapo em 1944, morreu de tifo em Bergen-Belsen em março de 1945. Seu diário, publicado pelo pai em 1947, tornou-se o documento humano mais lido sobre o Holocausto.",
  },
]

// ── RELAÇÕES ──────────────────────────────────────────────────────────────────

const RELATIONS: SeedRelation[] = [
  // Sequência temporal das eras
  { from: "Paleolítico",            to: "Neolítico",                type: "precede" },
  { from: "Neolítico",              to: "Era do Bronze",             type: "precede" },
  { from: "Era do Bronze",          to: "Era do Ferro",              type: "precede" },
  { from: "Era do Ferro",           to: "Grécia Clássica",           type: "precede" },
  { from: "Grécia Clássica",        to: "Período Helenístico",       type: "precede" },
  { from: "Período Helenístico",    to: "Idade Média Europeia",      type: "precede" },
  { from: "Egito Antigo",           to: "Grécia Clássica",           type: "influenciou" },
  { from: "Pérsia Aquemênida",      to: "Grécia Clássica",           type: "influenciou" },
  { from: "Grécia Clássica",        to: "Renascimento Italiano",     type: "influenciou" },
  { from: "China Clássica",         to: "Era das Grandes Navegações",type: "influenciou" },
  { from: "Índia Clássica",         to: "Idade de Ouro Islâmica",    type: "influenciou" },
  { from: "Idade de Ouro Islâmica", to: "Renascimento Italiano",     type: "influenciou" },
  { from: "Idade Média Europeia",   to: "Renascimento Italiano",     type: "precede" },
  { from: "Renascimento Italiano",  to: "Reforma Protestante",       type: "precede" },
  { from: "Renascimento Italiano",  to: "Revolução Científica",      type: "precede" },
  { from: "Revolução Científica",   to: "Iluminismo",                type: "precede" },
  { from: "Iluminismo",             to: "Revolução Francesa",        type: "influenciou" },
  { from: "Revolução Francesa",     to: "Revolução Industrial",      type: "precede" },
  { from: "Revolução Industrial",   to: "Modernismo",                type: "influenciou" },
  { from: "Modernismo",             to: "Primeira Guerra Mundial",   type: "é parte de" },
  { from: "Primeira Guerra Mundial",to: "Segunda Guerra Mundial",    type: "precede" },
  { from: "Segunda Guerra Mundial", to: "Guerra Fria",               type: "precede" },
  { from: "Guerra Fria",            to: "Era Digital",               type: "precede" },

  // Autores → Eras
  { from: "Homero",           to: "Grécia Clássica",     type: "é parte de" },
  { from: "Platão",           to: "Grécia Clássica",     type: "é parte de" },
  { from: "Heródoto",         to: "Grécia Clássica",     type: "é parte de" },
  { from: "Aristóteles",      to: "Grécia Clássica",     type: "é parte de" },
  { from: "Júlio César",      to: "Pérsia Aquemênida",   type: "ver também" },
  { from: "Marco Aurélio",    to: "Grécia Clássica",     type: "foi influenciado por" },
  { from: "Confúcio",         to: "China Clássica",      type: "é parte de" },
  { from: "Sun Tzu",          to: "China Clássica",      type: "é parte de" },
  { from: "Dante Alighieri",  to: "Idade Média Europeia",type: "é parte de" },
  { from: "Niccolò Maquiavel",to: "Renascimento Italiano",type: "é parte de" },
  { from: "Nicolau Copérnico",to: "Revolução Científica", type: "é parte de" },
  { from: "Galileu Galilei",  to: "Revolução Científica", type: "é parte de" },
  { from: "René Descartes",   to: "Revolução Científica", type: "é parte de" },
  { from: "Francis Bacon",    to: "Revolução Científica", type: "é parte de" },
  { from: "Isaac Newton",     to: "Revolução Científica", type: "é parte de" },
  { from: "Jean-Jacques Rousseau", to: "Iluminismo",     type: "é parte de" },
  { from: "Voltaire",         to: "Iluminismo",           type: "é parte de" },
  { from: "Adam Smith",       to: "Iluminismo",           type: "é parte de" },
  { from: "Karl Marx",        to: "Revolução Industrial", type: "é parte de" },
  { from: "Friedrich Nietzsche", to: "Modernismo",       type: "influenciou" },
  { from: "Franz Kafka",      to: "Modernismo",           type: "é parte de" },
  { from: "James Joyce",      to: "Modernismo",           type: "é parte de" },
  { from: "Virginia Woolf",   to: "Modernismo",           type: "é parte de" },
  { from: "George Orwell",    to: "Segunda Guerra Mundial",type: "é parte de" },
  { from: "George Orwell",    to: "Guerra Fria",          type: "influenciou" },
  { from: "Hannah Arendt",    to: "Segunda Guerra Mundial",type: "é parte de" },
  { from: "Michel Foucault",  to: "Pós-Modernismo",       type: "é parte de" },
  { from: "Avicena (Ibn Sina)",to: "Idade de Ouro Islâmica",type: "é parte de" },
  { from: "Al-Khwarizmi",     to: "Idade de Ouro Islâmica",type: "é parte de" },

  // Autores → obras que criaram
  { from: "Homero",            to: "Ilíada",                         type: "criou" },
  { from: "Homero",            to: "Odisseia",                       type: "criou" },
  { from: "Platão",            to: "A República",                    type: "criou" },
  { from: "Aristóteles",       to: "Ética a Nicômaco",               type: "criou" },
  { from: "Júlio César",       to: "De Bello Gallico",               type: "criou" },
  { from: "Marco Aurélio",     to: "Meditações",                     type: "criou" },
  { from: "Confúcio",          to: "Analetos de Confúcio",           type: "criou" },
  { from: "Sun Tzu",           to: "A Arte da Guerra",               type: "criou" },
  { from: "Dante Alighieri",   to: "A Divina Comédia",               type: "criou" },
  { from: "Niccolò Maquiavel", to: "O Príncipe",                     type: "criou" },
  { from: "Nicolau Copérnico", to: "De Revolutionibus Orbium Coelestium", type: "criou" },
  { from: "Francis Bacon",     to: "Novum Organum",                  type: "criou" },
  { from: "René Descartes",    to: "Discurso do Método",             type: "criou" },
  { from: "Isaac Newton",      to: "Principia Mathematica",          type: "criou" },
  { from: "Jean-Jacques Rousseau", to: "Contrato Social",            type: "criou" },
  { from: "Voltaire",          to: "Cândido",                        type: "criou" },
  { from: "Adam Smith",        to: "A Riqueza das Nações",           type: "criou" },
  { from: "Karl Marx",         to: "O Capital",                      type: "criou" },
  { from: "Franz Kafka",       to: "A Metamorfose",                  type: "criou" },
  { from: "Franz Kafka",       to: "O Processo",                     type: "criou" },
  { from: "James Joyce",       to: "Ulisses",                        type: "criou" },
  { from: "George Orwell",     to: "1984",                           type: "criou" },
  { from: "Hannah Arendt",     to: "A Banalidade do Mal",            type: "criou" },
  { from: "Michel Foucault",   to: "Vigiar e Punir",                 type: "criou" },
  { from: "Friedrich Nietzsche", to: "Assim Falou Zaratustra",       type: "criou" },
  { from: "Aldous Huxley",     to: "Admirável Mundo Novo",           type: "criou" },
  { from: "Tomás de Aquino",   to: "Suma Teológica",                 type: "criou" },
  { from: "Leon Tolstói",      to: "Guerra e Paz",                   type: "criou" },
  { from: "Yuval Noah Harari", to: "Sapiens: Uma Breve História da Humanidade", type: "criou" },
  { from: "Thomas Kuhn",       to: "A Estrutura das Revoluções Científicas",  type: "criou" },
  { from: "Anne Frank",        to: "Diário de Anne Frank",           type: "criou" },

  // Livros → eras que cobrem/referenciam
  { from: "Epopeia de Gilgamesh", to: "Mesopotâmia",          type: "referência" },
  { from: "Epopeia de Gilgamesh", to: "Era do Bronze",         type: "referência" },
  { from: "Ilíada",               to: "Grécia Clássica",       type: "referência" },
  { from: "Odisseia",             to: "Grécia Clássica",       type: "referência" },
  { from: "A República",          to: "Grécia Clássica",       type: "referência" },
  { from: "Ética a Nicômaco",     to: "Grécia Clássica",       type: "referência" },
  { from: "De Bello Gallico",     to: "Império Romano",        type: "referência" },
  { from: "Meditações",           to: "Império Romano",        type: "referência" },
  { from: "A Arte da Guerra",     to: "China Clássica",        type: "referência" },
  { from: "Analetos de Confúcio", to: "China Clássica",        type: "referência" },
  { from: "Bhagavad Gita",        to: "Índia Clássica",        type: "referência" },
  { from: "Suma Teológica",       to: "Idade Média Europeia",  type: "referência" },
  { from: "A Divina Comédia",     to: "Idade Média Europeia",  type: "referência" },
  { from: "O Príncipe",           to: "Renascimento Italiano", type: "referência" },
  { from: "De Revolutionibus Orbium Coelestium", to: "Revolução Científica", type: "referência" },
  { from: "Novum Organum",        to: "Revolução Científica",  type: "referência" },
  { from: "Discurso do Método",   to: "Revolução Científica",  type: "referência" },
  { from: "Principia Mathematica",to: "Revolução Científica",  type: "referência" },
  { from: "Contrato Social",      to: "Iluminismo",            type: "referência" },
  { from: "Cândido",              to: "Iluminismo",            type: "referência" },
  { from: "A Riqueza das Nações", to: "Revolução Industrial",  type: "referência" },
  { from: "O Capital",            to: "Revolução Industrial",  type: "referência" },
  { from: "A Interpretação dos Sonhos", to: "Modernismo",      type: "referência" },
  { from: "Ulisses",              to: "Modernismo",            type: "referência" },
  { from: "A Metamorfose",        to: "Modernismo",            type: "referência" },
  { from: "Admirável Mundo Novo", to: "Guerra Fria",           type: "referência" },
  { from: "O Processo",           to: "Modernismo",            type: "referência" },
  { from: "1984",                 to: "Segunda Guerra Mundial",type: "referência" },
  { from: "1984",                 to: "Guerra Fria",           type: "referência" },
  { from: "A Banalidade do Mal",  to: "Segunda Guerra Mundial",type: "referência" },
  { from: "Vigiar e Punir",       to: "Era Digital",           type: "ver também" },
  { from: "Sapiens: Uma Breve História da Humanidade", to: "Paleolítico",   type: "referência" },
  { from: "Sapiens: Uma Breve História da Humanidade", to: "Neolítico",     type: "referência" },
  { from: "Sapiens: Uma Breve História da Humanidade", to: "Revolução Industrial", type: "referência" },
  { from: "A Estrutura das Revoluções Científicas", to: "Revolução Científica", type: "referência" },
  { from: "Guerra e Paz",         to: "Revolução Francesa",    type: "referência" },
  { from: "Assim Falou Zaratustra", to: "Modernismo",          type: "influenciou" },
  { from: "Diário de Anne Frank", to: "Segunda Guerra Mundial",type: "referência" },
]

// ── Seed execution ────────────────────────────────────────────────────────────

async function upsertItem(item: SeedItem): Promise<string | null> {
  const existing = await prisma.atlasItem.findFirst({ where: { title: item.title } })
  if (existing) {
    console.log(`  ↳ Já existe: ${item.title}`)
    return existing.id
  }

  const { tags, metadata, ...fields } = item
  const created = await prisma.atlasItem.create({
    data: {
      ...fields,
      metadata:   metadata ? JSON.stringify(metadata) : undefined,
      status:     "ACTIVE",
      hemisphere: "PORTAL",
      tags: {
        connectOrCreate: tags.map((name) => ({
          where:  { name },
          create: { name },
        })),
      },
    },
  })
  console.log(`  ✓ ${item.title}`)
  return created.id
}

async function main() {
  const allItems = [...ERAS, ...AUTHORS, ...BOOKS, ...EXTRA_AUTHORS]

  console.log(`\n🌍 Semeando ${allItems.length} itens (eras, autores, obras)...\n`)
  for (const item of allItems) {
    await upsertItem(item)
  }

  // ── Relações ──────────────────────────────────────────────────────────────
  console.log(`\n🔗 Criando ${RELATIONS.length} relações...\n`)

  for (const rel of RELATIONS) {
    const from = await prisma.atlasItem.findFirst({ where: { title: rel.from } })
    const to   = await prisma.atlasItem.findFirst({ where: { title: rel.to   } })
    if (!from) { console.log(`  ⚠ Não encontrado (from): ${rel.from}`); continue }
    if (!to)   { console.log(`  ⚠ Não encontrado (to):   ${rel.to}`);   continue }

    const existing = await prisma.atlasRelation.findFirst({
      where: { fromItemId: from.id, toItemId: to.id, relationType: rel.type },
    })
    if (existing) continue

    await prisma.atlasRelation.create({
      data: { fromItemId: from.id, toItemId: to.id, relationType: rel.type },
    })
    console.log(`  ✓ ${rel.from} → [${rel.type}] → ${rel.to}`)
  }

  console.log("\n✓ Seed de eras completo!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
