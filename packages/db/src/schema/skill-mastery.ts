import {
  pgTable,
  uuid,
  real,
  integer,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { skills } from "./skills";

export const skillMastery = pgTable("skill_mastery", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  mastery: real("mastery").notNull().default(0),
  confidence: real("confidence").notNull().default(0),
  totalEvidence: integer("total_evidence").notNull().default(0),
  varietyScore: real("variety_score").notNull().default(0),
  productionScore: real("production_score").notNull().default(0),
  lastEvidenceAt: timestamp("last_evidence_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.skillId] }),
}));
