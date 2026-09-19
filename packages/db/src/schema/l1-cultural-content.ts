import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { l1CodeEnum, cefrEnum } from "./users";

export const culturalContentTypeEnum = pgEnum("cultural_content_type", [
  "joke", "expression", "meme", "reference",
]);

export const l1CulturalContent = pgTable("l1_cultural_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  l1Code: l1CodeEnum("l1_code").notNull(),
  type: culturalContentTypeEnum("type").notNull(),
  contentPt: text("content_pt").notNull(),
  contentL1: text("content_l1").notNull(),
  explanation: text("explanation").notNull(),
  cefrMin: cefrEnum("cefr_min").notNull().default("A1"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  l1Idx: index("l1_cultural_content_l1_idx").on(table.l1Code),
}));
