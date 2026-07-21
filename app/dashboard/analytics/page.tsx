import { getStats } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"

export default async function AnalyticsPage() {
  const stats = await getStats()

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Analytics</p>
        <h1 className="mt-1 text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View detailed analytics about your script deliveries and protection performance.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Executions</p>
          <p className="mt-2 text-4xl font-bold text-primary">{stats.loads}</p>
          <p className="mt-2 text-xs text-muted-foreground">Loader deliveries to executors</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Protected Scripts</p>
          <p className="mt-2 text-4xl font-bold text-primary">{stats.builds}</p>
          <p className="mt-2 text-xs text-muted-foreground">Scripts with obfuscated build</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Keys</p>
          <p className="mt-2 text-4xl font-bold text-primary">{stats.activeKeys}</p>
          <p className="mt-2 text-xs text-muted-foreground">Currently valid access keys</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Keys</p>
          <p className="mt-2 text-4xl font-bold text-primary">{stats.keys}</p>
          <p className="mt-2 text-xs text-muted-foreground">All generated keys</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projects</p>
          <p className="mt-2 text-4xl font-bold text-primary">{stats.projects}</p>
          <p className="mt-2 text-xs text-muted-foreground">Total projects created</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Scripts</p>
          <p className="mt-2 text-4xl font-bold text-primary">{stats.scripts}</p>
          <p className="mt-2 text-xs text-muted-foreground">Total scripts hosted</p>
        </Card>
      </div>
    </div>
  )
}
