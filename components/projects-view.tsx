"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createProject, deleteProject } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

type Project = {
  id: string
  name: string
  enabled: boolean
  scriptCount: number
  keyCount: number
}

export function ProjectsView({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [pending, startTransition] = useTransition()

  const create = () => {
    if (!name.trim()) return
    startTransition(async () => {
      await createProject(name)
      setName("")
      setShowForm(false)
      toast.success("Project created")
      router.refresh()
    })
  }

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteProject(id)
      toast.success("Project deleted")
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projects</p>
          <h1 className="mt-1 text-2xl font-bold">Protected scripts</h1>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus className="mr-1 h-4 w-4" />
          New project
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6 flex items-end gap-3 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Project name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. KASTOR PREMIUM"
              onKeyDown={(e) => e.key === "Enter" && create()}
              autoFocus
            />
          </div>
          <Button onClick={create} disabled={pending}>
            Create
          </Button>
        </Card>
      )}

      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Name</span>
          <span className="w-16 text-center">Scripts</span>
          <span className="w-16 text-center">Keys</span>
          <span className="w-20 text-center">Status</span>
          <span className="w-20 text-right">Action</span>
        </div>
        {projects.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No projects yet. Create one to get started.
          </p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-0"
            >
              <Link href={`/dashboard/projects/${p.id}`} className="font-medium hover:text-primary">
                {p.name}
              </Link>
              <span className="w-16 text-center text-sm">{p.scriptCount}</span>
              <span className="w-16 text-center text-sm">{p.keyCount}</span>
              <span className="w-20 text-center">
                <Badge variant={p.enabled ? "default" : "secondary"} className="gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${p.enabled ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  {p.enabled ? "Enabled" : "Off"}
                </Badge>
              </span>
              <span className="flex w-20 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(p.id)}
                  disabled={pending}
                  aria-label="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
