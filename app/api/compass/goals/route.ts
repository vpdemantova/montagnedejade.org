import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"

export async function GET() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(goals)
}

export async function POST(req: Request) {
  const body = await req.json() as {
    title:        string
    description?: string
    horizon?:     string
    dueDate?:     string
  }
  const goal = await prisma.goal.create({
    data: {
      title:       body.title,
      description: body.description ?? null,
      horizon:     body.horizon ?? "short",
      dueDate:     body.dueDate ? new Date(body.dueDate) : null,
    },
  })
  return NextResponse.json(goal)
}

export async function PATCH(req: Request) {
  const body = await req.json() as {
    id:           string
    title?:       string
    description?: string
    status?:      string
    progress?:    number
    dueDate?:     string | null
  }
  const { id, dueDate, ...rest } = body
  const goal = await prisma.goal.update({
    where: { id },
    data:  {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
  })
  return NextResponse.json(goal)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await prisma.goal.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
