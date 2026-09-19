import {
  pgTable,
  uuid,
  integer,
  jsonb,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { units } from "./units";

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  grammarFocus: jsonb("grammar_focus").notNull().$type<string[]>().default([]),
  vocabTarget: jsonb("vocab_target").notNull().$type<string[]>().default([]),
  unlockThreshold: real("unlock_threshold").notNull().default(0.8),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
