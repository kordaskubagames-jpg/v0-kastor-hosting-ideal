import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("kastor_user_id")?.value
  const nickname = cookieStore.get("kastor_nickname")?.value

  if (!userId || !nickname) redirect("/sign-in")

  return (
    <div className="flex min-h-svh">
      <DashboardSidebar name={nickname} email={`${nickname}@kastor.dev`} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
