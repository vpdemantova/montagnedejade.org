import { NextResponse }        from "next/server"
import bcrypt                  from "bcryptjs"
import { prisma }              from "@/atlas/lib/db"
import { verifyToken, signToken } from "@/atlas/lib/jwt"
import { cookies }             from "next/headers"

// PATCH — trocar nome de usuário (requer senha atual para confirmar)
export async function PATCH(req: Request) {
  try {
    const jar   = await cookies()
    const token = jar.get("ps_session")?.value
    const me    = token ? await verifyToken(token) : null
    if (!me || me.guest) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { newUsername, currentPassword } = await req.json() as {
      newUsername:     string
      currentPassword: string
    }

    if (!newUsername || !currentPassword) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 })
    }

    if (newUsername.length < 3) {
      return NextResponse.json({ error: "Username deve ter ao menos 3 caracteres" }, { status: 400 })
    }

    if (!/^[a-z0-9_]+$/i.test(newUsername)) {
      return NextResponse.json({ error: "Username só pode ter letras, números e _" }, { status: 400 })
    }

    // Verifica senha
    const user = await prisma.user.findUnique({ where: { id: me.userId } })
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })

    // Verifica disponibilidade
    const taken = await prisma.user.findUnique({ where: { username: newUsername.toLowerCase() } })
    if (taken && taken.id !== user.id) {
      return NextResponse.json({ error: "Username já está em uso" }, { status: 409 })
    }

    if (newUsername.toLowerCase() === user.username) {
      return NextResponse.json({ error: "Este já é o seu username" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data:  { username: newUsername.toLowerCase() },
      select: { id: true, username: true, displayName: true },
    })

    // Reemite o cookie com o novo username
    const newToken = await signToken({
      userId:      updated.id,
      username:    updated.username,
      displayName: updated.displayName,
    })

    const res = NextResponse.json({ ok: true, username: updated.username })
    res.cookies.set("ps_session", newToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 30,
      path:     "/",
    })
    return res
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
