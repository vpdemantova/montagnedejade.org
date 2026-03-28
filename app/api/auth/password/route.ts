import { NextResponse } from "next/server"
import { cookies }       from "next/headers"
import bcrypt            from "bcryptjs"
import { prisma }        from "@/atlas/lib/db"
import { verifyToken }   from "@/atlas/lib/jwt"

export async function PATCH(req: Request) {
  try {
    const jar   = await cookies()
    const token = jar.get("ps_session")?.value
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.guest) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json() as {
      currentPassword: string
      newPassword:     string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter ao menos 6 caracteres" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
