# Portal Solar

Sistema privado de gestão de conhecimento — Diamantov.

## Stack

Next.js 14 · Prisma + SQLite (dev) / PostgreSQL (prod) · BlockNote · Zustand · Framer Motion · Three.js · Gemini AI · Replicate Flux

## Setup local

```bash
# 1. Instale dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores

# 3. Aplique o schema e popule o banco
npx prisma db push
npx prisma db seed

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000). A senha é a que você definiu em `AUTH_PASSWORD`.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do banco (`file:./dev.db` para SQLite local) |
| `DATABASE_PROVIDER` | `sqlite` (local) ou `postgresql` (produção) |
| `AUTH_SECRET` | String aleatória para sessões (`openssl rand -hex 32`) |
| `AUTH_PASSWORD` | Senha de acesso ao Portal |
| `GEMINI_API_KEY` | Chave Google Gemini (opcional — habilita IA) |
| `REPLICATE_API_TOKEN` | Token Replicate (opcional — imagem alternativa) |

## Deploy (Vercel + PostgreSQL)

1. Crie banco no [Neon](https://neon.tech) ou [Supabase](https://supabase.com)
2. `npx prisma migrate dev --name init` → comite `prisma/migrations/`
3. No Vercel: `DATABASE_PROVIDER=postgresql` + connection string pooled
4. Após deploy: `npx prisma migrate deploy` contra o banco de produção
5. Seed: `DATABASE_URL=<prod-url> npx prisma db seed`

## Seções

| Seção | Rota |
|---|---|
| Home / Dashboard | `/` |
| Atlas | `/atlas` |
| Cultura | `/portal/cultura` |
| Vilas | `/portal/vilas` |
| Diário | `/compass/diario` |
| Notas | `/compass/notas` |
| Estudos | `/compass/estudos` |
| Metas | `/compass/metas` |
| Mapa Interior | `/compass/mapa` |
| Perfil | `/compass/perfil` |
| World | `/world` |
| Settings | `/settings` |
