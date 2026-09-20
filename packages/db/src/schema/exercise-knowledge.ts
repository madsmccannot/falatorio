import {
  pgTable,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { exercises } from "./exercises";
import { knowledgeItems } from "./knowledge-items";

export const exerciseKnowledge = pgTable("exercise_knowledge", {
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  knowledgeItemId: uuid("knowledge_item_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.exerciseId, table.knowledgeItemId] }),
}));
