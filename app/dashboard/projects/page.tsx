export default function ProjectsPage() {
  return (
    <main className="flex-1 overflow-x-hidden px-6 py-6">
      <div className="max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projects</p>
          <h1 className="mt-1 text-2xl font-bold">Your Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your Lua script projects and obfuscation settings.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No projects yet. Create your first project to get started.</p>
        </div>
      </div>
    </main>
  )
}
