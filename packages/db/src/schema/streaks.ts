import {
  pgTable,
  uuid,
  integer,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const streaks = pgTable("streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentDays: integer("current_days").notNull().default(0),
  longestDays: integer("longest_days").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  freezeAvailable: boolean("freeze_available").notNull().default(false),
  freezeUsedToday: boolean("freeze_used_today").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
