import {
  pgTable,
  uuid,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { knowledgeItems } from "./knowledge-items";

export const knowledgeRelationTypeEnum = pgEnum("knowledge_relation_type", [
  "related",
  "confusable_with",
  "reinforces",
]);

export const knowledgeRelations = pgTable("knowledge_relations", {
  sourceId: uuid("source_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
  targetId: uuid("target_id").notNull().references(() => knowledgeItems.id, { onDelete: "cascade" }),
  relationType: knowledgeRelationTypeEnum("relation_type").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.sourceId, table.targetId, table.relationType] }),
}));
