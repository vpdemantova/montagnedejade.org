import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

// Seed das 30 primeiras perguntas do Bubble Mixture se não existirem
const SEED_QUESTIONS = [
  { n:  1, text: "Você acredita que o mundo está melhorando?", type: "scale" },
  { n:  2, text: "Quão conectado você se sente com as pessoas ao seu redor?", type: "scale" },
  { n:  3, text: "Você age de acordo com seus valores na maioria dos dias?", type: "scale" },
  { n:  4, text: "Qual é a coisa mais importante que a humanidade precisa resolver agora?", type: "choice",
    options: JSON.stringify(["Clima e ambiente", "Guerras e violência", "Desigualdade", "Saúde mental", "Educação", "Tecnologia irresponsável"]) },
  { n:  5, text: "Você aprende algo novo toda semana?", type: "scale" },
  { n:  6, text: "Você sente que tem um propósito claro na sua vida?", type: "scale" },
  { n:  7, text: "Quanto tempo por dia você passa contemplando o silêncio?", type: "choice",
    options: JSON.stringify(["Quase nenhum", "5-10 minutos", "15-30 minutos", "Mais de 30 minutos"]) },
  { n:  8, text: "Você criou algo do zero nos últimos 30 dias?", type: "scale" },
  { n:  9, text: "Quão bem você conhece a história do lugar onde vive?", type: "scale" },
  { n: 10, text: "Você leu um livro completo nos últimos 3 meses?", type: "choice",
    options: JSON.stringify(["Não", "Sim, 1", "Sim, 2-3", "Sim, mais de 3"]) },
  { n: 11, text: "Você se preocupa com o sofrimento de animais?", type: "scale" },
  { n: 12, text: "Você participa ativamente de alguma comunidade?", type: "scale" },
  { n: 13, text: "Qual campo do conhecimento você mais gostaria de dominar?", type: "choice",
    options: JSON.stringify(["Ciências naturais", "Filosofia", "Artes", "Tecnologia", "História", "Medicina", "Música"]) },
  { n: 14, text: "Você sente que tem controle sobre o seu futuro?", type: "scale" },
  { n: 15, text: "Você acredita na possibilidade de paz mundial?", type: "scale" },
  { n: 16, text: "Com que frequência você expressa gratidão?", type: "choice",
    options: JSON.stringify(["Raramente", "Às vezes", "Com frequência", "Diariamente"]) },
  { n: 17, text: "Você consegue identificar quando está sendo influenciado por mídia ou algoritmos?", type: "scale" },
  { n: 18, text: "Quão importante é a tradição na sua vida?", type: "scale" },
  { n: 19, text: "Você já ajudou um desconhecido de forma significativa?", type: "choice",
    options: JSON.stringify(["Não que me lembre", "Uma vez", "Algumas vezes", "Com frequência"]) },
  { n: 20, text: "Você sente que a educação que recebeu foi suficiente?", type: "scale" },
  { n: 21, text: "Você já contemplou o universo e sentiu algo transcendente?", type: "scale" },
  { n: 22, text: "O que mais te impede de agir segundo seus sonhos?", type: "choice",
    options: JSON.stringify(["Falta de tempo", "Medo", "Recursos financeiros", "Outros dependem de mim", "Não sei ao certo"]) },
  { n: 23, text: "Você cuida ativamente da sua saúde mental?", type: "scale" },
  { n: 24, text: "Você acredita que a tecnologia vai resolver os maiores problemas da humanidade?", type: "scale" },
  { n: 25, text: "Você se sente representado pela política do seu país?", type: "scale" },
  { n: 26, text: "Com que frequência você passa tempo na natureza?", type: "choice",
    options: JSON.stringify(["Raramente", "1x por mês", "1x por semana", "Quase todo dia"]) },
  { n: 27, text: "Você tem uma prática espiritual ou filosófica consistente?", type: "scale" },
  { n: 28, text: "Quão importante é a arte e a música na sua vida?", type: "scale" },
  { n: 29, text: "Você consegue se desconectar do digital por mais de um dia?", type: "scale" },
  { n: 30, text: "O que você faria se soubesse que não poderia falhar?", type: "choice",
    options: JSON.stringify(["Criar algo", "Viajar e explorar", "Ajudar pessoas", "Aprender e estudar", "Construir uma família", "Mudar o mundo"]) },
]

// GET — busca perguntas (e cria o seed se necessário) + respostas da sessão
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session") ?? "anon"

  // Seed das perguntas se não existirem
  const count = await prisma.bubbleQuestion.count()
  if (count === 0) {
    for (const q of SEED_QUESTIONS) {
      await prisma.bubbleQuestion.upsert({
        where:  { n: q.n },
        create: q,
        update: {},
      })
    }
  }

  const [questions, responses] = await Promise.all([
    prisma.bubbleQuestion.findMany({ orderBy: { n: "asc" } }),
    prisma.bubbleResponse.findMany({
      where:  { sessionId },
      select: { questionId: true, answer: true },
    }),
  ])

  // Agregação de respostas globais para feedback imediato
  const allResponses = await prisma.bubbleResponse.groupBy({
    by:      ["questionId", "answer"],
    _count:  { answer: true },
  })

  const aggregated = allResponses.reduce<Record<string, Record<string, number>>>((acc, r) => {
    if (!acc[r.questionId]) acc[r.questionId] = {}
    acc[r.questionId]![r.answer] = r._count.answer
    return acc
  }, {})

  const myAnswers = Object.fromEntries(responses.map((r) => [r.questionId, r.answer]))

  return NextResponse.json({ questions, myAnswers, aggregated, total: count })
}

// POST — responder uma pergunta
export async function POST(req: Request) {
  const me = await getMe()
  const { sessionId, questionId, answer } = await req.json() as {
    sessionId:  string
    questionId: string
    answer:     string
  }

  if (!sessionId || !questionId || answer === undefined) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  const response = await prisma.bubbleResponse.upsert({
    where:  { sessionId_questionId: { sessionId, questionId } },
    create: { sessionId, questionId, answer, userId: me?.userId },
    update: { answer },
  })

  return NextResponse.json(response)
}
