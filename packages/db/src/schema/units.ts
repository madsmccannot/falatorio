import {
  pgTable,
  uuid,
  integer,
  jsonb,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { sections } from "./sections.js";

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  title: jsonb("title").notNull().$type<Record<string, string>>(),
  theme: varchar("theme", { length: 255 }).notNull(),
  description: jsonb("description").$type<Record<string, string>>(),
  guidePhrases: jsonb("guide_phrases").$type<Array<Record<string, string>>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
