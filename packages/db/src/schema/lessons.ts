import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  jsonb,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { units } from "./units";

export const nodeTypeEnum = pgEnum("node_type", ["lesson", "chest"]);

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  unitId: uuid("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  nodeType: nodeTypeEnum("node_type").notNull().default("lesson"),
  grammarFocus: jsonb("grammar_focus").notNull().$type<string[]>().default([]),
  vocabTarget: jsonb("vocab_target").notNull().$type<string[]>().default([]),
  rewardConfig: jsonb("reward_config").$type<{ type: "ouro" | "xp_boost" | "super_days" | "streak_freeze"; amount: number }>(),
  unlockThreshold: real("unlock_threshold").notNull().default(0.8),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
