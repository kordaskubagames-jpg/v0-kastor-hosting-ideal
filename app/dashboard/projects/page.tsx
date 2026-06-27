import { getProjects } from "@/app/actions/dashboard"
import { ProjectsView } from "@/components/projects-view"

export default async function ProjectsPage() {
  const projects = await getProjects()
  return <ProjectsView projects={projects} />
}
