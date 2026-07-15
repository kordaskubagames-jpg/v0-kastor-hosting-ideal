"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Code2 } from "lucide-react"

export function AuthForm({
  mode,
  discordEnabled,
}: {
  mode: "sign-in" | "sign-up"
  discordEnabled: boolean
}) {
  const router = useRouter()

  const done = () => {
    router.push("/dashboard")
    router.refresh()
  }

  const discordSignIn = async () => {
    await authClient.signIn.social({ provider: "discord", callbackURL: "/dashboard" })
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

        {discordEnabled && (
          <Button type="button" variant="outline" className="w-full" onClick={discordSignIn}>
            <DiscordIcon />
            Continue with Discord
          </Button>
        )}
      </Card>
    </main>
  )
}

function DiscordIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#5865F2" aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.196.353-.423.83-.58 1.207a18.27 18.27 0 0 0-3.955 0A12.6 12.6 0 0 0 11.44 3a19.74 19.74 0 0 0-3.762 1.369C3.6 10.24 2.5 15.94 3.02 21.56a19.9 19.9 0 0 0 6.06 3.06 14.6 14.6 0 0 0 1.23-2.01 12.9 12.9 0 0 1-1.94-.93c.163-.12.322-.245.476-.373a14.2 14.2 0 0 0 12.13 0c.156.13.315.255.476.374-.62.367-1.27.68-1.942.93.354.7.766 1.372 1.23 2.01a19.85 19.85 0 0 0 6.06-3.06c.607-6.51-1.04-12.16-4.37-17.19ZM9.68 17.53c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.41-2.16 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.94 2.41-2.16 2.41Z" />
    </svg>
  )
}
