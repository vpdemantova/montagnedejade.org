import { NextResponse } from "next/server"
import { findAll, create } from "@/atlas/lib/db"

export const dynamic = 'force-dynamic'

// GET → retorna ou cria a entrada do diário de hoje
export async function GET() {
  const hoje = new Date().toISOString().split("T")[0]!    // "2026-03-16"
  const titulo = `Diário — ${hoje}`

  // Busca entrada existente do dia
  const items = await findAll({ area: "DIARIO", limit: 200 })
  const existing = items.find((i) => i.title === titulo)

  if (existing) {
    return NextResponse.json(existing)
  }

  // Cria nova entrada
  const novo = await create({
    title:      titulo,
    type:       "NOTA",
    area:       "DIARIO",
    hemisphere: "COMPASS",
    status:     "ACTIVE",
    tagNames:   ["diario"],
  })

  return NextResponse.json(novo)
}
