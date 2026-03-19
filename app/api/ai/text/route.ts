import { NextResponse } from "next/server"
import { genai, TEXT_MODEL } from "@/atlas/lib/gemini"

type Body = {
  type:     "summary" | "tags" | "description" | "qa"
  title?:   string
  content?: string
  prompt?:  string
}

const SYSTEM_PROMPTS: Record<Body["type"], string> = {
  summary:
    "Você é um assistente de gestão de conhecimento. Gere um resumo conciso (2-3 frases) em português do item fornecido. Seja direto e informativo.",
  tags:
    "Você é um assistente de categorização. Sugira de 3 a 6 tags relevantes em português para o item. Responda APENAS com as tags separadas por vírgula, sem explicações. Exemplo: filosofia, ética, renascimento",
  description:
    "Você é um assistente editorial. Escreva uma descrição rica e acadêmica em português (1 parágrafo) para o item fornecido. Use linguagem culta mas acessível.",
  qa:
    "Você é um assistente de pesquisa. Responda à pergunta sobre o item com base no contexto fornecido. Responda em português de forma clara e fundamentada.",
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 503 })
  }

  const body = await req.json() as Body
  const { type, title, content, prompt } = body

  let userText = ""
  if (title)   userText += `Título: ${title}\n`
  if (content) userText += `Conteúdo: ${content.slice(0, 2000)}\n`
  if (prompt)  userText += `Pergunta: ${prompt}\n`

  if (!userText.trim()) {
    return NextResponse.json({ error: "Forneça title, content ou prompt" }, { status: 400 })
  }

  const fullPrompt = `${SYSTEM_PROMPTS[type]}\n\n${userText}`

  const response = await genai.models.generateContent({
    model:    TEXT_MODEL,
    contents: fullPrompt,
  })

  const result = response.text ?? ""
  return NextResponse.json({ result })
}
