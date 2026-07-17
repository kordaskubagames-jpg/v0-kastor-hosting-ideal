import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  const { nickname } = await req.json()
  if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
    return NextResponse.json({ error: "Nickname required" }, { status: 400 })
  }

  const userId = `user_${nickname.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`

  const cookieStore = await cookies()
  cookieStore.set("kastor_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  cookieStore.set("kastor_nickname", nickname.trim(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ ok: true, userId })
}
