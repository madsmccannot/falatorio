import {
  pgTable,
  pgEnum,
  uuid,
  integer,
  jsonb,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { courses } from "./courses.js";
import { cefrEnum } from "./users.js";

export const sectionTypeEnum = pgEnum("section_type", [
  "numbered",
  "daily_refresh",
]);

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  title: jsonb("title").notNull().$type<Record<string, string>>(),
  description: jsonb("description").$type<Record<string, string>>(),
  sectionType: sectionTypeEnum("section_type").notNull().default("numbered"),
  cefrMin: cefrEnum("cefr_min").notNull().default("A1"),
  cefrMax: cefrEnum("cefr_max").notNull().default("A2"),
  lessonsPerUnitStart: integer("lessons_per_unit_start").notNull().default(5),
  lessonsPerUnitEnd: integer("lessons_per_unit_end").notNull().default(5),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
