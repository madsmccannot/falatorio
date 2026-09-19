CREATE TYPE "public"."ad_reward_type" AS ENUM('heart', 'crystal');--> statement-breakpoint
CREATE TYPE "public"."ad_type" AS ENUM('banner', 'interstitial', 'reward');--> statement-breakpoint
CREATE TYPE "public"."audio_region" AS ENUM('lisboa', 'porto', 'algarve', 'acores', 'madeira');--> statement-breakpoint
CREATE TYPE "public"."cefr_level" AS ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2');--> statement-breakpoint
CREATE TYPE "public"."cultural_content_type" AS ENUM('joke', 'expression', 'meme', 'reference');--> statement-breakpoint
CREATE TYPE "public"."exercise_status" AS ENUM('draft', 'review', 'live');--> statement-breakpoint
CREATE TYPE "public"."exercise_type" AS ENUM('translate_l1_to_pt', 'translate_pt_to_l1', 'listen_and_type', 'speak_and_score', 'fill_blank', 'match_pairs', 'pick_correct', 'reorder_words');--> statement-breakpoint
CREATE TYPE "public"."user_goal" AS ENUM('tourism', 'residency', 'work', 'citizenship', 'family', 'academic');--> statement-breakpoint
CREATE TYPE "public"."iap_platform" AS ENUM('apple', 'google');--> statement-breakpoint
CREATE TYPE "public"."l1_code" AS ENUM('en', 'es', 'fr', 'hi', 'ur', 'ar', 'bn', 'de', 'zh', 'ru', 'uk', 'tr', 'pl', 'ko', 'ja');--> statement-breakpoint
CREATE TYPE "public"."league_tier" AS ENUM('bronze', 'silver', 'gold', 'diamond', 'obsidian');--> statement-breakpoint
CREATE TYPE "public"."shop_item_type" AS ENUM('consumable', 'subscription');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('free', 'super');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('earn', 'spend', 'iap', 'refund');--> statement-breakpoint
CREATE TABLE "achievements" (
	"user_id" uuid NOT NULL,
	"badge_id" varchar(64) NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_user_id_badge_id_pk" PRIMARY KEY("user_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "ad_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ad_type" "ad_type" NOT NULL,
	"reward_type" "ad_reward_type",
	"reward_amount" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audio_clips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"region" "audio_region" NOT NULL,
	"speaker" varchar(255) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"duration_ms" varchar(16),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scenario_id" varchar(64) NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"errors_extracted" jsonb,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"l1_source" "l1_code" NOT NULL,
	"target" varchar(10) DEFAULT 'pt-PT' NOT NULL,
	"title" jsonb NOT NULL,
	"description" jsonb,
	"cefr_min" "cefr_level" DEFAULT 'A1' NOT NULL,
	"cefr_max" "cefr_level" DEFAULT 'B2' NOT NULL,
	"sort_order" varchar(10) DEFAULT '0' NOT NULL,
	"active" varchar(5) DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"type" "exercise_type" NOT NULL,
	"prompt" jsonb NOT NULL,
	"accepted_answers" text[] NOT NULL,
	"audio_url" varchar(2048),
	"audio_native_url" varchar(2048),
	"difficulty" integer DEFAULT 1 NOT NULL,
	"l1_tip" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "exercise_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iap_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "iap_platform" NOT NULL,
	"receipt_data" text NOT NULL,
	"product_id" varchar(128) NOT NULL,
	"transaction_id" varchar(255),
	"validated" boolean DEFAULT false NOT NULL,
	"validated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "l1_cultural_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"l1_code" "l1_code" NOT NULL,
	"type" "cultural_content_type" NOT NULL,
	"content_pt" text NOT NULL,
	"content_l1" text NOT NULL,
	"explanation" text NOT NULL,
	"cefr_min" "cefr_level" DEFAULT 'A1' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"league_tier" "league_tier" DEFAULT 'bronze' NOT NULL,
	"weekly_xp" integer DEFAULT 0 NOT NULL,
	"season_week" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"grammar_focus" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"vocab_target" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"unlock_threshold" real DEFAULT 0.8 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_items" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"type" "shop_item_type" NOT NULL,
	"price_crystals" integer,
	"price_eur" real,
	"effect" jsonb NOT NULL,
	"icon" varchar(16),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_days" integer DEFAULT 0 NOT NULL,
	"longest_days" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"freeze_available" boolean DEFAULT false NOT NULL,
	"freeze_used_today" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "streaks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"item_id" varchar(128),
	"reason" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"title" jsonb NOT NULL,
	"theme" varchar(255) NOT NULL,
	"description" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"stability" real DEFAULT 0 NOT NULL,
	"difficulty" real DEFAULT 0 NOT NULL,
	"next_review" timestamp with time zone DEFAULT now() NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"last_score" real DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_user_id_exercise_id_pk" PRIMARY KEY("user_id","exercise_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255) NOT NULL,
	"l1" "l1_code" NOT NULL,
	"cefr_level" "cefr_level" DEFAULT 'A1' NOT NULL,
	"goal" "user_goal",
	"timezone" varchar(64) DEFAULT 'Europe/Lisbon' NOT NULL,
	"daily_goal_min" integer DEFAULT 10 NOT NULL,
	"tier" "tier" DEFAULT 'free' NOT NULL,
	"tier_expires_at" timestamp with time zone,
	"hearts" integer DEFAULT 5,
	"hearts_refill_at" timestamp with time zone,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"ad_consent" boolean DEFAULT false NOT NULL,
	"last_ad_shown_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_events" ADD CONSTRAINT "ad_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_clips" ADD CONSTRAINT "audio_clips_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iap_receipts" ADD CONSTRAINT "iap_receipts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_entries" ADD CONSTRAINT "league_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_events_user_id_idx" ON "ad_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ad_events_user_created_idx" ON "ad_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "iap_receipts_user_id_idx" ON "iap_receipts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "l1_cultural_content_l1_idx" ON "l1_cultural_content" USING btree ("l1_code");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_created_idx" ON "transactions" USING btree ("user_id","created_at");