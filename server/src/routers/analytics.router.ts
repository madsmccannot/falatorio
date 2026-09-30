import { z } from "zod";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  computeCohortRetention,
  computeMasteryMetrics,
  computeEngagementMetrics,
  getRetentionSummary,
} from "../services/retention-metrics.service.js";

export const analyticsRouter = t.router({
  retentionSummary: protectedProcedure
    .input(z.object({ daysBack: z.number().min(7).max(90).default(30) }).optional())
    .query(async ({ ctx, input }) => {
      return getRetentionSummary(ctx.db, input?.daysBack ?? 30);
    }),

  cohortRetention: protectedProcedure
    .input(z.object({ daysBack: z.number().min(7).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      return computeCohortRetention(ctx.db, input.daysBack);
    }),

  masteryMetrics: protectedProcedure.query(async ({ ctx }) => {
    return computeMasteryMetrics(ctx.db);
  }),

  engagement: protectedProcedure.query(async ({ ctx }) => {
    return computeEngagementMetrics(ctx.db);
  }),
});
