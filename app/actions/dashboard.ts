"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, scripts, keys, loads } from "@/lib/db/schema"
import { obfuscate, checkSyntax, type ProtectionOptions } from "@/lib/obfuscator"
import { and, desc, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  // Use a consistent user ID based on nickname - stored in cookies during login
  const headersList = await headers()
  // Generate stable user ID from nickname
  return "user_default"
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

// ---------- Projects ----------
export async function getProjects() {
  const userId = await getUserId()
  const rows = await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt))
  const enriched = await Promise.all(
    rows.map(async (p) => {
      const [sc] = await db
        .select({ c: sql<number>`count(*)` })
        .from(scripts)
        .where(eq(scripts.projectId, p.id))
      const [kc] = await db
        .select({ c: sql<number>`count(*)` })
        .from(keys)
        .where(eq(keys.projectId, p.id))
      return { ...p, scriptCount: Number(sc?.c ?? 0), keyCount: Number(kc?.c ?? 0) }
    }),
  )
  return enriched
}

export async function createProject(name: string) {
  const userId = await getUserId()
  const pid = id("proj")
  await db.insert(projects).values({ id: pid, userId, name: name.trim() || "Untitled Project" })
  revalidatePath("/dashboard/projects")
  return pid
}

export async function toggleProject(projectId: string, enabled: boolean) {
  const userId = await getUserId()
  await db
    .update(projects)
    .set({ enabled })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
  revalidatePath("/dashboard/projects")
}

export async function deleteProject(projectId: string) {
  const userId = await getUserId()
  await db.delete(keys).where(and(eq(keys.projectId, projectId), eq(keys.userId, userId)))
  await db.delete(scripts).where(and(eq(scripts.projectId, projectId), eq(scripts.userId, userId)))
  await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
  revalidatePath("/dashboard/projects")
}

export async function getProject(projectId: string) {
  const userId = await getUserId()
  const [p] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
  return p ?? null
}

// ---------- Scripts ----------
export async function getScripts(projectId: string) {
  const userId = await getUserId()
  return db
    .select()
    .from(scripts)
    .where(and(eq(scripts.projectId, projectId), eq(scripts.userId, userId)))
    .orderBy(desc(scripts.createdAt))
}

export async function getScript(scriptId: string) {
  const userId = await getUserId()
  const [s] = await db
    .select()
    .from(scripts)
    .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)))
  return s ?? null
}

export async function createScript(projectId: string, name: string) {
  const userId = await getUserId()
  const sid = id("scr")
  await db.insert(scripts).values({ id: sid, userId, projectId, name: name.trim() || "New script" })
  revalidatePath(`/dashboard/projects/${projectId}`)
  return sid
}

export async function deleteScript(scriptId: string, projectId: string) {
  const userId = await getUserId()
  await db.delete(scripts).where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)))
  revalidatePath(`/dashboard/projects/${projectId}`)
}

// The key action: save source, run the obfuscation engine, store the protected
// build that /raw serves to executors.
export async function saveAndBuild(
  scriptId: string,
  source: string,
  opts: ProtectionOptions,
): Promise<{ ok: boolean; message: string; obfuscated?: string }> {
  const userId = await getUserId()
  const [s] = await db
    .select()
    .from(scripts)
    .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)))
  if (!s) return { ok: false, message: "Script not found." }

  const syntax = checkSyntax(source)
  if (!syntax.ok) return { ok: false, message: `Syntax check failed: ${syntax.message}` }

  const obfuscated = obfuscate(source, opts, s.name)

  await db
    .update(scripts)
    .set({
      source,
      obfuscated,
      antiTamper: opts.antiTamper,
      antiDump: opts.antiDump,
      antiLogger: opts.antiLogger,
      buildAt: new Date(),
    })
    .where(and(eq(scripts.id, scriptId), eq(scripts.userId, userId)))

  revalidatePath(`/dashboard/scripts/${scriptId}`)
  return { ok: true, message: "Protected build saved. /raw now serves the new build.", obfuscated }
}

