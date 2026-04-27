import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"
import { verifyToken }  from "@/atlas/lib/jwt"
import { cookies }      from "next/headers"

async function getMe() {
  const token = (await cookies()).get("ps_session")?.value
  return token ? verifyToken(token) : null
}

export async function GET() {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const tags = await prisma.userTag.findMany({
    where:   { userId: me.userId },
    orderBy: { tag: "asc" },
    select:  { tag: true, createdAt: true },
  })
  return NextResponse.json(tags.map((t) => t.tag))
}

export async function POST(req: Request) {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { tag } = await req.json() as { tag: string }
  if (!tag?.trim()) return NextResponse.json({ error: "Tag inválida" }, { status: 400 })
  const normalized = tag.trim().toLowerCase()
  const record = await prisma.userTag.upsert({
    where:  { userId_tag: { userId: me.userId, tag: normalized } },
    create: { userId: me.userId, tag: normalized },
    update: {},
  })
  return NextResponse.json(record)
}

export async function DELETE(req: Request) {
  const me = await getMe()
  if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const tag = searchParams.get("tag")?.toLowerCase()
  if (!tag) return NextResponse.json({ error: "Tag não informada" }, { status: 400 })
  await prisma.userTag.deleteMany({ where: { userId: me.userId, tag } })
  return NextResponse.json({ ok: true })
}
