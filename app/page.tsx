import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code2, ShieldCheck, KeyRound, FileCode2, Eye, Bug } from "lucide-react"

export default async function Home() {

  const features = [
    {
      icon: FileCode2,
      title: "Source to obfuscated build",
      desc: "Paste your Lua source. The engine encrypts strings, renames identifiers, and wraps it in a runtime VM loader on every save.",
    },
    {
      icon: ShieldCheck,
      title: "Anti-tamper",
      desc: "Runtime checks verify critical primitives like loadstring and pcall haven't been hooked before the payload runs.",
    },
    {
      icon: Bug,
      title: "Anti-dump",
      desc: "Decrypted source is scrubbed from memory after load, and known saveinstance / decompile dumpers are rejected.",
    },
    {
      icon: Eye,
      title: "Anti-logger / anti-envy",
      desc: "Detects hooked print, environment loggers, and spy globals that try to lift your script at runtime.",
    },
    {
      icon: KeyRound,
      title: "Key system + HWID lock",
      desc: "Generate keys per script or project, lock to hardware IDs on first use, and revoke or expire them anytime.",
    },
    {
      icon: Code2,
      title: "Raw executor endpoint",
      desc: "Every script gets a /raw URL serving the protected build, plus an authenticated loadstring loader for executors.",
    },
  ]

  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">LuaForge</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<a href="https://discord.gg/kastorhub" target="_blank" rel="noopener noreferrer" />}
            >
              Discord
            </Button>
            <Button nativeButton={false} render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Lua script hosting and protection
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Host and obfuscate your Lua scripts with real protection
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
          Drop in your source, and LuaForge builds an obfuscated, guarded version with anti-tamper, anti-dump, and
          anti-logger protection, served at a raw endpoint your Roblox executor can run.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Start protecting
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Code2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span>LuaForge — made by KastorHub</span>
          </div>
          <a
            href="https://discord.gg/kastorhub"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            discord.gg/kastorhub
          </a>
        </div>
      </footer>
    </div>
  )
}
