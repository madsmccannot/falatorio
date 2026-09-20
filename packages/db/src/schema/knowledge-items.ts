import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { skills } from "./skills";
import { cefrEnum } from "./users";

export const knowledgeItems = pgTable("knowledge_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 128 }).notNull().unique(),
  cefrLevel: cefrEnum("cefr_level").notNull(),
  rule: text("rule").notNull(),
  examples: jsonb("examples").notNull().$type<string[]>().default([]),
  counterexamples: jsonb("counterexamples").$type<string[]>().default([]),
  commonErrors: jsonb("common_errors").$type<string[]>().default([]),
  l1Notes: jsonb("l1_notes").$type<Record<string, string>>(),
  shortExplanation: jsonb("short_explanation").$type<Record<string, string>>(),
  masteryCriteria: jsonb("mastery_criteria").$type<{ minAccuracy: number; minVariety: number; minReps: number }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
