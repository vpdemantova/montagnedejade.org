import { GoogleGenAI } from "@google/genai"

const API_KEY = process.env.GEMINI_API_KEY ?? ""

export const genai = new GoogleGenAI({ apiKey: API_KEY })

// Modelos padrão
export const TEXT_MODEL  = "gemini-2.5-flash"
export const IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"

/** Retorna false se a chave não está configurada (avisa só quando chamado) */
export function geminiAvailable(): boolean {
  if (!API_KEY) {
    console.warn("[gemini] GEMINI_API_KEY não configurada — recurso de IA indisponível")
    return false
  }
  return true
}
