import { NextResponse } from "next/server"
import { create, update, findAll } from "@/atlas/lib/db"
import { writeMirror } from "@/atlas/lib/mirror"
import matter from "gray-matter"

// POST /api/portability/import
// Body: multipart/form-data with field "file" (.md) or "zip" (.zip)
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
  }

  const text = await file.text()

  if (file.name.endsWith(".md")) {
    return handleMarkdownImport(text)
  }

  return NextResponse.json({ error: "Formato não suportado. Envie um arquivo .md" }, { status: 400 })
}

async function handleMarkdownImport(text: string) {
  const { data, content } = matter(text)

  if (!data.title || !data.type || !data.area) {
    return NextResponse.json(
      { error: "Frontmatter inválido — title, type e area são obrigatórios" },
      { status: 422 }
    )
  }

  const tagNames: string[] = Array.isArray(data.tags) ? (data.tags as string[]) : []

  // Verifica se já existe um item com este id
  const existing = data.id
    ? (await findAll({ limit: 1, search: data.id })).find((i) => i.id === data.id)
    : null

  let item
  if (existing) {
    item = await update(existing.id, {
      title:      String(data.title),
      type:       String(data.type),
      area:       String(data.area),
      hemisphere: data.hemisphere ? String(data.hemisphere) : undefined,
      status:     data.status     ? String(data.status)     : undefined,
      isFavorite: Boolean(data.isFavorite),
      tagNames,
    })
  } else {
    item = await create({
      title:      String(data.title),
      type:       String(data.type),
      area:       String(data.area),
      hemisphere: data.hemisphere ? String(data.hemisphere) : "PORTAL",
      status:     data.status     ? String(data.status)     : "ACTIVE",
      isFavorite: Boolean(data.isFavorite),
      tagNames,
    })
  }

  await writeMirror(item, content).catch(console.error)

  return NextResponse.json({ ok: true, item, action: existing ? "updated" : "created" })
}
