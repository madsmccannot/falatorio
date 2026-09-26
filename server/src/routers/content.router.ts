import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  courses,
  units,
  lessons,
  exercises,
  audioClips,
  l1CulturalContent,
} from "@falatorio/db/schema";
import {
  CEFR_LEVELS, L1_CODES, EXERCISE_TYPES, COGNITIVE_LEVELS,
  type L1Code, type CEFRLevel, type ExerciseType, type CognitiveLevel,
} from "@falatorio/core";
import { generateLesson, generateSingleExercise, generateFromKnowledgeItem } from "../services/content-generator.service.js";
import { seedCourseStructure, seedAllPhase1Courses } from "../services/seed-content.service.js";
import { skills, knowledgeItems, exerciseKnowledge } from "@falatorio/db/schema";

export const contentRouter = t.router({
  getCourses: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(courses)
      .where(eq(courses.l1Source, ctx.user.l1 as L1Code))
      .orderBy(courses.sortOrder);

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      cefrMin: c.cefrMin,
      cefrMax: c.cefrMax,
    }));
  }),

  getUnits: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(units)
        .where(eq(units.courseId, input.courseId))
        .orderBy(units.sortOrder);

      return rows.map((u) => ({
        id: u.id,
        title: u.title,
        theme: u.theme,
        description: u.description,
        sortOrder: u.sortOrder,
      }));
    }),

  getLessons: protectedProcedure
    .input(z.object({ unitId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(lessons)
        .where(eq(lessons.unitId, input.unitId))
        .orderBy(lessons.sortOrder);

      return rows.map((l) => ({
        id: l.id,
        sortOrder: l.sortOrder,
        grammarFocus: l.grammarFocus,
        vocabTarget: l.vocabTarget,
      }));
    }),

  getExercise: protectedProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [exercise] = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) throw new TRPCError({ code: "NOT_FOUND" });

      const l1Tip = exercise.l1Tip
        ? (exercise.l1Tip as Record<string, string>)[ctx.user.l1] ?? null
        : null;

      return {
        id: exercise.id,
        type: exercise.type,
        prompt: exercise.prompt,
        audioUrl: exercise.audioUrl,
        audioNativeUrl: exercise.audioNativeUrl,
        difficulty: exercise.difficulty,
        l1Tip,
      };
    }),

  getCulturalContent: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(l1CulturalContent)
        .where(eq(l1CulturalContent.l1Code, ctx.user.l1 as L1Code))
        .orderBy(sql`RANDOM()`)
        .limit(input.limit);

      return rows.map((c) => ({
        id: c.id,
        type: c.type,
        contentPt: c.contentPt,
        contentL1: c.contentL1,
        explanation: c.explanation,
        cefrMin: c.cefrMin,
        tags: c.tags,
      }));
    }),

  getAudioClip: protectedProcedure
    .input(z.object({ clipId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [clip] = await ctx.db
        .select()
        .from(audioClips)
        .where(eq(audioClips.id, input.clipId))
        .limit(1);

      if (!clip) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        id: clip.id,
        region: clip.region,
        speaker: clip.speaker,
        url: clip.url,
      };
    }),

  generateLessonOnDemand: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        cefrLevel: z.enum(CEFR_LEVELS),
        grammarFocus: z.array(z.string()).optional(),
        vocabTopics: z.array(z.string()).optional(),
        weaknesses: z.array(z.string()).optional(),
        exerciseCount: z.number().int().min(5).max(25).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [lesson] = await ctx.db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.lessonId))
        .limit(1);

      if (!lesson) throw new TRPCError({ code: "NOT_FOUND" });

      const result = await generateLesson({
        l1: ctx.user.l1 as L1Code,
        cefrLevel: input.cefrLevel as CEFRLevel,
        grammarFocus: input.grammarFocus ?? lesson.grammarFocus,
        vocabTopics: input.vocabTopics ?? lesson.vocabTarget,
        weaknesses: input.weaknesses ?? [],
        exerciseCount: input.exerciseCount ?? 15,
      });

      for (const ex of result.exercises) {
        await ctx.db.insert(exercises).values({
          lessonId: input.lessonId,
          type: ex.type as ExerciseType,
          status: "live",
          prompt: ex.prompt,
          acceptedAnswers: ex.acceptedAnswers,
          difficulty: ex.difficulty,
          l1Tip: ex.l1Tip,
        });
      }

      return {
        exercisesGenerated: result.exercises.length,
        grammarFocus: result.grammarFocus,
        vocabTopics: result.vocabTopics,
      };
    }),

  generateExercise: protectedProcedure
    .input(
      z.object({
        type: z.enum(EXERCISE_TYPES),
        cefrLevel: z.enum(CEFR_LEVELS),
        topic: z.string().min(1).max(100),
        weakness: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exercise = await generateSingleExercise({
        l1: ctx.user.l1 as L1Code,
        cefrLevel: input.cefrLevel as CEFRLevel,
        type: input.type as ExerciseType,
        topic: input.topic,
        weakness: input.weakness,
      });

      return exercise;
    }),

  generateFromKnowledge: protectedProcedure
    .input(
      z.object({
        knowledgeItemCode: z.string().min(1),
        exerciseType: z.enum(EXERCISE_TYPES),
        cognitiveLevel: z.enum(COGNITIVE_LEVELS),
        difficulty: z.number().int().min(1).max(10).default(5),
        avoidVocabulary: z.array(z.string()).optional(),
        requireContext: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [ki] = await ctx.db
        .select()
        .from(knowledgeItems)
        .where(eq(knowledgeItems.code, input.knowledgeItemCode))
        .limit(1);

      if (!ki) throw new TRPCError({ code: "NOT_FOUND", message: `KnowledgeItem ${input.knowledgeItemCode} not found` });

      const [skill] = await ctx.db
        .select()
        .from(skills)
        .where(eq(skills.id, ki.skillId))
        .limit(1);

      if (!skill) throw new TRPCError({ code: "NOT_FOUND", message: "Parent skill not found" });

      const l1Notes = ki.l1Notes as Record<string, any> | null;
      const l1Note = l1Notes?.[ctx.user.l1];
      const l1NoteStr = typeof l1Note === "string"
        ? l1Note
        : typeof l1Note === "object" && l1Note?.reason
          ? l1Note.reason
          : undefined;

      const exercise = await generateFromKnowledgeItem({
        request: {
          knowledgeItemCode: ki.code,
          skillCode: skill.code,
          cefrLevel: ki.cefrLevel as CEFRLevel,
          l1: ctx.user.l1 as L1Code,
          exerciseType: input.exerciseType as ExerciseType,
          cognitiveLevel: input.cognitiveLevel as CognitiveLevel,
          difficulty: input.difficulty,
          constraints: {
            avoidVocabulary: input.avoidVocabulary,
            requireContext: input.requireContext,
          },
        },
        rule: ki.rule,
        examples: (ki.examples ?? []) as string[],
        commonErrors: (ki.commonErrors ?? []) as string[],
        l1Notes: l1NoteStr,
      });

      const [inserted] = await ctx.db
        .insert(exercises)
        .values({
          lessonId: null as any,
          type: exercise.type as ExerciseType,
          status: "live",
          prompt: exercise.prompt,
          acceptedAnswers: exercise.acceptedAnswers,
          difficulty: exercise.difficulty,
          l1Tip: exercise.l1Tip,
        })
        .returning({ id: exercises.id });

      if (inserted) {
        await ctx.db.insert(exerciseKnowledge).values({
          exerciseId: inserted.id,
          knowledgeItemId: ki.id,
          isPrimary: true,
        });
      }

      return {
        exercise,
        exerciseId: inserted?.id ?? null,
        knowledgeItemCode: ki.code,
        skillCode: skill.code,
      };
    }),

  seedContent: protectedProcedure
    .input(
      z.object({
        l1: z.enum(L1_CODES).optional(),
        seedAll: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.seedAll) {
        const results = await seedAllPhase1Courses(ctx.db);
        return { seeded: results };
      }

      const l1 = (input.l1 ?? ctx.user.l1) as L1Code;
      const result = await seedCourseStructure(l1, ctx.db);
      return { seeded: { [l1]: result } };
    }),
});
