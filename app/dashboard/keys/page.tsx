export default function KeysPage() {
  return (
    <main className="flex-1 overflow-x-hidden px-6 py-6">
      <div className="max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keys</p>
          <h1 className="mt-1 text-2xl font-bold">Access Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">Generate and manage your API keys for script delivery and protection.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No keys generated yet. Create a new key in your first project.</p>
        </div>
      </div>
    </main>
  )
}
