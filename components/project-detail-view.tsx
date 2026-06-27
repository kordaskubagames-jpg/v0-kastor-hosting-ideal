"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createScript, deleteScript, generateKeys } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Copy, Pencil, Trash2, ArrowLeft } from "lucide-react"

type Script = { id: string; name: string; buildAt: Date | null; antiTamper: boolean }
type Project = { id: string; name: string; enabled: boolean }

export function ProjectDetailView({
  project,
  scripts,
  baseUrl,
}: {
  project: Project
  scripts: Script[]
  baseUrl: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [newName, setNewName] = useState("")
  const [showAdd, setShowAdd] = useState(false)

  // key gen state
  const [scope, setScope] = useState<string>(scripts[0]?.id ?? "all")
  const [count, setCount] = useState(1)
  const [duration, setDuration] = useState("7")
  const [generated, setGenerated] = useState<string[]>([])

  const addScript = () => {
    if (!newName.trim()) return
    startTransition(async () => {
      const sid = await createScript(project.id, newName)
      toast.success("Script added")
      router.push(`/dashboard/scripts/${sid}`)
    })
  }

  const removeScript = (id: string) => {
    startTransition(async () => {
      await deleteScript(id, project.id)
      toast.success("Script deleted")
      router.refresh()
    })
  }

  const doGenerate = () => {
    startTransition(async () => {
      const scriptId = scope === "all" ? null : scope
      const days = duration === "never" ? null : Number(duration)
      const result = await generateKeys(project.id, scriptId, count, days)
      setGenerated(result)
      toast.success(`Generated ${result.length} key(s)`)
      router.refresh()
    })
  }

  const loaderFor = (scriptId: string) =>
    `-- KastorHub loader :: discord.gg/kastorhub\n-- Invalid key or HWID mismatch will kick the player from the game.\nlocal key = "KF-XXXX-XXXX-XXXX"\n(loadstring or load)(game:HttpGet("${baseUrl}/v1/load/${scriptId}?key=" .. game:GetService("HttpService"):UrlEncode(key) .. "&hwid=" .. (gethwid and gethwid() or "")))()`

  const copy = (text: string, msg = "Copied") => {
    navigator.clipboard.writeText(text)
    toast.success(msg)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Projects
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${project.enabled ? "bg-emerald-400" : "bg-muted-foreground"}`} />
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge variant="secondary">{project.enabled ? "Enabled" : "Disabled"}</Badge>
      </div>

      {/* Scripts */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scripts ({scripts.length})</h2>
        <Button size="sm" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="mr-1 h-4 w-4" />
          Add script
        </Button>
      </div>

      {showAdd && (
        <Card className="mt-3 flex items-end gap-3 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Script name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. kastor pinger"
              onKeyDown={(e) => e.key === "Enter" && addScript()}
              autoFocus
            />
          </div>
          <Button onClick={addScript} disabled={pending}>
            Create
          </Button>
        </Card>
      )}

      <Card className="mt-3 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Name</span>
          <span className="w-24 text-center">Build</span>
          <span className="w-48 text-right">Actions</span>
        </div>
        {scripts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No scripts yet.</p>
        ) : (
          scripts.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-0"
            >
              <span className="font-medium">{s.name}</span>
              <span className="w-24 text-center">
                {s.buildAt ? (
                  <Badge variant="default" className="bg-emerald-500/15 text-emerald-400">
                    built
                  </Badge>
                ) : (
                  <Badge variant="secondary">draft</Badge>
                )}
              </span>
              <span className="flex w-48 items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => copy(`${baseUrl}/raw/${s.id}`, "Raw URL copied")}>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Raw
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/dashboard/scripts/${s.id}`} />}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeScript(s.id)}
                  aria-label="Delete script"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </span>
            </div>
          ))
        )}
      </Card>

      {/* Loaders */}
      {scripts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Loaders</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Each script has its own loader. Share the one that matches what users should run.
          </p>
          {scripts.map((s) => (
            <Card key={s.id} className="mt-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.name}</span>
                <Button variant="ghost" size="sm" onClick={() => copy(loaderFor(s.id))}>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-secondary p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {loaderFor(s.id)}
              </pre>
            </Card>
          ))}
        </div>
      )}

      {/* Generate keys */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Generate keys</h2>
        <Card className="mt-3 p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-48 flex-1">
              <label className="mb-1 block text-sm font-medium">Script scope</label>
              <Select value={scope} onValueChange={(v) => setScope(v ?? "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All scripts</SelectItem>
                  {scripts.map((s) => (
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
            <Button onClick={doGenerate} disabled={pending}>
              Generate
            </Button>
          </div>

          {generated.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-secondary p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">New keys</p>
                <Button variant="ghost" size="sm" onClick={() => copy(generated.join("\n"), "All keys copied")}>
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
      </div>
    </div>
  )
}
