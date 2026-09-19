import {
  pgTable,
  uuid,
  real,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { exercises } from "./exercises.js";

export const userProgress = pgTable("user_progress", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  stability: real("stability").notNull().default(0),
  difficulty: real("difficulty").notNull().default(0),
  nextReview: timestamp("next_review", { withTimezone: true }).notNull().defaultNow(),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  lastScore: real("last_score").notNull().default(0),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.exerciseId] }),
}));
