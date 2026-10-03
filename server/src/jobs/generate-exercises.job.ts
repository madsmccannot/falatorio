import type { Job } from "bullmq";
import type { Database } from "@falatorio/db/client";
import { eq, inArray } from "drizzle-orm";
import { lessons, exercises, lessonSkills, knowledgeItems, exerciseKnowledge } from "@falatorio/db/schema";
import type { CEFRLevel, ExerciseType, L1Code } from "@falatorio/core";
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

  const lessonSkillRows = await db
    .select({ skillId: lessonSkills.skillId })
    .from(lessonSkills)
    .where(eq(lessonSkills.lessonId, lessonId));

  const skillIds = lessonSkillRows.map((r) => r.skillId);

  const lessonKIs = skillIds.length > 0
    ? await db
        .select({ id: knowledgeItems.id, skillId: knowledgeItems.skillId })
        .from(knowledgeItems)
        .where(inArray(knowledgeItems.skillId, skillIds))
    : [];

  for (const ex of result.exercises) {
    const [inserted] = await db
      .insert(exercises)
      .values({
        lessonId,
        type: ex.type as ExerciseType,
        status: "review",
        prompt: ex.prompt,
        acceptedAnswers: ex.acceptedAnswers,
        difficulty: ex.difficulty,
        l1Tip: ex.l1Tip,
      })
      .returning({ id: exercises.id });

    if (inserted && lessonKIs.length > 0) {
      const primaryKI = lessonKIs[0]!;
      await db
        .insert(exerciseKnowledge)
        .values({ exerciseId: inserted.id, knowledgeItemId: primaryKI.id, isPrimary: true })
        .onConflictDoNothing();

      for (const ki of lessonKIs.slice(1)) {
        await db
          .insert(exerciseKnowledge)
          .values({ exerciseId: inserted.id, knowledgeItemId: ki.id, isPrimary: false })
          .onConflictDoNothing();
      }
    }
  }

  await job.updateProgress(100);
}
