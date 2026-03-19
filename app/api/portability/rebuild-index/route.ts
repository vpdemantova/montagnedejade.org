import { NextResponse } from "next/server"
import { findAll } from "@/atlas/lib/db"
import { writeMirror } from "@/atlas/lib/mirror"
import { promises as fs } from "fs"
import path from "path"

// POST /api/portability/rebuild-index
// Varre todos os itens do banco e regenera seus .md espelhos
// além de atualizar o content/index.json
export async function POST() {
  const items = await findAll({ limit: 50000 })

  let written = 0
  let errors  = 0

  for (const item of items) {
    try {
      await writeMirror(item, "")
      written++
    } catch {
      errors++
    }
  }

  // Atualiza content/index.json
  const index = {
    version:      "1.0.0",
    lastIndexed:  new Date().toISOString(),
    totalItems:   items.length,
    areas:        Array.from(new Set(items.map((i) => i.area.toLowerCase()))),
    hemispheres:  Array.from(new Set(items.map((i) => i.hemisphere))),
    items: items.map((i) => ({
      id:         i.id,
      title:      i.title,
      type:       i.type,
      area:       i.area,
      hemisphere: i.hemisphere,
      status:     i.status,
      tags:       i.tags.map((t) => t.name),
      updatedAt:  i.updatedAt,
    })),
  }

  const indexPath = path.join(process.cwd(), "content", "index.json")
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), "utf-8")

  return NextResponse.json({ ok: true, written, errors, totalItems: items.length })
}
