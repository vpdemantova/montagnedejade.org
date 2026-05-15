/**
 * seed-founder.ts — cria a conta do fundador no banco de dados.
 *
 * Uso:
 *   pnpm seed:founder --password=MinhaSenh@123
 *
 * Ou via variável de ambiente:
 *   FOUNDER_PASSWORD=MinhaSenh@123 pnpm seed:founder
 *
 * Se o usuário já existir, exibe os dados atuais e encerra sem erro.
 */

import bcrypt        from "bcryptjs"
import { PrismaClient } from "@prisma/client"

// Lê o FOUNDER config sem depender do path alias @/ (é script Node puro)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { FOUNDER } = require("../portal.config") as typeof import("../portal.config")

const prisma = new PrismaClient()

// ── Lê senha ──────────────────────────────────────────────────────────────────

function readPassword(): string {
  // 1. --password=xxx no argv
  const arg = process.argv.find((a) => a.startsWith("--password="))
  if (arg) return arg.split("=").slice(1).join("=")

  // 2. Variável de ambiente
  if (process.env.FOUNDER_PASSWORD) return process.env.FOUNDER_PASSWORD

  console.error("\n❌ Senha não fornecida.\n")
  console.error("   Execute com:")
  console.error("     pnpm seed:founder --password=SuaSenha123\n")
  console.error("   Ou defina a variável de ambiente:")
  console.error("     FOUNDER_PASSWORD=SuaSenha123 pnpm seed:founder\n")
  process.exit(1)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const password = readPassword()

  if (password.length < 6) {
    console.error("❌ A senha precisa ter pelo menos 6 caracteres.")
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({
    where:  { username: FOUNDER.USERNAME },
    select: { id: true, username: true, displayName: true, createdAt: true },
  })

  if (existing) {
    console.log(`\n✓ Fundador já existe:\n`)
    console.log(`  ID:          ${existing.id}`)
    console.log(`  Username:    @${existing.username}`)
    console.log(`  DisplayName: ${existing.displayName}`)
    console.log(`  Criado em:   ${existing.createdAt.toLocaleDateString("pt-BR")}`)
    console.log(`\n  Link de convite: /convite/${existing.username}`)
    console.log(`\n  Para atualizar a senha, use a rota /settings na plataforma.\n`)
    await prisma.$disconnect()
    return
  }

  console.log(`\n🌟 Criando conta do fundador @${FOUNDER.USERNAME}…`)

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      username:    FOUNDER.USERNAME,
      displayName: FOUNDER.DISPLAY,
      bio:         FOUNDER.BIO,
      accentColor: FOUNDER.ACCENT,
      passwordHash,
      // Tickets iniciais do fundador
      tickets: {
        create: [
          { type: "FOUNDER", note: "Ticket Fundador — Criador do Portal Solar" },
          { type: "GOLDEN",  note: "Ticket Dourado — Fundação da plataforma" },
          { type: "STANDARD" },
          { type: "STANDARD" },
          { type: "STANDARD" },
        ],
      },
    },
    select: { id: true, username: true, displayName: true },
  })

  console.log(`\n✅ Conta criada com sucesso!\n`)
  console.log(`  ID:          ${user.id}`)
  console.log(`  Username:    @${user.username}`)
  console.log(`  DisplayName: ${user.displayName}`)
  console.log(`\n  Link de convite: /convite/${user.username}`)
  console.log(`\n  Agora faça login em /login com:`)
  console.log(`    Username: ${user.username}`)
  console.log(`    Senha:    (a que você forneceu)\n`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
