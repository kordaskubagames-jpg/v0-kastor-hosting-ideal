"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"  // Keep useState imported if still used for loading state
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Code2 } from "lucide-react"

export function AuthForm({
  mode,
  googleEnabled,
  discordEnabled,
}: {
  mode: "sign-in" | "sign-up"
  googleEnabled: boolean
  discordEnabled: boolean
}) {
  const router = useRouter()
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })
      if (!res.ok) throw new Error("Login failed")
      localStorage.setItem("userNickname", nickname.trim())
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary mb-3">
            <Code2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "sign-in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "sign-in" 
              ? "Sign in to your Kastor Hoster dashboard" 
              : "Start protecting your Lua scripts"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="nickname" className="text-sm font-medium">
              Enter your nickname
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
              className="mt-2 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !nickname.trim()}
          >
            {loading ? "Entering..." : "Enter Dashboard"}
          </Button>
        </form>
      </Card>
    </main>
  )
}
