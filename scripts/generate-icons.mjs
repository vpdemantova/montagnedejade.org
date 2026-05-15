// Gera ícones PNG para o PWA usando Canvas API do Node.js
// Executar: node scripts/generate-icons.mjs

import { createCanvas } from "canvas"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, "..", "public", "icons")

const SIZES = [72, 96, 128, 192, 512]

for (const size of SIZES) {
  const canvas = createCanvas(size, size)
  const ctx    = canvas.getContext("2d")

  // Fundo
  ctx.fillStyle = "#0D0D0F"
  ctx.fillRect(0, 0, size, size)

  // Círculo de fundo dourado
  const r = size * 0.38
  ctx.fillStyle = "#C8A45A22"
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
  ctx.fill()

  // Símbolo ☀ (Sol)
  ctx.fillStyle = "#C8A45A"
  ctx.font      = `bold ${size * 0.45}px serif`
  ctx.textAlign    = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("☀", size / 2, size / 2 + size * 0.02)

  const buf = canvas.toBuffer("image/png")
  writeFileSync(join(PUBLIC, `icon-${size}.png`), buf)
  console.log(`✓ icon-${size}.png`)
}
console.log("Ícones gerados com sucesso!")
