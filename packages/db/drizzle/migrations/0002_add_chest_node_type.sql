CREATE TYPE "public"."node_type" AS ENUM('lesson', 'chest');--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "node_type" "node_type" DEFAULT 'lesson' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "reward_config" jsonb;
