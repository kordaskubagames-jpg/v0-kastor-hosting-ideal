import Link from "next/link"
import { getStats } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function OverviewPage() {
  const stats = await getStats()

  const cards = [
    { label: "Projects", value: stats.projects, hint: "Total projects" },
    { label: "Scripts", value: stats.scripts, hint: "Hosted scripts" },
    { label: "Protected builds", value: stats.builds, hint: "Scripts obfuscated" },
    { label: "Total keys", value: stats.keys, hint: "All generated keys" },
    { label: "Active keys", value: stats.activeKeys, hint: "Currently valid" },
    { label: "Executions", value: stats.loads, hint: "Loader deliveries" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overview</p>
          <h1 className="mt-1 text-2xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Script usage, protected builds, keys, and delivery activity across your projects.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/projects" />}>
          New project
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-4xl font-bold text-primary">{c.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold">How it works</h2>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>1. Create a project and add a script.</li>
          <li>2. Paste your Lua source, pick your protections, and save to build the obfuscated version.</li>
          <li>3. Generate a key and share the loadstring loader. The executor fetches the protected build from /raw.</li>
        </ol>
      </Card>
    </div>
  )
}
