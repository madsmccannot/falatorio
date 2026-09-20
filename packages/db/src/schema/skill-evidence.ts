import {
  pgTable,
  uuid,
  real,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { knowledgeItems } from "./knowledge-items";
import { exercises } from "./exercises";

export const skillEvidence = pgTable("skill_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  knowledgeItemId: uuid("knowledge_item_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").references(() => exercises.id, { onDelete: "set null" }),
  score: real("score").notNull(),
  exerciseType: varchar("exercise_type", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
