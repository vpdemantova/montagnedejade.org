import { NextResponse } from "next/server"
import { genai, IMAGE_MODEL } from "@/atlas/lib/gemini"
import Replicate from "replicate"

type Body = {
  prompt:    string
  provider?: "gemini" | "replicate"
}

export async function POST(req: Request) {
  const body = await req.json() as Body
  const { prompt, provider = "gemini" } = body

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt obrigatório" }, { status: 400 })
  }

  // ── Gemini image generation ───────────────────────────────────────────────
  if (provider === "gemini") {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 503 })
    }

    const response = await genai.models.generateContent({
      model:    IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ["Image", "Text"],
      },
    })

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: unknown }) => p.inlineData
    ) as { inlineData?: { data: string; mimeType: string } } | undefined

    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: "Gemini não retornou imagem" }, { status: 500 })
    }

    const { data, mimeType } = imagePart.inlineData
    const url = `data:${mimeType};base64,${data}`
    return NextResponse.json({ url })
  }

  // ── Replicate / Flux Schnell ──────────────────────────────────────────────
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: "REPLICATE_API_TOKEN não configurada" }, { status: 503 })
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt,
      num_outputs:        1,
      aspect_ratio:       "16:9",
      output_format:      "webp",
      output_quality:     85,
    },
  })

  const urls = output as string[]
  const url  = Array.isArray(urls) ? urls[0] : String(output)

  if (!url) {
    return NextResponse.json({ error: "Replicate não retornou imagem" }, { status: 500 })
  }

  return NextResponse.json({ url })
}
