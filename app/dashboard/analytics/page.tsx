export default function AnalyticsPage() {
  return (
    <main className="flex-1 overflow-x-hidden px-6 py-6">
      <div className="max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">View detailed analytics about your script deliveries and protection performance.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No analytics data available. Start protecting scripts to see data.</p>
        </div>
      </div>
    </main>
  )
}