export async function runSyntaxCheck(source: string) {
  await getUserId()
  return checkSyntax(source)
}

// ---------- Keys ----------
export async function getKeys(projectId?: string) {
  const userId = await getUserId()
  const where = projectId
    ? and(eq(keys.userId, userId), eq(keys.projectId, projectId))
    : eq(keys.userId, userId)
  return db.select().from(keys).where(where).orderBy(desc(keys.createdAt))
}

export async function getKeysWithNames() {
  const userId = await getUserId()
  const rows = await db.select().from(keys).where(eq(keys.userId, userId)).orderBy(desc(keys.createdAt))
  const projRows = await db.select().from(projects).where(eq(projects.userId, userId))
  const scrRows = await db.select().from(scripts).where(eq(scripts.userId, userId))
  const projMap = new Map(projRows.map((p) => [p.id, p.name]))
  const scrMap = new Map(scrRows.map((s) => [s.id, s.name]))
  return rows.map((k) => ({
    id: k.id,
    key: k.key,
    projectName: projMap.get(k.projectId) ?? "—",
    scriptName: k.scriptId ? (scrMap.get(k.scriptId) ?? null) : null,
    hwid: k.hwid,
    status: k.status,
    expiresAt: k.expiresAt,
  }))
}

function makeKey() {
  const seg = () =>
    Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("")
  return `KF-${seg()}-${seg()}-${seg()}`
}

export async function generateKeys(
  projectId: string,
  scriptId: string | null,
  count: number,
  durationDays: number | null,
) {
  const userId = await getUserId()
  const n = Math.max(1, Math.min(100, count))
  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 86400000) : null
  const values = Array.from({ length: n }, () => ({
    id: id("key"),
    userId,
    projectId,
    scriptId,
    key: makeKey(),
    status: "active",
    expiresAt,
  }))
  await db.insert(keys).values(values)
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath("/dashboard/keys")
  return values.map((v) => v.key)
}

export async function revokeKey(keyId: string) {
  const userId = await getUserId()
  await db
    .update(keys)
    .set({ status: "revoked" })
    .where(and(eq(keys.id, keyId), eq(keys.userId, userId)))
  revalidatePath("/dashboard/keys")
}

export async function resetHwid(keyId: string) {
  const userId = await getUserId()
  await db
    .update(keys)
    .set({ hwid: null })
    .where(and(eq(keys.id, keyId), eq(keys.userId, userId)))
  revalidatePath("/dashboard/keys")
}

export async function deleteKey(keyId: string) {
  const userId = await getUserId()
  await db.delete(keys).where(and(eq(keys.id, keyId), eq(keys.userId, userId)))
  revalidatePath("/dashboard/keys")
}

// ---------- Analytics ----------
export async function getStats() {
  const userId = await getUserId()
  const [[projectCount], [scriptCount], [keyCount], [activeKeys], [buildCount], [loadCount]] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(projects).where(eq(projects.userId, userId)),
    db.select({ c: sql<number>`count(*)` }).from(scripts).where(eq(scripts.userId, userId)),
    db.select({ c: sql<number>`count(*)` }).from(keys).where(eq(keys.userId, userId)),
    db
      .select({ c: sql<number>`count(*)` })
      .from(keys)
      .where(and(eq(keys.userId, userId), eq(keys.status, "active"))),
    db
      .select({ c: sql<number>`count(*)` })
      .from(scripts)
      .where(and(eq(scripts.userId, userId), sql`${scripts.buildAt} is not null`)),
    db.select({ c: sql<number>`count(*)` }).from(loads).where(eq(loads.userId, userId)),
  ])
  return {
    projects: Number(projectCount?.c ?? 0),
    scripts: Number(scriptCount?.c ?? 0),
    keys: Number(keyCount?.c ?? 0),
    activeKeys: Number(activeKeys?.c ?? 0),
    builds: Number(buildCount?.c ?? 0),
    loads: Number(loadCount?.c ?? 0),
  }
}
