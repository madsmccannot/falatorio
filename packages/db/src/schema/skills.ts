import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { cefrEnum } from "./users";

export const skillDomainEnum = pgEnum("skill_domain", [
  "phonetics",
  "morphology",
  "tenses_moods",
  "determiners",
  "pronouns",
  "prepositions",
  "syntax",
  "lexicon",
  "pragmatics",
  "orthography",
]);

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 128 }).notNull().unique(),
  domain: skillDomainEnum("domain").notNull(),
  name: jsonb("name").notNull().$type<Record<string, string>>(),
  description: jsonb("description").$type<Record<string, string>>(),
  cefrLevel: cefrEnum("cefr_level").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
