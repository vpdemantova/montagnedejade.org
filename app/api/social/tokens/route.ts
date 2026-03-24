import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"
import { verifyToken } from "@/atlas/lib/jwt"
import { cookies } from "next/headers"

// GET — meus tokens
export async function GET() {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const tokens = await prisma.userToken.findMany({
      where:   { userId: me.userId },
      orderBy: [{ isEquipped: "desc" }, { rarity: "desc" }, { createdAt: "asc" }],
    })

    return NextResponse.json(tokens)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// PATCH — equipar/desequipar token
export async function PATCH(req: Request) {
  try {
    const token = (await cookies()).get("ps_session")?.value
    const me = token ? await verifyToken(token) : null
    if (!me) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const { tokenId, isEquipped } = await req.json() as { tokenId: string; isEquipped: boolean }

    // Verificar ownership
    const existing = await prisma.userToken.findUnique({ where: { id: tokenId } })
    if (!existing || existing.userId !== me.userId) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 404 })
    }

    const updated = await prisma.userToken.update({
      where: { id: tokenId },
      data:  { isEquipped },
    })

    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// POST — admin: conceder token a um usuário (protegido por AUTH_PASSWORD)
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-admin-key")
    if (authHeader !== process.env.AUTH_PASSWORD) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const { username, tokenType, name, description, imageUrl, data, rarity } =
      await req.json() as {
        username:     string
        tokenType:    string
        name:         string
        description?: string
        imageUrl?:    string
        data?:        string
        rarity?:      string
      }

    const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } })
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const newToken = await prisma.userToken.create({
      data: {
        userId:      user.id,
        tokenType:   tokenType ?? "BADGE",
        name,
        description: description ?? null,
        imageUrl:    imageUrl ?? null,
        data:        data ?? null,
        rarity:      rarity ?? "COMMON",
      },
    })

    return NextResponse.json(newToken)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
