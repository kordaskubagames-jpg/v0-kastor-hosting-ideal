import { getStats } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"

export default async function AnalyticsPage() {
  const stats = await getStats()

  const cards = [
    { label: "Total keys", value: stats.keys, hint: "All generated" },
    { label: "Active keys", value: stats.activeKeys, hint: `${stats.keys ? Math.round((stats.activeKeys / stats.keys) * 100) : 0}% of total` },
    { label: "Protected builds", value: stats.builds, hint: "Scripts obfuscated" },
    { label: "Executions", value: stats.loads, hint: "Loader deliveries" },
    { label: "Projects", value: stats.projects, hint: "Total projects" },
    { label: "Scripts", value: stats.scripts, hint: "Hosted scripts" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Key performance, deliveries, and protection activity across your projects.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-4xl font-bold text-primary">{c.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
