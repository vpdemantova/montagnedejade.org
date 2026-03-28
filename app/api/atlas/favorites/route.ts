import { NextResponse } from "next/server"
import { findFavorites } from "@/atlas/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  const favorites = await findFavorites()
  return NextResponse.json(favorites)
}
