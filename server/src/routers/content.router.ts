import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
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
} from "@fala-pt/db/schema";
import type { L1Code, CEFRLevel } from "@fala-pt/core";

export const contentRouter = t.router({
  getCourses: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(courses)
      .where(eq(courses.l1Source, ctx.user.l1))
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
        .where(eq(l1CulturalContent.l1Code, ctx.user.l1))
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
});
