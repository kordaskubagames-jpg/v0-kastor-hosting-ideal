import { db } from "@/lib/db"
import { scripts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Raw protected build endpoint. A Roblox executor can read this directly:
//   loadstring(game:HttpGet("<host>/raw/<scriptId>"))()
// Returns the obfuscated build as plain text.
export async function GET(_req: Request, { params }: { params: Promise<{ scriptId: string }> }) {
  const { scriptId } = await params
  const [s] = await db.select().from(scripts).where(eq(scripts.id, scriptId))

  if (!s || !s.obfuscated) {
    return new Response("-- script not found or not built yet", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  }

  return new Response(s.obfuscated, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}
