import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  name: text("name").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const scripts = pgTable("scripts", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  projectId: text("projectId").notNull(),
  name: text("name").notNull(),
  source: text("source").notNull().default(""),
  obfuscated: text("obfuscated").notNull().default(""),
  preset: text("preset").notNull().default("prometheus"),
  antiTamper: boolean("antiTamper").notNull().default(true),
  antiDump: boolean("antiDump").notNull().default(true),
  antiLogger: boolean("antiLogger").notNull().default(true),
  buildAt: timestamp("buildAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const keys = pgTable("keys", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  projectId: text("projectId").notNull(),
  scriptId: text("scriptId"),
  key: text("key").notNull().unique(),
  hwid: text("hwid"),
  status: text("status").notNull().default("active"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const loads = pgTable("loads", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  scriptId: text("scriptId").notNull(),
  hwid: text("hwid"),
  ok: boolean("ok").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
