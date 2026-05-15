import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"

export const dynamic = "force-dynamic"

// GET — lista páginas publicadas no blog (sem login necessário)
export async function GET() {
  const posts = await prisma.page.findMany({
    where:   { isBlog: true, isPublic: true },
    select:  {
      id: true, title: true, icon: true, slug: true,
      createdAt: true, updatedAt: true,
      user: { select: { username: true, displayName: true, avatarUrl: true, accentColor: true } },
    },
    orderBy: { updatedAt: "desc" },
    take:    50,
  })

  const res = NextResponse.json(posts)
  res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
  return res
}
