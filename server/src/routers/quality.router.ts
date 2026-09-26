import { z } from "zod";
import { eq } from "drizzle-orm";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { exercises, userProgress } from "@falatorio/db/schema";

export const qualityRouter = t.router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const statusRows = await ctx.db
      .select({ status: exercises.status })
      .from(exercises);

    const statusCounts: Record<string, number> = {};
    for (const r of statusRows) {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    }

    const typeRows = await ctx.db
      .select({ type: exercises.type })
      .from(exercises);

    const typeCounts: Record<string, number> = {};
    for (const r of typeRows) {
      typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1;
    }

    const allProgress = await ctx.db
      .select({
        exerciseId: userProgress.exerciseId,
        lastScore: userProgress.lastScore,
        lapses: userProgress.lapses,
        reps: userProgress.reps,
      })
      .from(userProgress);

    const exerciseStats = new Map<
      string,
      { scores: number[]; lapses: number[]; reps: number[] }
    >();
    let totalScore = 0;
    let totalLapses = 0;
    let totalReps = 0;

    for (const row of allProgress) {
      let entry = exerciseStats.get(row.exerciseId);
      if (!entry) {
        entry = { scores: [], lapses: [], reps: [] };
        exerciseStats.set(row.exerciseId, entry);
      }
      entry.scores.push(row.lastScore);
      entry.lapses.push(row.lapses);
      entry.reps.push(row.reps);
      totalScore += row.lastScore;
      totalLapses += row.lapses;
      totalReps += row.reps;
    }

    const flagged: {
      exerciseId: string;
      responseCount: number;
      avgScore: number;
      avgLapses: number;
    }[] = [];
    const top: {
      exerciseId: string;
      responseCount: number;
      avgScore: number;
    }[] = [];

    for (const [exId, stats] of exerciseStats) {
      if (stats.scores.length < 5) continue;

      const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
      const avgLapses = stats.lapses.reduce((a, b) => a + b, 0) / stats.lapses.length;

      if (avgScore < 0.4) {
        flagged.push({
          exerciseId: exId,
          responseCount: stats.scores.length,
          avgScore: Number(avgScore.toFixed(3)),
          avgLapses: Number(avgLapses.toFixed(1)),
        });
      }

      top.push({
        exerciseId: exId,
        responseCount: stats.scores.length,
        avgScore: Number(avgScore.toFixed(3)),
      });
    }

    flagged.sort((a, b) => a.avgScore - b.avgScore);
    top.sort((a, b) => b.avgScore - a.avgScore);

    const n = allProgress.length;

    return {
      exercisesByStatus: statusCounts,
      exercisesByType: typeCounts,
      flaggedForReview: flagged.slice(0, 20),
      topPerformers: top.slice(0, 10),
      global: {
        totalResponses: n,
        avgScore: n > 0 ? Number((totalScore / n).toFixed(3)) : 0,
        avgLapses: n > 0 ? Number((totalLapses / n).toFixed(1)) : 0,
        avgReps: n > 0 ? Number((totalReps / n).toFixed(1)) : 0,
      },
    };
  }),

  exerciseDetail: protectedProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [exercise] = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) return null;

      const progressRows = await ctx.db
        .select({
          lastScore: userProgress.lastScore,
          reps: userProgress.reps,
          lapses: userProgress.lapses,
        })
        .from(userProgress)
        .where(eq(userProgress.exerciseId, input.exerciseId));

      const n = progressRows.length;
      const totalScore = progressRows.reduce((a, r) => a + r.lastScore, 0);
      const totalReps = progressRows.reduce((a, r) => a + r.reps, 0);
      const totalLapses = progressRows.reduce((a, r) => a + r.lapses, 0);

      return {
        exercise: {
          id: exercise.id,
          type: exercise.type,
          status: exercise.status,
          difficulty: exercise.difficulty,
          version: exercise.version,
        },
        stats: {
          totalUsers: n,
          avgScore: n > 0 ? Number((totalScore / n).toFixed(3)) : 0,
          avgReps: n > 0 ? Number((totalReps / n).toFixed(1)) : 0,
          avgLapses: n > 0 ? Number((totalLapses / n).toFixed(1)) : 0,
        },
      };
    }),
});
