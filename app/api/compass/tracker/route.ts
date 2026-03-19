import { NextResponse } from "next/server"
import { prisma }       from "@/atlas/lib/db"

// GET — list disciplines with sessions
export async function GET() {
  const disciplines = await prisma.studyDiscipline.findMany({
    include:  { sessions: { orderBy: { date: "desc" }, take: 10 } },
    orderBy:  { createdAt: "asc" },
  })
  return NextResponse.json(disciplines)
}

// POST — create discipline or log session
export async function POST(req: Request) {
  const body = await req.json() as {
    action?:       string
    name?:         string
    code?:         string
    professor?:    string
    semester?:     string
    totalHours?:   number
    color?:        string
    disciplineId?: string
    durationMin?:  number
    note?:         string
  }

  if (body.action === "log-session") {
    const session = await prisma.studySession.create({
      data: {
        disciplineId: body.disciplineId!,
        durationMin:  body.durationMin ?? 30,
        note:         body.note ?? null,
      },
    })
    return NextResponse.json(session)
  }

  const discipline = await prisma.studyDiscipline.create({
    data: {
      name:       body.name ?? "Nova Disciplina",
      code:       body.code ?? "",
      professor:  body.professor ?? null,
      semester:   body.semester ?? "",
      totalHours: body.totalHours ?? 60,
      color:      body.color ?? "#C8A45A",
    },
  })
  return NextResponse.json(discipline)
}

// PATCH — update discipline
export async function PATCH(req: Request) {
  const body = await req.json() as {
    id:          string
    name?:       string
    code?:       string
    professor?:  string
    semester?:   string
    totalHours?: number
    color?:      string
  }
  const { id, ...data } = body
  const discipline = await prisma.studyDiscipline.update({ where: { id }, data })
  return NextResponse.json(discipline)
}

// DELETE — remove discipline
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await prisma.studyDiscipline.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
