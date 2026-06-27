"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { revokeKey, resetHwid, deleteKey } from "@/app/actions/dashboard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Copy } from "lucide-react"

type KeyRow = {
  id: string
  key: string
  projectName: string
  scriptName: string | null
  hwid: string | null
  status: string
  expiresAt: Date | null
}

const filters = ["all", "active", "revoked", "expired"] as const

export function KeysView({ keys }: { keys: KeyRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [filter, setFilter] = useState<(typeof filters)[number]>("all")

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
