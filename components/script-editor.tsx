"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { saveAndBuild, runSyntaxCheck } from "@/app/actions/dashboard"
import { PRESET_META, type ObfPreset } from "@/lib/obfuscator"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, ShieldCheck, Bug, Eye, Copy, UploadCloud, CheckCheck, Lock } from "lucide-react"

type Script = {
  id: string
  name: string
  source: string
  obfuscated: string
  preset: string
  antiTamper: boolean
  antiDump: boolean
  antiLogger: boolean
  buildAt: Date | null
}

const toggles = [
  { key: "antiTamper", label: "Anti-tamper", icon: ShieldCheck, desc: "Block hooked loadstring / pcall" },
  { key: "antiDump", label: "Anti-dump", icon: Bug, desc: "Scrub memory, reject dumpers" },
  { key: "antiLogger", label: "Anti-logger / anti-envy", icon: Eye, desc: "Detect loggers & spy globals" },
] as const

export function ScriptEditor({ script, baseUrl }: { script: Script; baseUrl: string }) {
  const [source, setSource] = useState(script.source)
  const [obf, setObf] = useState(script.obfuscated)
  const [preset, setPreset] = useState<ObfPreset>((script.preset as ObfPreset) || "prometheus")
  const [protections, setProtections] = useState({
    antiTamper: script.antiTamper,
    antiDump: script.antiDump,
    antiLogger: script.antiLogger,
  })
  const [pending, startTransition] = useTransition()
  const [tab, setTab] = useState<"source" | "output">("source")

  const rawUrl = `${baseUrl}/raw/${script.id}`

  const onFile = async (file: File) => {
    const text = await file.text()
    setSource(text)
    toast.success(`Loaded ${file.name}`)
  }

  const check = () => {
    startTransition(async () => {
      const res = await runSyntaxCheck(source)
      if (res.ok) toast.success(res.message)
      else toast.error(res.message)
    })
  }

  const build = () => {
    startTransition(async () => {
      const res = await saveAndBuild(script.id, source, { preset, ...protections })
      if (!res.ok) {
        toast.error(res.message)
        return
      }
      setObf(res.obfuscated ?? "")
      setTab("output")
      toast.success(res.message)
    })
  }

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
        Back to projects
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{script.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saving re-protects the source. The loader serves the protected build on the next run.
          </p>
        </div>
        {script.buildAt && <Badge className="bg-emerald-500/15 text-emerald-400">Built</Badge>}
      </div>

      {/* Obfuscation preset */}
      <Card className="mt-6 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Obfuscation engine</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {PRESET_META.find((p) => p.value === preset)?.desc}
            </p>
          </div>
          <div className="w-full sm:w-56">
            <Select value={preset} onValueChange={(v) => setPreset(v as ObfPreset)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRESET_META.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Protections */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {toggles.map((t) => {
          const active = protections[t.key]
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setProtections((p) => ({ ...p, [t.key]: !p[t.key] }))}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                active ? "border-primary bg-accent" : "border-border bg-card hover:border-muted-foreground/40"
              }`}
            >
              <t.icon className={`mt-0.5 h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.label}</span>
                  <span
                    className={`ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    }`}
                  >
                    {active && <CheckCheck className="h-3 w-3" />}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border">
        {(["source", "output"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t === "source" ? "Script source" : "Obfuscated output"}
          </button>
        ))}
      </div>

      {tab === "source" ? (
        <Card className="mt-4 p-4">
          <label
            className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border py-8 text-center transition-colors hover:border-primary/60"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const f = e.dataTransfer.files?.[0]
              if (f) onFile(f)
            }}
          >
            <UploadCloud className="h-7 w-7 text-muted-foreground" />
            <span className="text-sm font-medium">
              Drop your script file here <span className="text-muted-foreground">or click to browse</span>
            </span>
            <span className="text-xs text-muted-foreground">.lua or .txt files, max 1MB</span>
            <input
              type="file"
              accept=".lua,.txt"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>

          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={`local Players = game:GetService("Players")\n-- paste your Lua source here`}
            className="mt-4 h-80 resize-none font-mono text-xs leading-relaxed"
            spellCheck={false}
          />

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={check} disabled={pending}>
              Check syntax
            </Button>
            <Button onClick={build} disabled={pending}>
              {pending ? "Building..." : "Save & build"}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="mt-4 p-4">
          {obf ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Raw endpoint:</span>
                  <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs">{rawUrl}</code>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => copy(rawUrl, "Raw URL copied")}>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Raw URL
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copy(obf, "Build copied")}>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Build
                  </Button>
                </div>
              </div>
              <pre className="mt-3 h-96 overflow-auto rounded-lg bg-secondary p-3 font-mono text-xs leading-relaxed text-muted-foreground">
                {obf}
              </pre>
            </>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No build yet. Paste your source and click Save & build.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
