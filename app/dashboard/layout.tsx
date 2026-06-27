import type React from "react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  return (
    <div className="flex min-h-svh">
      <DashboardSidebar name={session.user.name} email={session.user.email} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
