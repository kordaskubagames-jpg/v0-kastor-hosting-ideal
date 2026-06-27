import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getScript } from "@/app/actions/dashboard"
import { ScriptEditor } from "@/components/script-editor"

export default async function ScriptEditPage({ params }: { params: Promise<{ scriptId: string }> }) {
  const { scriptId } = await params
  const script = await getScript(scriptId)
  if (!script) notFound()

  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "https"
  const baseUrl = `${proto}://${host}`

  return <ScriptEditor script={script} baseUrl={baseUrl} />
}
