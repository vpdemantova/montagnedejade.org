/**
 * Ajusta o provider do schema Prisma antes do build.
 * Usa DATABASE_PROVIDER=postgresql em produção (Vercel),
 * ou mantém sqlite para desenvolvimento local.
 */
import { readFileSync, writeFileSync } from "fs"

const provider = process.env.DATABASE_PROVIDER ?? "sqlite"
const schemaPath = new URL("../prisma/schema.prisma", import.meta.url).pathname

const schema = readFileSync(schemaPath, "utf8")
const updated = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`
)

if (schema !== updated) {
  writeFileSync(schemaPath, updated)
  console.log(`✓ Prisma provider ajustado para: ${provider}`)
} else {
  console.log(`✓ Prisma provider já está em: ${provider}`)
}
