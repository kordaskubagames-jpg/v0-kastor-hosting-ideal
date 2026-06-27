import { db } from "@/lib/db"
import { scripts, keys, loads } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

// On any auth failure we return Lua that KICKS the player out of the game.
// The loadstring(...)() in the loader executes this immediately, so a bad key
// or mismatched HWID boots the user before the real script can run.
function deny(msg: string) {
  const reason = `[KastorHub] ${msg.replace(/"/g, "'")} — get a key at discord.gg/kastorhub`
  const lua = `-- access denied: ${msg}
local _p = game:GetService("Players")
local _lp = _p.LocalPlayer
if _lp then
  pcall(function() _lp:Kick("${reason}") end)
end
-- fallback hard stop if Kick is blocked
while true do task.wait(1e9) end
return false`
  return new Response(lua, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  })
}

// Authenticated loader endpoint used by the loadstring snippet:
//   local key = "KF-XXXX-XXXX-XXXX"
//   (loadstring or load)(game:HttpGet("<host>/v1/load/<scriptId>?key=" ..
//     game:GetService("HttpService"):UrlEncode(key) .. "&hwid=" .. hwid))()
export async function GET(req: Request, { params }: { params: Promise<{ scriptId: string }> }) {
  const { scriptId } = await params
  const url = new URL(req.url)
  const key = url.searchParams.get("key")?.trim()
  const hwid = url.searchParams.get("hwid")?.trim() || null

  const [s] = await db.select().from(scripts).where(eq(scripts.id, scriptId))
  if (!s || !s.obfuscated) return deny("script not found or not built")

  if (!key) return deny("missing key")

  const [k] = await db.select().from(keys).where(eq(keys.key, key))
  if (!k) return deny("invalid key")
  if (k.status !== "active") return deny("key revoked")
  if (k.expiresAt && new Date(k.expiresAt) < new Date()) return deny("key expired")

  // Scope: a key bound to a specific script must match; "all scripts" keys pass.
  if (k.scriptId && k.scriptId !== scriptId) return deny("key not valid for this script")
  if (k.projectId !== s.projectId) return deny("key not valid for this project")

  // HWID lock: bind on first use, reject mismatches afterward.
  if (hwid) {
    if (!k.hwid) {
      await db.update(keys).set({ hwid }).where(eq(keys.id, k.id))
    } else if (k.hwid !== hwid) {
      await db.insert(loads).values({ id: id("load"), userId: s.userId, scriptId, hwid, ok: false })
      return deny("hwid mismatch")
    }
  }

  await db.insert(loads).values({ id: id("load"), userId: s.userId, scriptId, hwid, ok: true })

  return new Response(s.obfuscated, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  })
}
