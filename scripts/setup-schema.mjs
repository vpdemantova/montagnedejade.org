/**
 * Ajusta o provider do schema Prisma antes do build.
 * Detecta automaticamente pelo formato da DATABASE_URL:
 *   - postgresql:// ou postgres:// → postgresql
 *   - DATABASE_PROVIDER explícito tem prioridade
 *   - fallback → sqlite
 */
import { readFileSync, writeFileSync } from "fs"

const dbUrl = process.env.DATABASE_URL ?? ""
const autoProvider = (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://"))
  ? "postgresql"
  : "sqlite"

const provider = process.env.DATABASE_PROVIDER ?? autoProvider
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
