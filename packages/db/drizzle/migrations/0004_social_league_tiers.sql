-- Add avatar_url to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" varchar(2048);

-- Recreate league_tier enum with 7 tiers (was 5)
-- Since there's no production data yet, drop and recreate
ALTER TYPE "league_tier" RENAME TO "league_tier_old";
CREATE TYPE "league_tier" AS ENUM ('bronze', 'silver', 'gold', 'sapphire', 'ruby', 'emerald', 'diamond');
ALTER TABLE "league_entries" ALTER COLUMN "league_tier" TYPE "league_tier" USING (
  CASE "league_tier"::text
    WHEN 'obsidian' THEN 'diamond'::league_tier
    ELSE "league_tier"::text::league_tier
  END
);
DROP TYPE "league_tier_old";

-- User follows table
CREATE TABLE IF NOT EXISTS "user_follows" (
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "user_follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);

DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Prevent self-follow
ALTER TABLE "user_follows" ADD CONSTRAINT "no_self_follow" CHECK ("follower_id" != "following_id");
