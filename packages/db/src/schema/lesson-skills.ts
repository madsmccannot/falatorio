import {
  pgTable,
  uuid,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { lessons } from "./lessons";
import { skills } from "./skills";

export const lessonSkills = pgTable("lesson_skills", {
  lessonId: uuid("lesson_id").notNull().references(() => lessons.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").notNull().default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.lessonId, table.skillId] }),
}));
