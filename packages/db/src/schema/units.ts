import {
  pgTable,
  uuid,
  integer,
  jsonb,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { courses } from "./courses.js";

export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  title: jsonb("title").notNull().$type<Record<string, string>>(),
  theme: varchar("theme", { length: 255 }).notNull(),
  description: jsonb("description").$type<Record<string, string>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
