import { GoogleGenAI } from "@google/genai"

if (!process.env.GEMINI_API_KEY) {
  console.warn("[gemini] GEMINI_API_KEY não configurada — recursos de IA desabilitados")
}

export const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" })

// Modelos padrão
export const TEXT_MODEL  = "gemini-2.5-flash"
export const IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"
