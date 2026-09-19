import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const leagueTierEnum = pgEnum("league_tier", [
  "bronze", "silver", "gold", "diamond", "obsidian",
]);

export const leagueEntries = pgTable("league_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  leagueTier: leagueTierEnum("league_tier").notNull().default("bronze"),
  weeklyXp: integer("weekly_xp").notNull().default(0),
  seasonWeek: varchar("season_week", { length: 16 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
