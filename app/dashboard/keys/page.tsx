import { getKeysWithNames, getProjectsWithScripts } from "@/app/actions/dashboard"
import { KeysView } from "@/components/keys-view"

export default async function KeysPage() {
  const [keys, projects] = await Promise.all([getKeysWithNames(), getProjectsWithScripts()])
  return <KeysView keys={keys} projects={projects} />
}
