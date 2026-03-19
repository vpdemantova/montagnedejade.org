import { NextResponse } from "next/server"
import { findAll } from "@/atlas/lib/db"
import { buildMirrorContent } from "@/atlas/lib/mirror"
import JSZip from "jszip"
import type { AreaType } from "@/atlas/types"

type Params = { params: Promise<{ area: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { area } = await params
  const items = await findAll({ area: area.toUpperCase() as AreaType, limit: 5000 })

  const zip = new JSZip()
  const folder = zip.folder(area.toLowerCase())!

  for (const item of items) {
    const md = buildMirrorContent(item, "")
    folder.file(`${item.id}.md`, md)
  }

  const buffer = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" })

  return new NextResponse(buffer as BodyInit, {
    headers: {
      "Content-Type":        "application/zip",
      "Content-Disposition": `attachment; filename="portal-solar-${area.toLowerCase()}.zip"`,
    },
  })
}
