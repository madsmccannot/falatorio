import {
  pgTable,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { skills } from "./skills";

export const skillPrerequisites = pgTable("skill_prerequisites", {
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  prerequisiteId: uuid("prerequisite_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.skillId, table.prerequisiteId] }),
}));
