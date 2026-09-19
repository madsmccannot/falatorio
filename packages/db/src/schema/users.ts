import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["free", "super"]);

export const cefrEnum = pgEnum("cefr_level", [
  "A1", "A2", "B1", "B2", "C1", "C2",
]);

export const l1CodeEnum = pgEnum("l1_code", [
  "en", "es", "fr", "hi", "ur", "ar", "bn",
  "de", "zh", "ru", "uk", "tr", "pl", "ko", "ja",
]);

export const goalEnum = pgEnum("user_goal", [
  "tourism", "residency", "work", "citizenship", "family", "academic",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  l1: l1CodeEnum("l1").notNull(),
  cefrLevel: cefrEnum("cefr_level").notNull().default("A1"),
  goal: goalEnum("goal"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Europe/Lisbon"),
  dailyGoalMin: integer("daily_goal_min").notNull().default(10),
  tier: tierEnum("tier").notNull().default("free"),
  tierExpiresAt: timestamp("tier_expires_at", { withTimezone: true }),
  hearts: integer("hearts").default(5),
  heartsRefillAt: timestamp("hearts_refill_at", { withTimezone: true }),
  streakDays: integer("streak_days").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  adConsent: boolean("ad_consent").notNull().default(false),
  lastAdShownAt: timestamp("last_ad_shown_at", { withTimezone: true }),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
