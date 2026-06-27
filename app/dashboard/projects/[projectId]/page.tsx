import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getProject, getScripts } from "@/app/actions/dashboard"
import { ProjectDetailView } from "@/components/project-detail-view"

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const project = await getProject(projectId)
  if (!project) notFound()

  const scripts = await getScripts(projectId)
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "https"
  const baseUrl = `${proto}://${host}`

  return <ProjectDetailView project={project} scripts={scripts} baseUrl={baseUrl} />
}
