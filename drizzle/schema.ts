import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const repositories = mysqlTable("repositories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  repoUrl: varchar("repoUrl", { length: 512 }).notNull(),
  repoName: varchar("repoName", { length: 256 }).notNull(),
  repoOwner: varchar("repoOwner", { length: 256 }).notNull(),
  description: text("description"),
  language: varchar("language", { length: 64 }),
  fileCount: int("fileCount").default(0),
  totalLines: int("totalLines").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = typeof repositories.$inferInsert;

export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  repositoryId: int("repositoryId").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  narrative: text("narrative").default(""),
  architectureMap: text("architectureMap").default(""),
  heatmap: text("heatmap").default(""),
  fileTree: text("fileTree").default(""),
  complexity: int("complexity").default(0),
  status: mysqlEnum("status", ["pending", "analyzing", "completed", "failed"]).default("analyzing"),
  error: text("error").default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull().references(() => analyses.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  fileReferences: text("fileReferences"), // JSON array of {file, line}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export const onboardingPaths = mysqlTable("onboardingPaths", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull().references(() => analyses.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["Frontend", "Backend", "DevOps"]).notNull(),
  path: text("path"), // JSON array of steps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OnboardingPath = typeof onboardingPaths.$inferSelect;
export type InsertOnboardingPath = typeof onboardingPaths.$inferInsert;