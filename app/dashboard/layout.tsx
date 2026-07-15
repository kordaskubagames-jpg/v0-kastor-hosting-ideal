import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <DashboardSidebar name="Guest" email="guest@kastor.dev" />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
