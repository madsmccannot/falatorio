import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  courses,
  sections,
  units,
  lessons,
  exercises,
  audioClips,
  l1CulturalContent,
} from "@falatorio/db/schema";
import {
  L1_CODES,
  type L1Code,
} from "@falatorio/core";
import { seedCourseStructure, seedAllPhase1Courses } from "../services/seed-content.service.js";

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

  getSections: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(sections)
        .where(eq(sections.courseId, input.courseId))
        .orderBy(sections.sortOrder);

      return rows.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        sectionType: s.sectionType,
        cefrMin: s.cefrMin,
        cefrMax: s.cefrMax,
        lessonsPerUnitStart: s.lessonsPerUnitStart,
        lessonsPerUnitEnd: s.lessonsPerUnitEnd,
        sortOrder: s.sortOrder,
        active: s.active,
      }));
    }),

  getUnits: protectedProcedure
    .input(z.object({ sectionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(units)
        .where(eq(units.sectionId, input.sectionId))
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
        nodeType: l.nodeType,
        grammarFocus: l.grammarFocus,
        vocabTarget: l.vocabTarget,
        rewardConfig: l.rewardConfig,
      }));
    }),

  getSectionMap: protectedProcedure
    .input(z.object({ sectionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const unitRows = await ctx.db
        .select()
        .from(units)
        .where(eq(units.sectionId, input.sectionId))
        .orderBy(units.sortOrder);

      const unitIds = unitRows.map((u) => u.id);
      const lessonRows = unitIds.length > 0
        ? await ctx.db
            .select()
            .from(lessons)
            .where(sql`${lessons.unitId} = ANY(${unitIds})`)
            .orderBy(lessons.unitId, lessons.sortOrder)
        : [];

      const lessonsByUnit = new Map<string, typeof lessonRows>();
      for (const l of lessonRows) {
        const arr = lessonsByUnit.get(l.unitId) ?? [];
        arr.push(l);
        lessonsByUnit.set(l.unitId, arr);
      }

      return unitRows.map((u, idx) => ({
        id: u.id,
        title: u.title,
        theme: u.theme,
        description: u.description,
        sortOrder: u.sortOrder,
        colorIndex: idx,
        lessons: (lessonsByUnit.get(u.id) ?? []).map((l) => ({
          id: l.id,
          sortOrder: l.sortOrder,
          nodeType: l.nodeType,
          rewardConfig: l.rewardConfig,
        })),
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
