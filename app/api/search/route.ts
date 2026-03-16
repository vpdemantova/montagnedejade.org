import { NextResponse } from "next/server"
import { findAll } from "@/atlas/lib/db"
import { createSearchIndex, fuzzySearch } from "@/atlas/lib/search"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") ?? ""

  if (!query.trim()) {
    return NextResponse.json([])
  }

  // Carrega todos os itens e executa busca fuzzy server-side
  const items = await findAll({ limit: 500 })
  const fuse = createSearchIndex(items)
  const results = fuzzySearch(fuse, query)

  return NextResponse.json(results.slice(0, 20))
}
