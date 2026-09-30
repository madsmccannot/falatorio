CREATE TABLE IF NOT EXISTS "lesson_completions" (
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"best_accuracy" real NOT NULL DEFAULT 0,
	"attempts" integer NOT NULL DEFAULT 1,
	"first_completed_at" timestamp with time zone NOT NULL DEFAULT now(),
	"last_completed_at" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "lesson_completions_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);

DO $$ BEGIN
 ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
