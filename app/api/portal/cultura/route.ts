import { NextResponse } from "next/server"
import { findAllNotices, createNotice } from "@/atlas/lib/db"

export async function GET() {
  const notices = await findAllNotices(50)
  return NextResponse.json(notices)
}

export async function POST(request: Request) {
  const body = (await request.json()) as Parameters<typeof createNotice>[0]
  const notice = await createNotice(body)
  return NextResponse.json(notice, { status: 201 })
}
