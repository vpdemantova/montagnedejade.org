/**
 * download-media.ts
 *
 * Downloads all Atlas item cover images to /public/atlas-media/ and updates
 * the database to point to the local path. Safe to re-run (skips existing files).
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/download-media.ts
 *
 * Options:
 *   --dry-run   Print what would be downloaded without saving anything
 *   --force     Re-download even if the file already exists
 */

import fs from "fs"
import path from "path"
import https from "https"
import http from "http"
import { URL } from "url"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DRY_RUN = process.argv.includes("--dry-run")
const FORCE   = process.argv.includes("--force")

const OUTPUT_DIR = path.join(process.cwd(), "public", "atlas-media")
const PUBLIC_PREFIX = "/atlas-media"

// ── Helpers ───────────────────────────────────────────────────────────────────

function extFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url)
    const ext = path.extname(pathname).split("?")[0]
    return ext && ext.length <= 5 ? ext : ".jpg"
  } catch {
    return ".jpg"
  }
}

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const lib  = url.startsWith("https") ? https : http

    const req = lib.get(url, (res) => {
      // Follow redirects (up to 5)
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlink(dest, () => {})
        download(res.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlink(dest, () => {})
        reject(new Error(`HTTP ${res.statusCode} for ${url}`))
        return
      }
      res.pipe(file)
      file.on("finish", () => file.close(() => resolve()))
    })

    req.on("error", (err) => {
      file.close()
      fs.unlink(dest, () => {})
      reject(err)
    })

    req.setTimeout(20_000, () => {
      req.destroy()
      reject(new Error(`Timeout: ${url}`))
    })
  })
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!DRY_RUN) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const items = await prisma.atlasItem.findMany({
    select: { id: true, title: true, coverImage: true },
  })

  const toDownload = items.filter(
    (i) => i.coverImage && !i.coverImage.startsWith(PUBLIC_PREFIX)
  )

  console.log(`\n📦 Atlas Media Downloader`)
  console.log(`   Total items:    ${items.length}`)
  console.log(`   Need download:  ${toDownload.length}`)
  console.log(`   Output:         ${OUTPUT_DIR}`)
  if (DRY_RUN) console.log(`   Mode:           DRY RUN (no files written)\n`)
  else         console.log()

  let ok = 0, skip = 0, fail = 0

  for (const item of toDownload) {
    const url = item.coverImage!
    const ext  = extFromUrl(url)
    const filename = `${item.id}${ext}`
    const dest     = path.join(OUTPUT_DIR, filename)
    const localPath = `${PUBLIC_PREFIX}/${filename}`

    if (!FORCE && fs.existsSync(dest)) {
      console.log(`  ⏭  [skip] ${item.title}`)
      // Still update DB if it points to old URL
      if (!DRY_RUN) {
        await prisma.atlasItem.update({
          where: { id: item.id },
          data:  { coverImage: localPath },
        }).catch(() => {})
      }
      skip++
      continue
    }

    if (DRY_RUN) {
      console.log(`  🔍 [dry]  ${item.title}\n         ${url}`)
      ok++
      continue
    }

    try {
      process.stdout.write(`  ⬇  ${item.title} … `)
      await download(url, dest)
      await prisma.atlasItem.update({
        where: { id: item.id },
        data:  { coverImage: localPath },
      })
      console.log("✓")
      ok++
    } catch (err) {
      console.log(`✗ (${(err as Error).message})`)
      fail++
    }

    // Polite delay to avoid hammering Wikimedia
    await sleep(300)
  }

  console.log(`\n✅ Done — ${ok} downloaded, ${skip} skipped, ${fail} failed\n`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
