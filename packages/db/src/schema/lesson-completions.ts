import {
  pgTable,
  uuid,
  real,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { lessons } from "./lessons.js";

export const lessonCompletions = pgTable("lesson_completions", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  bestAccuracy: real("best_accuracy").notNull().default(0),
  attempts: integer("attempts").notNull().default(1),
  firstCompletedAt: timestamp("first_completed_at", { withTimezone: true }).notNull().defaultNow(),
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.lessonId] }),
}));
