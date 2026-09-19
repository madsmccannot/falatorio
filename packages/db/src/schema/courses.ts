import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { l1CodeEnum, cefrEnum } from "./users.js";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  l1Source: l1CodeEnum("l1_source").notNull(),
  target: varchar("target", { length: 10 }).notNull().default("pt-PT"),
  title: jsonb("title").notNull().$type<Record<string, string>>(),
  description: jsonb("description").$type<Record<string, string>>(),
  cefrMin: cefrEnum("cefr_min").notNull().default("A1"),
  cefrMax: cefrEnum("cefr_max").notNull().default("B2"),
  sortOrder: varchar("sort_order", { length: 10 }).notNull().default("0"),
  active: varchar("active", { length: 5 }).notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
