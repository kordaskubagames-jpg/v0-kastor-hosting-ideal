import { getKeysWithNames } from "@/app/actions/dashboard"
import { KeysView } from "@/components/keys-view"

export default async function KeysPage() {
  const keys = await getKeysWithNames()
  return <KeysView keys={keys} />
}
