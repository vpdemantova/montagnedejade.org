import { NextResponse } from "next/server"
import { prisma } from "@/atlas/lib/db"

// GET /api/compass/journal?date=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 })

  const entry = await prisma.journalEntry.findUnique({ where: { date } })
  return NextResponse.json(entry ?? null)
}

// POST /api/compass/journal — upsert by date
export async function POST(req: Request) {
  const body = await req.json() as {
    date:      string
    energy?:   number
    intention?: string
    mood?:     string
  }

  if (!body.date) return NextResponse.json({ error: "date required" }, { status: 400 })

  const entry = await prisma.journalEntry.upsert({
    where:  { date: body.date },
    update: {
      ...(body.energy    !== undefined && { energy:    body.energy    }),
      ...(body.intention !== undefined && { intention: body.intention }),
      ...(body.mood      !== undefined && { mood:      body.mood      }),
    },
    create: {
      date:      body.date,
      energy:    body.energy    ?? 3,
      intention: body.intention ?? null,
      mood:      body.mood      ?? null,
    },
  })

  return NextResponse.json(entry)
}
