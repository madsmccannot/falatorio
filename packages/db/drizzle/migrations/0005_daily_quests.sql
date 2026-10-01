-- Daily quests system: personalized daily tasks, monthly point tracking

DO $$ BEGIN
  CREATE TYPE "quest_type" AS ENUM (
    'complete_lesson',
    'earn_xp',
    'practice_speaking',
    'review_items',
    'maintain_streak',
    'learn_minutes',
    'perfect_lesson',
    'practice_mistakes'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "daily_quests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "quest_type" "quest_type" NOT NULL,
  "target_value" integer NOT NULL,
  "current_value" integer NOT NULL DEFAULT 0,
  "completed" boolean NOT NULL DEFAULT false,
  "description" varchar(500) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_daily_quests_user_date"
  ON "daily_quests" ("user_id", "date");

CREATE TABLE IF NOT EXISTS "monthly_quest_progress" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "year_month" varchar(7) NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "reward_claimed" boolean NOT NULL DEFAULT false,
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("user_id", "year_month")
);
