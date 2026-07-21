import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
  const discordEnabled = !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET

  return <AuthForm googleEnabled={googleEnabled} discordEnabled={discordEnabled} />
}
