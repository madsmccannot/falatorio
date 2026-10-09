import { z } from "zod";
import { and, eq, inArray, sql } from "drizzle-orm";
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
  lessonCompletions,
} from "@falatorio/db/schema";
import {
  L1_CODES,
  type L1Code,
} from "@falatorio/core";
import { seedCourseStructure, seedAllPhase1Courses } from "../services/seed-content.service.js";
import { GUIDE_PHRASES } from "../data/unit-guide-phrases.js";
import { UNIT_DESCRIPTIONS } from "../data/unit-descriptions.js";

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

      const sectionIds = rows.map((s) => s.id);
      const unitCounts = sectionIds.length > 0
        ? await ctx.db
            .select({
              sectionId: units.sectionId,
              count: sql<number>`count(*)::int`.as("count"),
            })
            .from(units)
            .where(inArray(units.sectionId, sectionIds))
            .groupBy(units.sectionId)
        : [];

      const countMap = new Map(unitCounts.map((u) => [u.sectionId, u.count]));

      const lessonCounts = sectionIds.length > 0
        ? await ctx.db
            .select({
              sectionId: units.sectionId,
              totalLessons: sql<number>`count(${lessons.id})::int`.as("total_lessons"),
            })
            .from(units)
            .innerJoin(lessons, eq(lessons.unitId, units.id))
            .where(inArray(units.sectionId, sectionIds))
            .groupBy(units.sectionId)
        : [];
      const lessonCountMap = new Map(lessonCounts.map((r) => [r.sectionId, r.totalLessons]));

      const completionCounts = sectionIds.length > 0
        ? await ctx.db
            .select({
              sectionId: units.sectionId,
              completedLessons: sql<number>`count(${lessonCompletions.lessonId})::int`.as("completed_lessons"),
            })
            .from(units)
            .innerJoin(lessons, eq(lessons.unitId, units.id))
            .innerJoin(lessonCompletions, and(eq(lessonCompletions.lessonId, lessons.id), eq(lessonCompletions.userId, ctx.user.userId)))
            .where(inArray(units.sectionId, sectionIds))
            .groupBy(units.sectionId)
        : [];
      const completionMap = new Map(completionCounts.map((r) => [r.sectionId, r.completedLessons]));

      let runningUnit = 1;
      return rows.map((s) => {
        const unitCount = countMap.get(s.id) ?? 0;
        const unitStart = runningUnit;
        const unitEnd = runningUnit + unitCount - 1;
        runningUnit += unitCount;

        const totalLessons = lessonCountMap.get(s.id) ?? 0;
        const completedLessons = completionMap.get(s.id) ?? 0;

        return {
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
          unitCount,
          unitStart,
          unitEnd,
          totalLessons,
          completedLessons,
        };
      });
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
        description: { ...(UNIT_DESCRIPTIONS[u.theme] ?? {}), ...(u.description as Record<string, string> ?? {}) },
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
            .where(inArray(lessons.unitId, unitIds))
            .orderBy(lessons.unitId, lessons.sortOrder)
        : [];

      const allLessonIds = lessonRows.map((l) => l.id);
      const completedRows = allLessonIds.length > 0
        ? await ctx.db
            .select({ lessonId: lessonCompletions.lessonId, attempts: lessonCompletions.attempts })
            .from(lessonCompletions)
            .where(
              and(eq(lessonCompletions.userId, ctx.user.userId), inArray(lessonCompletions.lessonId, allLessonIds)),
            )
        : [];
      const completedSet = new Set(completedRows.map((c) => c.lessonId));
      const attemptsMap = new Map(completedRows.map((c) => [c.lessonId, c.attempts]));

      const lessonsByUnit = new Map<string, typeof lessonRows>();
      for (const l of lessonRows) {
        const arr = lessonsByUnit.get(l.unitId) ?? [];
        arr.push(l);
        lessonsByUnit.set(l.unitId, arr);
      }

      return unitRows.map((u, idx) => {
        const unitLessons = lessonsByUnit.get(u.id) ?? [];
        return {
          id: u.id,
          title: u.title,
          theme: u.theme,
          description: { ...(UNIT_DESCRIPTIONS[u.theme] ?? {}), ...(u.description as Record<string, string> ?? {}) },
          sortOrder: u.sortOrder,
          colorIndex: idx,
          guidePhrases: (u.guidePhrases?.length ? u.guidePhrases : GUIDE_PHRASES[u.theme] ?? []) as Array<Record<string, string>>,
          lessons: unitLessons.map((l) => ({
            id: l.id,
            sortOrder: l.sortOrder,
            nodeType: l.nodeType,
            rewardConfig: l.rewardConfig,
            completed: completedSet.has(l.id),
            completedSessions: attemptsMap.get(l.id) ?? 0,
          })),
        };
      });
    }),

  getSectionProgress: protectedProcedure
    .input(z.object({ sectionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const unitRows = await ctx.db
        .select({ id: units.id })
        .from(units)
        .where(eq(units.sectionId, input.sectionId));

      const unitIds = unitRows.map((u) => u.id);
      if (unitIds.length === 0) return { completedLessonIds: new Array<string>(), totalLessons: 0 };

      const allLessons = await ctx.db
        .select({ id: lessons.id })
        .from(lessons)
        .where(inArray(lessons.unitId, unitIds));

      const lessonIds = allLessons.map((l) => l.id);
      if (lessonIds.length === 0) return { completedLessonIds: [], totalLessons: 0 };

      const completed = await ctx.db
        .select({ lessonId: lessonCompletions.lessonId })
        .from(lessonCompletions)
        .where(
          and(eq(lessonCompletions.userId, ctx.user.userId), inArray(lessonCompletions.lessonId, lessonIds)),
        );

      return {
        completedLessonIds: completed.map((c) => c.lessonId),
        totalLessons: lessonIds.length,
      };
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

  skipSection: protectedProcedure
    .input(z.object({ sectionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const unitRows = await ctx.db
        .select({ id: units.id })
        .from(units)
        .where(eq(units.sectionId, input.sectionId));

      const unitIds = unitRows.map((u) => u.id);
      if (unitIds.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Section has no units" });
      }

      const allLessons = await ctx.db
        .select({ id: lessons.id })
        .from(lessons)
        .where(inArray(lessons.unitId, unitIds));

      if (allLessons.length === 0) return { skipped: 0 };

      const now = new Date();
      const values = allLessons.map((l) => ({
        userId: ctx.user.userId,
        lessonId: l.id,
        bestAccuracy: 1.0,
        attempts: 1,
        firstCompletedAt: now,
        lastCompletedAt: now,
      }));

      await ctx.db
        .insert(lessonCompletions)
        .values(values)
        .onConflictDoNothing();

      return { skipped: allLessons.length };
    }),
});
