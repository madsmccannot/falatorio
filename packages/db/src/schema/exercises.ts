import {
  pgTable,
  uuid,
  jsonb,
  text,
  integer,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { lessons } from "./lessons";

export const exerciseTypeEnum = pgEnum("exercise_type", [
  "translate_l1_to_pt",
  "translate_pt_to_l1",
  "listen_and_type",
  "speak_and_score",
  "fill_blank",
  "match_pairs",
  "pick_correct",
  "reorder_words",
]);

export const exerciseStatusEnum = pgEnum("exercise_status", [
  "draft", "review", "live",
]);

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  type: exerciseTypeEnum("type").notNull(),
  prompt: jsonb("prompt").notNull(),
  acceptedAnswers: text("accepted_answers").array().notNull(),
  audioUrl: varchar("audio_url", { length: 2048 }),
  audioNativeUrl: varchar("audio_native_url", { length: 2048 }),
  difficulty: integer("difficulty").notNull().default(1),
  l1Tip: jsonb("l1_tip").$type<Record<string, string>>(),
  version: integer("version").notNull().default(1),
  status: exerciseStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
