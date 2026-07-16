"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [nickname, setNickname] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedNickname = localStorage.getItem("userNickname")
    if (!storedNickname) {
      router.push("/sign-in")
      return
    }
    setNickname(storedNickname)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!nickname) {
    return null
  }

  return (
    <div className="flex min-h-svh">
      <DashboardSidebar name={nickname} email={`${nickname}@kastor.dev`} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
