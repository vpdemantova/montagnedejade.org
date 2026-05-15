import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

// GET — página de blog pública pelo slug
export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params

  const post = await prisma.page.findUnique({
    where:  { slug },
    select: {
      id: true, title: true, icon: true, content: true, slug: true,
      isPublic: true, isBlog: true, createdAt: true, updatedAt: true,
      user: { select: { username: true, displayName: true, avatarUrl: true, accentColor: true } },
    },
  })

  if (!post || !post.isPublic || !post.isBlog) {
    return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
  }

  const res = NextResponse.json(post)
  res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600")
  return res
}
