import { NextResponse } from "next/server"
import { findById } from "@/atlas/lib/db"
import { buildMirrorContent } from "@/atlas/lib/mirror"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const item = await findById(id)
  if (!item) return NextResponse.json({ error: "Não encontrado" }, { status: 404 })

  const md = buildMirrorContent(item, "")

  return new NextResponse(md, {
    headers: {
      "Content-Type":        "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${item.id}.md"`,
    },
  })
}
