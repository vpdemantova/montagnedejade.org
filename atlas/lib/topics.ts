// ── Sistema de tópicos filosóficos da Academia ────────────────────────────────
// Estrutura preparada para 30+ tópicos.
// Relações entre tópicos podem ser editadas livremente via `relatedSlugs`.

export type Topic = {
  slug:         string
  title:        string
  subtitle:     string
  description:  string
  questions:    string[]        // perguntas abertas para reflexão
  relatedSlugs: string[]        // slugs de tópicos relacionados
  tags:         string[]
  entryQuestion?: boolean       // se aparece como questão no EntryCard
  entryIndex?:    number         // posição no EntryCard (0, 1, 2)
}

export const TOPICS: Topic[] = [
  // ── Os 3 tópicos do EntryCard ──────────────────────────────────────────────
  {
    slug:         "guerras-e-paz",
    title:        "Guerras e Paz",
    subtitle:     "Porque existem guerras — e como elas poderiam acabar?",
    description:  `A guerra é uma constante na história humana. Mas por que? Recursos, ideologia, poder, medo — ou algo mais profundo na nossa natureza?

Antropólogos debatem se a violência organizada é intrínseca à espécie ou uma invenção cultural relativamente recente. Steven Pinker argumenta que vivemos o período mais pacífico da história. Outros discordam.

O que é certo: guerras sempre tiveram custos imensos — e as civilizações que duraram foram as que encontraram formas de coexistir. Da Pax Romana ao projeto europeu pós-1945, há padrões que funcionaram.

A questão não é utópica. É prática: quais estruturas, instituições e culturas reduzem a probabilidade de conflito armado?`,
    questions: [
      "A violência humana é biológica ou cultural?",
      "Quais condições históricas levaram a períodos de paz duradoura?",
      "Como a desigualdade econômica alimenta conflitos armados?",
      "O que a diplomacia moderna tem de diferente das anteriores?",
      "Existe guerra justa? Quais seriam seus critérios?",
    ],
    relatedSlugs: ["conflitos-humanos", "poder-e-politica", "justica-e-lei", "desigualdade-global"],
    tags:         ["guerra", "paz", "política", "história", "violência"],
    entryQuestion: true,
    entryIndex:    0,
  },
  {
    slug:         "conflitos-humanos",
    title:        "Conflitos entre Humanos",
    subtitle:     "Porque temos conflitos com outros humanos?",
    description:  `O conflito interpessoal é universal. Em famílias, comunidades, trabalho — as pessoas discordam, magoam, rivalizam. Mas por quê?

A psicologia evolutiva sugere que competimos por recursos, status e reprodução. A psicanálise aponta para projeções, transferências e o inconsciente. A filosofia budista vê o ego como a raiz de todo conflito.

Mas há algo mais sutil: muitas vezes conflitamos porque valorizamos coisas diferentes — e não conseguimos comunicar esse fato sem ameaça. A Comunicação Não-Violenta de Marshall Rosenberg propõe que todo conflito esconde uma necessidade não atendida.

Entender o conflito não é eliminá-lo — é usá-lo como informação sobre o que é importante para as pessoas envolvidas.`,
    questions: [
      "O que está por baixo de um conflito quando as pessoas brigam por 'bobagens'?",
      "Como o ego constrói narrativas que justificam o conflito?",
      "Existe diferença entre conflito saudável e destrutivo?",
      "Como culturas diferentes lidam com o desentendimento?",
      "O que a mediação de conflitos ensina sobre a natureza humana?",
    ],
    relatedSlugs: ["guerras-e-paz", "emocoes-e-razao", "comunicacao-e-linguagem", "ego-e-identidade"],
    tags:         ["conflito", "psicologia", "relacionamentos", "comunicação"],
    entryQuestion: true,
    entryIndex:    1,
  },
  {
    slug:         "vida-integral",
    title:        "Vida Integral",
    subtitle:     "Como passar os dias de forma integral, expressando suas únicas ações e vontades?",
    description:  `Existir de forma plena — não apenas sobreviver, mas habitar o próprio tempo com intenção — é uma das questões mais antigas da filosofia prática.

Os estoicos propunham viver conforme a natureza e a razão. Os epicuristas valorizavam o prazer simples e a amizade. Thoreau foi para Walden Pond descobrir "o essencial". Hoje, movimentos de slow living e mindfulness recolocam essa questão em termos contemporâneos.

Mas há uma tensão: o mundo moderno exige produtividade constante, conexão permanente, performance. Viver integralmente parece um luxo ou uma resistência.

A questão real não é como desacelerar, mas como encontrar seu próprio ritmo dentro da complexidade do presente.`,
    questions: [
      "O que significa para você um dia bem vivido?",
      "Como distinguir o que é genuinamente seu do que é expectativa externa?",
      "Atenção é um recurso finito — como você a direciona?",
      "Quais práticas concretas sustentam uma vida mais intencional?",
      "Como o trabalho pode ser expressão e não apenas meio?",
    ],
    relatedSlugs: ["tempo-e-mortalidade", "prazer-e-felicidade", "trabalho-e-criacao", "silencio-e-contemplacao"],
    tags:         ["existência", "filosofia prática", "atenção", "intenção", "presença"],
    entryQuestion: true,
    entryIndex:    2,
  },

  // ── Tópicos adicionais (estrutura para completar até 30+) ─────────────────
  {
    slug:        "poder-e-politica",
    title:       "Poder e Política",
    subtitle:    "Como o poder se organiza e corrupe — e o que fazer com isso?",
    description: `Do Leviatã de Hobbes à biopolítica de Foucault, o poder é objeto de estudo permanente. Quem tem o direito de governar? O que legitima uma ordem política? Como resistir ao abuso?`,
    questions:   ["O que corrói uma democracia?", "Existe poder sem violência?", "Como a linguagem é usada para controlar?"],
    relatedSlugs:["guerras-e-paz", "justica-e-lei", "desigualdade-global"],
    tags:        ["política", "poder", "democracia", "filosofia política"],
  },
  {
    slug:        "justica-e-lei",
    title:       "Justiça e Lei",
    subtitle:    "Justiça é o que a lei diz — ou algo além?",
    description: `Leis mudam. Escravidão foi legal. Hoje, o que era crime ontem pode ser direito amanhã. Isso levanta uma questão: justiça é convenção social ou há algo universal?`,
    questions:   ["Pode haver lei injusta?", "O que Rawls quis dizer com 'véu da ignorância'?", "Como reparar injustiças históricas?"],
    relatedSlugs:["poder-e-politica", "etica-e-moral", "desigualdade-global"],
    tags:        ["justiça", "direito", "ética", "sociedade"],
  },
  {
    slug:        "desigualdade-global",
    title:       "Desigualdade Global",
    subtitle:    "Por que uns nascem com tudo e outros sem nada?",
    description: `1% da humanidade detém mais riqueza que os outros 99%. Isso é acidente histórico, estrutura sistêmica ou escolha moral coletiva?`,
    questions:   ["A desigualdade é inevitável ou construída?", "Meritocracia é mito ou realidade?", "Quais modelos econômicos reduziram a pobreza efetivamente?"],
    relatedSlugs:["justica-e-lei", "trabalho-e-criacao", "poder-e-politica"],
    tags:        ["economia", "desigualdade", "pobreza", "capitalismo"],
  },
  {
    slug:        "etica-e-moral",
    title:       "Ética e Moral",
    subtitle:    "Como saber o que é certo fazer?",
    description: `Consequencialismo, deontologia, ética das virtudes — cada sistema responde diferente. E na vida real, as escolhas são sempre impuras.`,
    questions:   ["Existe uma ação completamente boa?", "Como ética e cultura se relacionam?", "O que fazer quando dois valores corretos conflitam?"],
    relatedSlugs:["justica-e-lei", "emocoes-e-razao", "vida-integral"],
    tags:        ["ética", "moral", "filosofia", "valores"],
  },
  {
    slug:        "emocoes-e-razao",
    title:       "Emoções e Razão",
    subtitle:    "Sentir e pensar são opostos — ou complementares?",
    description: `O Iluminismo privilegiou a razão. A psicanálise revelou o inconsciente. A neurociência mostrou que emoções são inseparáveis da decisão. Damasio: sem emoção, não há razão funcional.`,
    questions:   ["Suas decisões são mais racionais ou emocionais do que você imagina?", "Como processar emoções sem ser controlado por elas?", "O que é inteligência emocional de verdade?"],
    relatedSlugs:["conflitos-humanos", "ego-e-identidade", "silencio-e-contemplacao"],
    tags:        ["psicologia", "emoções", "razão", "neurociência"],
  },
  {
    slug:        "ego-e-identidade",
    title:       "Ego e Identidade",
    subtitle:    "Quem é o 'eu' que pensa que existe?",
    description: `O budismo diz que o ego é ilusão. Sartre diz que somos o que fazemos. A neurociência diz que o 'eu' é construção narrativa do cérebro. E você?`,
    questions:   ["Você seria a mesma pessoa em outro contexto cultural?", "O que permanece quando tudo muda?", "Como o nome que carregamos molda quem somos?"],
    relatedSlugs:["emocoes-e-razao", "silencio-e-contemplacao", "comunicacao-e-linguagem"],
    tags:        ["identidade", "ego", "filosofia", "psicologia"],
  },
  {
    slug:        "comunicacao-e-linguagem",
    title:       "Comunicação e Linguagem",
    subtitle:    "A linguagem nos liberta ou nos aprisiona?",
    description: `Wittgenstein: os limites da minha linguagem são os limites do meu mundo. Mas linguagem também pode ser manipulação, propaganda, violência simbólica.`,
    questions:   ["Você consegue pensar sem palavras?", "Como o vocabulário que temos molda o que conseguimos sentir?", "O que se perde na tradução entre culturas?"],
    relatedSlugs:["conflitos-humanos", "ego-e-identidade", "arte-e-expressao"],
    tags:        ["linguagem", "comunicação", "filosofia", "semiótica"],
  },
  {
    slug:        "tempo-e-mortalidade",
    title:       "Tempo e Mortalidade",
    subtitle:    "O que fazemos com o fato de que vamos morrer?",
    description: `Heidegger: ser-para-a-morte é o que torna a existência autêntica. Os epicuristas: quando a morte é, eu não sou; quando eu sou, ela não é. Como cada cultura lida com o fim?`,
    questions:   ["Como a consciência da morte muda suas prioridades?", "O que você quer que sobre de você?", "Como diferentes culturas elaboram o luto?"],
    relatedSlugs:["vida-integral", "prazer-e-felicidade", "silencio-e-contemplacao"],
    tags:        ["morte", "tempo", "existência", "espiritualidade"],
  },
  {
    slug:        "prazer-e-felicidade",
    title:       "Prazer e Felicidade",
    subtitle:    "O que nos faz genuinamente bem?",
    description: `Epicuro e John Stuart Mill distinguiram prazeres altos e baixos. Positive psychology mede o bem-estar. Mas felicidade é estado, trajetória ou objetivo?`,
    questions:   ["O que você sacrificaria pelo prazer imediato versus bem-estar duradouro?", "Hedônia e eudaimonia são compatíveis?", "O que a cultura do entretenimento faz com nossa capacidade de estar bem?"],
    relatedSlugs:["vida-integral", "tempo-e-mortalidade", "trabalho-e-criacao"],
    tags:        ["felicidade", "prazer", "psicologia positiva", "bem-estar"],
  },
  {
    slug:        "trabalho-e-criacao",
    title:       "Trabalho e Criação",
    subtitle:    "O que dá sentido ao que fazemos?",
    description: `Marx: alienação separa o trabalhador do produto. Csikszentmihalyi: flow é quando trabalho e prazer se tornam um. Mas o que torna um trabalho significativo?`,
    questions:   ["Você cria ou apenas executa?", "Como transformar obrigação em expressão?", "O que o trabalho automatizado vai mudar na identidade humana?"],
    relatedSlugs:["vida-integral", "prazer-e-felicidade", "desigualdade-global"],
    tags:        ["trabalho", "criação", "sentido", "economia", "arte"],
  },
  {
    slug:        "silencio-e-contemplacao",
    title:       "Silêncio e Contemplação",
    subtitle:    "O que acontece quando paramos de fazer?",
    description: `Todas as tradições sapienciais têm práticas contemplativas: meditação, oração, contemplação. No mundo contemporâneo, o silêncio tornou-se raro e até perturbador.`,
    questions:   ["Você consegue ficar sem estímulos por quanto tempo?", "O que emerge quando não há distração?", "Contemplação é fuga ou profundidade?"],
    relatedSlugs:["tempo-e-mortalidade", "emocoes-e-razao", "vida-integral"],
    tags:        ["silêncio", "meditação", "contemplação", "espiritualidade"],
  },
  {
    slug:        "arte-e-expressao",
    title:       "Arte e Expressão",
    subtitle:    "Para que serve a arte — e o que é arte afinal?",
    description: `Desde Platão (perigosa imitação) até Beuys (todo homem é um artista), o lugar da arte oscila. O que a arte faz que a ciência não consegue?`,
    questions:   ["Arte precisa ser bonita para ser arte?", "O que você expressa que não consegue colocar em palavras?", "Como a arte modifica quem a faz?"],
    relatedSlugs:["comunicacao-e-linguagem", "trabalho-e-criacao", "beleza-e-estetica"],
    tags:        ["arte", "expressão", "estética", "criatividade"],
  },
  {
    slug:        "beleza-e-estetica",
    title:       "Beleza e Estética",
    subtitle:    "O belo existe ou é construído?",
    description: `Kant: o belo é universal mas subjetivo. Bourdieu: o gosto é distinção social. A neurociência encontra padrões comuns em percepção de beleza. Então — o que é belo?`,
    questions:   ["Existe feio absoluto?", "Como o contexto cultural molda o que achamos belo?", "A beleza nos faz melhores pessoas?"],
    relatedSlugs:["arte-e-expressao", "natureza-e-ecologia"],
    tags:        ["estética", "beleza", "filosofia", "arte"],
  },
  {
    slug:        "natureza-e-ecologia",
    title:       "Natureza e Ecologia",
    subtitle:    "Fazemos parte da natureza — ou estamos contra ela?",
    description: `O Antropoceno é uma nova era geológica definida pelo impacto humano. Mas a separação entre humano e natureza é filosófica antes de ser ecológica.`,
    questions:   ["A crise climática é técnica ou espiritual?", "Como reconstruir uma relação simbiótica com o planeta?", "O que a ecologia profunda propõe?"],
    relatedSlugs:["ciencia-e-tecnologia", "desigualdade-global", "tempo-e-mortalidade"],
    tags:        ["ecologia", "natureza", "clima", "sustentabilidade"],
  },
  {
    slug:        "ciencia-e-tecnologia",
    title:       "Ciência e Tecnologia",
    subtitle:    "O conhecimento científico nos salva — ou pode nos destruir?",
    description: `A ciência é a melhor ferramenta para entender o mundo. Mas não responde perguntas de valor. E a tecnologia que ela produz tem consequências não previstas.`,
    questions:   ["Existe neutralidade científica?", "Como comunicar ciência sem distorcê-la?", "A inteligência artificial é ferramenta ou sujeito?"],
    relatedSlugs:["natureza-e-ecologia", "poder-e-politica", "educacao-e-aprendizado"],
    tags:        ["ciência", "tecnologia", "IA", "epistemologia"],
  },
  {
    slug:        "educacao-e-aprendizado",
    title:       "Educação e Aprendizado",
    subtitle:    "O que significa aprender — e para quê?",
    description: `Freire: educação bancária deposita informação; educação libertadora transforma. O que a escola realmente ensina? E o que devia ensinar mas não ensina?`,
    questions:   ["Você aprendeu mais dentro ou fora da escola?", "O que uma boa educação deveria produzir?", "Como aprender a aprender?"],
    relatedSlugs:["ciencia-e-tecnologia", "poder-e-politica", "infancia-e-formacao"],
    tags:        ["educação", "aprendizado", "pedagogia", "escola"],
  },
  {
    slug:        "infancia-e-formacao",
    title:       "Infância e Formação",
    subtitle:    "Quem fomos nos molda mais do que imaginamos?",
    description: `Os primeiros anos definem padrões neurológicos, apego, linguagem e mundo interno. Mas a formação nunca termina. O que herdamos e o que construímos?`,
    questions:   ["Que crença sua vem da infância e você nunca questionou?", "Como cuidamos de quem ainda está sendo formado?", "O que uma sociedade deve às suas crianças?"],
    relatedSlugs:["educacao-e-aprendizado", "emocoes-e-razao", "ego-e-identidade"],
    tags:        ["infância", "desenvolvimento", "psicologia", "família"],
  },
  {
    slug:        "corpo-e-saude",
    title:       "Corpo e Saúde",
    subtitle:    "O corpo é instrumento ou sujeito?",
    description: `Descartes separou mente e corpo. A fenomenologia reuniu. Hoje, a medicina integrativa, o yoga e a neurociência reconhecem que o corpo é o primeiro campo de experiência.`,
    questions:   ["Você habita seu corpo ou o usa?", "Como a saúde mental e física se afetam?", "O que o prazer físico nos ensina sobre existir?"],
    relatedSlugs:["emocoes-e-razao", "prazer-e-felicidade", "silencio-e-contemplacao"],
    tags:        ["corpo", "saúde", "medicina", "bem-estar"],
  },
  {
    slug:        "amor-e-relacoes",
    title:       "Amor e Relações",
    subtitle:    "O que é amar — e o que o amor nos pede?",
    description: `Eros, filia, agape, storge — os gregos tinham palavras para o que nós comprimimos em uma. O amor romântico como o conhecemos tem menos de 200 anos de história.`,
    questions:   ["Amor é sentimento ou decisão?", "O que a monogamia resolve e o que cria?", "Como o amor muda quem somos?"],
    relatedSlugs:["ego-e-identidade", "conflitos-humanos", "corpo-e-saude"],
    tags:        ["amor", "relações", "afeto", "psicologia"],
  },
  {
    slug:        "espiritualidade-e-transcendencia",
    title:       "Espiritualidade e Transcendência",
    subtitle:    "Existe algo além do que podemos ver?",
    description: `Religião, mística, filosofia perene — todas apontam para algo que escapa ao ordinário. A neurociência estuda experiências de pico e estados alterados. O que elas revelam?`,
    questions:   ["Você já teve uma experiência que não consegue explicar?", "O sagrado precisa de uma religião?", "O que a morte de Deus (Nietzsche) deixou no lugar?"],
    relatedSlugs:["silencio-e-contemplacao", "tempo-e-mortalidade", "etica-e-moral"],
    tags:        ["espiritualidade", "religião", "transcendência", "mística"],
  },
  {
    slug:        "liberdade-e-determinismo",
    title:       "Liberdade e Determinismo",
    subtitle:    "Você realmente escolhe — ou tudo está determinado?",
    description: `Neurociência sugere que decisões acontecem antes da consciência. Física quântica introduz indeterminismo. Mas experienciamos liberdade. Como conciliar?`,
    questions:   ["Livre-arbítrio é ilusão ou realidade funcional?", "Responsabilidade moral existe sem liberdade?", "O que a biologia determina — e o que não?"],
    relatedSlugs:["etica-e-moral", "ego-e-identidade", "ciencia-e-tecnologia"],
    tags:        ["liberdade", "determinismo", "filosofia", "neurociência"],
  },
  {
    slug:        "memoria-e-historia",
    title:       "Memória e História",
    subtitle:    "O passado é o que aconteceu — ou o que lembramos?",
    description: `Memória é reconstrutiva, não fotográfica. Trauma reorganiza o tempo. A história oficial esconde outras histórias. Quem narra o passado define o presente.`,
    questions:   ["Sua memória de infância é real ou construída?", "Como silêncios históricos moldam culturas?", "O que escolhemos esquecer — e por quê?"],
    relatedSlugs:["poder-e-politica", "educacao-e-aprendizado", "tempo-e-mortalidade"],
    tags:        ["memória", "história", "trauma", "narrativa"],
  },
  {
    slug:        "solidao-e-comunidade",
    title:       "Solidão e Comunidade",
    subtitle:    "Precisamos dos outros — mas também precisamos de nós mesmos.",
    description: `Aristóteles: o homem é animal político. Thoreau foi para o bosque sozinho. A pandemia reinventou nosso entendimento do que é estar junto. O que a solidão revela?`,
    questions:   ["Você se sente mais sozinho entre pessoas ou na ausência delas?", "O que diferencia solidão de solitude?", "Como construir comunidade real no mundo digital?"],
    relatedSlugs:["amor-e-relacoes", "ego-e-identidade", "silencio-e-contemplacao"],
    tags:        ["solidão", "comunidade", "social", "pertencimento"],
  },
  {
    slug:        "utopia-e-possibilidade",
    title:       "Utopia e Possibilidade",
    subtitle:    "Vale a pena imaginar mundos melhores?",
    description: `Tomás Moro inventou a palavra. Marx quis tornar a utopia científica. Bloch falou no 'princípio esperança'. Críticos dizem que utopias geram terror. Mas sem imaginação, nada muda.`,
    questions:   ["Como seria um mundo que você quereria deixar para as próximas gerações?", "O realismo que descarta a utopia é prudente ou covarde?", "Que utopias parciais já se tornaram realidade?"],
    relatedSlugs:["poder-e-politica", "justica-e-lei", "educacao-e-aprendizado"],
    tags:        ["utopia", "esperança", "política", "futuro", "imaginação"],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug)
}

export function getEntryTopics(): Topic[] {
  return TOPICS
    .filter((t) => t.entryQuestion)
    .sort((a, b) => (a.entryIndex ?? 99) - (b.entryIndex ?? 99))
}

export function getRelatedTopics(topic: Topic): Topic[] {
  return topic.relatedSlugs
    .map((s) => getTopicBySlug(s))
    .filter(Boolean) as Topic[]
}
