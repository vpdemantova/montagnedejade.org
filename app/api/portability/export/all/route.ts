import { NextResponse } from "next/server"
import { findAll } from "@/atlas/lib/db"
import { buildMirrorContent } from "@/atlas/lib/mirror"
import JSZip from "jszip"

export const dynamic = 'force-dynamic'

export async function GET() {
  const items = await findAll({ limit: 50000 })

  const zip = new JSZip()
  const content = zip.folder("content")!

  for (const item of items) {
    const section = item.hemisphere === "COMPASS"
      ? `compass/${item.area.toLowerCase()}`
      : "atlas"
    const folder = content.folder(section)!
    const md = buildMirrorContent(item, "")
    folder.file(`${item.id}.md`, md)
  }

  // index.json
  const index = {
    version:     "1.0.0",
    exportedAt:  new Date().toISOString(),
    totalItems:  items.length,
    areas:       Array.from(new Set(items.map((i) => i.area.toLowerCase()))),
  }
  content.file("index.json", JSON.stringify(index, null, 2))

  const buffer = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" })

  return new NextResponse(buffer as BodyInit, {
    headers: {
      "Content-Type":        "application/zip",
      "Content-Disposition": `attachment; filename="portal-solar-backup-${new Date().toISOString().split("T")[0]}.zip"`,
    },
  })
}
