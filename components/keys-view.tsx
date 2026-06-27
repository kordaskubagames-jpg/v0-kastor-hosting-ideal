"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { revokeKey, resetHwid, deleteKey, generateKeys } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Copy, KeyRound } from "lucide-react"

type KeyRow = {
  id: string
  key: string
  projectName: string
  scriptName: string | null
  hwid: string | null
  status: string
  expiresAt: Date | null
}

type ProjectOption = {
  id: string
  name: string
  scripts: { id: string; name: string }[]
}

const filters = ["all", "active", "revoked", "expired"] as const

export function KeysView({ keys, projects }: { keys: KeyRow[]; projects: ProjectOption[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [filter, setFilter] = useState<(typeof filters)[number]>("all")

  // key generator state
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "")
  const [scope, setScope] = useState<string>("all")
  const [count, setCount] = useState(1)
  const [duration, setDuration] = useState("7")
  const [generated, setGenerated] = useState<string[]>([])

  const activeProject = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId])

  const copyText = (text: string, msg = "Copied") => {
    navigator.clipboard.writeText(text)
    toast.success(msg)
  }

  const doGenerate = () => {
    if (!projectId) {
      toast.error("Create a project first")
      return
    }
    startTransition(async () => {
      const scriptId = scope === "all" ? null : scope
      const days = duration === "never" ? null : Number(duration)
      const result = await generateKeys(projectId, scriptId, count, days)
      setGenerated(result)
      toast.success(`Generated ${result.length} key(s)`)
      router.refresh()
    })
  }

  const now = Date.now()
  const statusOf = (k: KeyRow) => {
    if (k.status === "revoked") return "revoked"
    if (k.expiresAt && new Date(k.expiresAt).getTime() < now) return "expired"
    return "active"
  }

  const visible = keys.filter((k) => (filter === "all" ? true : statusOf(k) === filter))

  const act = (fn: () => Promise<void>, msg: string) => {
    startTransition(async () => {
      await fn()
      toast.success(msg)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Keys</p>
      <h1 className="mt-1 text-2xl font-bold">All keys</h1>

      {/* Generate keys */}
      <Card className="mt-6 p-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Generate keys</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick which project (and optionally which script) the key unlocks.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="min-w-44 flex-1">
            <label className="mb-1 block text-sm font-medium">Project</label>
            <Select
              value={projectId}
              onValueChange={(v) => {
                setProjectId(v ?? "")
                setScope("all")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No projects yet
                  </SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-44 flex-1">
            <label className="mb-1 block text-sm font-medium">Script scope</label>
            <Select value={scope} onValueChange={(v) => setScope(v ?? "all")} disabled={!activeProject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All scripts</SelectItem>
                {activeProject?.scripts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-24">
            <label className="mb-1 block text-sm font-medium">Count</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>

          <div className="w-36">
            <label className="mb-1 block text-sm font-medium">Duration</label>
            <Select value={duration} onValueChange={(v) => setDuration(v ?? "7")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="never">Lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={doGenerate} disabled={pending || !projectId}>
            Generate
          </Button>
        </div>

        {generated.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-secondary p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">New keys</p>
              <Button variant="ghost" size="sm" onClick={() => copyText(generated.join("\n"), "All keys copied")}>
                <Copy className="mr-1 h-3.5 w-3.5" />
                Copy all
              </Button>
            </div>
            <div className="mt-2 flex flex-col gap-1 font-mono text-xs">
              {generated.map((k) => (
                <span key={k}>{k}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_auto_1fr_auto] items-center gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Key</span>
          <span>Project</span>
          <span>Scope</span>
          <span className="w-20 text-center">Status</span>
          <span>HWID</span>
          <span className="w-40 text-right">Actions</span>
        </div>
        {visible.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No keys here.</p>
        ) : (
          visible.map((k) => {
            const st = statusOf(k)
            return (
              <div
                key={k.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_auto_1fr_auto] items-center gap-4 border-b border-border px-5 py-4 text-sm last:border-0"
              >
                <span className="font-mono text-xs">{k.key}</span>
                <span className="truncate">{k.projectName}</span>
                <span className="truncate text-muted-foreground">{k.scriptName ?? "All scripts"}</span>
                <span className="w-20 text-center">
                  <Badge
                    className={
                      st === "active"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : st === "revoked"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-400"
                    }
                  >
                    {st}
                  </Badge>
                </span>
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {k.hwid ? `${k.hwid.slice(0, 14)}...` : "—"}
                </span>
                <span className="flex w-40 items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(k.key)
                      toast.success("Key copied")
                    }}
                    aria-label="Copy key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {k.hwid && (
                    <Button variant="ghost" size="sm" onClick={() => act(() => resetHwid(k.id), "HWID reset")}>
                      Reset
                    </Button>
                  )}
                  {st === "active" && (
                    <Button variant="ghost" size="sm" onClick={() => act(() => revokeKey(k.id), "Key revoked")}>
                      Revoke
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => act(() => deleteKey(k.id), "Key deleted")}
                    disabled={pending}
                  >
                    Delete
                  </Button>
                </span>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
