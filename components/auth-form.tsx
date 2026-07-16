"use client"

import { useRouter } from "next/navigation"
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

  const done = () => {
    router.push("/dashboard")
    router.refresh()
  }

  const googleSignIn = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })
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

        <div className="flex flex-col gap-3">
          {googleEnabled && (
            <Button type="button" variant="outline" className="w-full" onClick={googleSignIn}>
              <GoogleIcon />
              Continue with Google
            </Button>
          )}
          {discordEnabled && (
            <Button type="button" variant="outline" className="w-full" onClick={discordSignIn}>
              <DiscordIcon />
              Continue with Discord
            </Button>
          )}
        </div>
      </Card>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#5865F2" aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.196.353-.423.83-.58 1.207a18.27 18.27 0 0 0-3.955 0A12.6 12.6 0 0 0 11.44 3a19.74 19.74 0 0 0-3.762 1.369C3.6 10.24 2.5 15.94 3.02 21.56a19.9 19.9 0 0 0 6.06 3.06 14.6 14.6 0 0 0 1.23-2.01 12.9 12.9 0 0 1-1.94-.93c.163-.12.322-.245.476-.373a14.2 14.2 0 0 0 12.13 0c.156.13.315.255.476.374-.62.367-1.27.68-1.942.93.354.7.766 1.372 1.23 2.01a19.85 19.85 0 0 0 6.06-3.06c.607-6.51-1.04-12.16-4.37-17.19ZM9.68 17.53c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.41-2.16 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.94 2.41-2.16 2.41Z" />
    </svg>
  )
}
