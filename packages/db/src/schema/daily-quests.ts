import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const questTypeEnum = pgEnum("quest_type", [
  "complete_lesson",
  "earn_xp",
  "practice_speaking",
  "review_items",
  "maintain_streak",
  "learn_minutes",
  "perfect_lesson",
  "practice_mistakes",
]);

export const dailyQuests = pgTable("daily_quests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  questType: questTypeEnum("quest_type").notNull(),
  targetValue: integer("target_value").notNull(),
  currentValue: integer("current_value").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  description: varchar("description", { length: 500 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const monthlyQuestProgress = pgTable(
  "monthly_quest_progress",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    yearMonth: varchar("year_month", { length: 7 }).notNull(),
    points: integer("points").notNull().default(0),
    rewardClaimed: boolean("reward_claimed").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.yearMonth] }),
  }),
);
