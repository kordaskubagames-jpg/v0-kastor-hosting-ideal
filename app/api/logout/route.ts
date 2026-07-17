import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("kastor_user_id")
  cookieStore.delete("kastor_nickname")
  return NextResponse.json({ ok: true })
}
