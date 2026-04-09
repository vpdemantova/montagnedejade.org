import { NextResponse } from "next/server"

// GET /api/ai/status — retorna quais integrações AI estão configuradas
export async function GET() {
  return NextResponse.json({
    gemini:    !!process.env.GEMINI_API_KEY?.trim(),
    replicate: !!process.env.REPLICATE_API_TOKEN?.trim(),
  })
}
