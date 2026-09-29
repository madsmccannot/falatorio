import { z } from "zod";
import { eq, and, lte, count } from "drizzle-orm";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  userProgress,
  exercises,
  lessons,
  units,
  sections,
} from "@falatorio/db/schema";

export const progressRouter = t.router({
  getDueReviews: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const rows = await ctx.db
        .select({
          exerciseId: userProgress.exerciseId,
          stability: userProgress.stability,
          difficulty: userProgress.difficulty,
          nextReview: userProgress.nextReview,
          reps: userProgress.reps,
          lapses: userProgress.lapses,
          lastScore: userProgress.lastScore,
          exerciseType: exercises.type,
          prompt: exercises.prompt,
        })
        .from(userProgress)
        .innerJoin(exercises, eq(userProgress.exerciseId, exercises.id))
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            lte(userProgress.nextReview, now),
          ),
        )
        .orderBy(userProgress.nextReview)
        .limit(input.limit);

      return rows;
    }),

  getOverview: protectedProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const courseSections = await ctx.db
        .select({
          sectionId: sections.id,
          sectionTitle: sections.title,
          sectionType: sections.sectionType,
          cefrMin: sections.cefrMin,
          cefrMax: sections.cefrMax,
          sortOrder: sections.sortOrder,
        })
        .from(sections)
        .where(eq(sections.courseId, input.courseId))
        .orderBy(sections.sortOrder);

      const result = [];
      for (const section of courseSections) {
        const sectionUnits = await ctx.db
          .select({
            unitId: units.id,
            unitTitle: units.title,
            unitTheme: units.theme,
            sortOrder: units.sortOrder,
          })
          .from(units)
          .where(eq(units.sectionId, section.sectionId))
          .orderBy(units.sortOrder);

        const unitResults = [];
        for (const unit of sectionUnits) {
          const unitLessons = await ctx.db
            .select({
              lessonId: lessons.id,
              sortOrder: lessons.sortOrder,
              grammarFocus: lessons.grammarFocus,
            })
            .from(lessons)
            .where(eq(lessons.unitId, unit.unitId))
            .orderBy(lessons.sortOrder);

          const lessonProgress = [];
          for (const lesson of unitLessons) {
            const [totalRow] = await ctx.db
              .select({ c: count() })
              .from(exercises)
              .where(
                and(
                  eq(exercises.lessonId, lesson.lessonId),
                  eq(exercises.status, "live"),
                ),
              );

            const [doneRow] = await ctx.db
              .select({ c: count() })
              .from(userProgress)
              .innerJoin(exercises, eq(userProgress.exerciseId, exercises.id))
              .where(
                and(
                  eq(exercises.lessonId, lesson.lessonId),
                  eq(userProgress.userId, ctx.user.userId),
                ),
              );

            lessonProgress.push({
              lessonId: lesson.lessonId,
              sortOrder: lesson.sortOrder,
              grammarFocus: lesson.grammarFocus,
              totalExercises: totalRow?.c ?? 0,
              completedExercises: doneRow?.c ?? 0,
            });
          }

          unitResults.push({
            unitId: unit.unitId,
            title: unit.unitTitle,
            theme: unit.unitTheme,
            sortOrder: unit.sortOrder,
            lessons: lessonProgress,
          });
        }

        result.push({
          sectionId: section.sectionId,
          title: section.sectionTitle,
          sectionType: section.sectionType,
          cefrMin: section.cefrMin,
          cefrMax: section.cefrMax,
          sortOrder: section.sortOrder,
          units: unitResults,
        });
      }

      return result;
    }),

  getExerciseHistory: protectedProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [progress] = await ctx.db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            eq(userProgress.exerciseId, input.exerciseId),
          ),
        )
        .limit(1);

      if (!progress) return null;

      return {
        stability: progress.stability,
        difficulty: progress.difficulty,
        nextReview: progress.nextReview,
        reps: progress.reps,
        lapses: progress.lapses,
        lastScore: progress.lastScore,
        lastReviewedAt: progress.lastReviewedAt,
      };
    }),
});
