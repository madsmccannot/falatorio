import type { Job } from "bullmq";
import type { Database } from "@fala-pt/db/client";
import { eq } from "drizzle-orm";
import { lessons, exercises } from "@fala-pt/db/schema";
import type { CEFRLevel, ExerciseType, L1Code } from "@fala-pt/core";
import { generateLesson } from "../services/content-generator.service.js";

export interface GenerateExercisesData {
  lessonId: string;
  count: number;
  cefrLevel: string;
  grammarFocus: string[];
  vocabTarget: string[];
  l1Source: string;
  weaknesses?: string[];
}

export async function processGenerateExercises(
  job: Job<GenerateExercisesData>,
  db: Database,
): Promise<void> {
  const { lessonId, count, cefrLevel, grammarFocus, vocabTarget, l1Source, weaknesses } = job.data;

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    throw new Error(`Lesson ${lessonId} not found`);
  }

  const result = await generateLesson({
    l1: l1Source as L1Code,
    cefrLevel: cefrLevel as CEFRLevel,
    grammarFocus,
    vocabTopics: vocabTarget,
    weaknesses: weaknesses ?? [],
    exerciseCount: count,
  });

  for (const ex of result.exercises) {
    await db.insert(exercises).values({
      lessonId,
      type: ex.type as ExerciseType,
      status: "review",
      prompt: ex.prompt,
      acceptedAnswers: ex.acceptedAnswers,
      difficulty: ex.difficulty,
      l1Tip: ex.l1Tip,
    });
  }

  await job.updateProgress(100);
}
