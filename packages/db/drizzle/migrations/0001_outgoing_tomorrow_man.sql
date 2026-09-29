CREATE TYPE "public"."knowledge_relation_type" AS ENUM('related', 'confusable_with', 'reinforces');--> statement-breakpoint
CREATE TYPE "public"."knowledge_status" AS ENUM('draft', 'review', 'approved', 'live');--> statement-breakpoint
CREATE TYPE "public"."skill_domain" AS ENUM('phonetics', 'morphology', 'tenses_moods', 'determiners', 'pronouns', 'prepositions', 'syntax', 'lexicon', 'pragmatics', 'orthography');--> statement-breakpoint
CREATE TABLE "exercise_knowledge" (
	"exercise_id" uuid NOT NULL,
	"knowledge_item_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	CONSTRAINT "exercise_knowledge_exercise_id_knowledge_item_id_pk" PRIMARY KEY("exercise_id","knowledge_item_id")
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"code" varchar(128) NOT NULL,
	"cefr_level" "cefr_level" NOT NULL,
	"rule" text NOT NULL,
	"examples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"counterexamples" jsonb DEFAULT '[]'::jsonb,
	"common_errors" jsonb DEFAULT '[]'::jsonb,
	"l1_notes" jsonb,
	"short_explanation" jsonb,
	"exercise_types" jsonb DEFAULT '[]'::jsonb,
	"mastery_criteria" jsonb,
	"version" integer DEFAULT 1 NOT NULL,
	"status" "knowledge_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_items_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "knowledge_relations" (
	"source_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"relation_type" "knowledge_relation_type" NOT NULL,
	CONSTRAINT "knowledge_relations_source_id_target_id_relation_type_pk" PRIMARY KEY("source_id","target_id","relation_type")
);
--> statement-breakpoint
CREATE TABLE "lesson_skills" (
	"lesson_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "lesson_skills_lesson_id_skill_id_pk" PRIMARY KEY("lesson_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skill_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"knowledge_item_id" uuid NOT NULL,
	"exercise_id" uuid,
	"score" real NOT NULL,
	"exercise_type" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_mastery" (
	"user_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"mastery" real DEFAULT 0 NOT NULL,
	"confidence" real DEFAULT 0 NOT NULL,
	"total_evidence" integer DEFAULT 0 NOT NULL,
	"variety_score" real DEFAULT 0 NOT NULL,
	"production_score" real DEFAULT 0 NOT NULL,
	"last_evidence_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_mastery_user_id_skill_id_pk" PRIMARY KEY("user_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "skill_prerequisites" (
	"skill_id" uuid NOT NULL,
	"prerequisite_id" uuid NOT NULL,
	CONSTRAINT "skill_prerequisites_skill_id_prerequisite_id_pk" PRIMARY KEY("skill_id","prerequisite_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(128) NOT NULL,
	"domain" "skill_domain" NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"cefr_level" "cefr_level" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "shop_items" RENAME COLUMN "price_crystals" TO "price_ouro";--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_lesson_id_lessons_id_fk";
--> statement-breakpoint
ALTER TABLE "ad_events" ALTER COLUMN "reward_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ad_reward_type";--> statement-breakpoint
CREATE TYPE "public"."ad_reward_type" AS ENUM('heart', 'ouro');--> statement-breakpoint
ALTER TABLE "ad_events" ALTER COLUMN "reward_type" SET DATA TYPE "public"."ad_reward_type" USING "reward_type"::"public"."ad_reward_type";--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "exercise_knowledge" ADD CONSTRAINT "exercise_knowledge_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_knowledge" ADD CONSTRAINT "exercise_knowledge_knowledge_item_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_item_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_items" ADD CONSTRAINT "knowledge_items_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relations" ADD CONSTRAINT "knowledge_relations_source_id_knowledge_items_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_relations" ADD CONSTRAINT "knowledge_relations_target_id_knowledge_items_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_skills" ADD CONSTRAINT "lesson_skills_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_skills" ADD CONSTRAINT "lesson_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_knowledge_item_id_knowledge_items_id_fk" FOREIGN KEY ("knowledge_item_id") REFERENCES "public"."knowledge_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_evidence" ADD CONSTRAINT "skill_evidence_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mastery" ADD CONSTRAINT "skill_mastery_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_prerequisite_id_skills_id_fk" FOREIGN KEY ("prerequisite_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "skill_evidence_user_knowledge_idx" ON "skill_evidence" USING btree ("user_id","knowledge_item_id");--> statement-breakpoint
CREATE INDEX "skill_evidence_user_created_idx" ON "skill_evidence" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");