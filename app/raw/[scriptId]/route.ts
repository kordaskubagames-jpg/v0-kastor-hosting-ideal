import { db } from "@/lib/db"
import { scripts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// Raw protected build endpoint. A Roblox executor can read this directly:
//   loadstring(game:HttpGet("<host>/raw/<scriptId>"))()
// Returns the obfuscated build as plain text.
export async function GET(req: Request, { params }: { params: Promise<{ scriptId: string }> }) {
  const ua = req.headers.get("user-agent") ?? ""

  // Block browsers - only allow Roblox executor requests
  const isRoblox = ua.toLowerCase().includes("roblox")
  if (!isRoblox) {
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Access Denied</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .code {
      font-size: 6rem;
      font-weight: 900;
      color: #ef4444;
      line-height: 1;
    }
    h1 {
      font-size: 1.5rem;
      margin-top: 1rem;
      color: #f1f1f1;
    }
    p {
      margin-top: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="code">403</div>
    <h1>Access Denied</h1>
    <p>This endpoint is only accessible by the executor.</p>
  </div>
</body>
</html>`,
      {
        status: 403,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    )
  }

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
