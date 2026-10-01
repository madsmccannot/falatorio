import { z } from "zod";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import type { L1Code } from "@falatorio/core";
import {
  getOrCreateDailyQuests,
  updateQuestProgress,
  getMonthlyProgress,
  claimMonthlyReward,
} from "../services/daily-quests.service.js";

export const questsRouter = t.router({
  getDailyQuests: protectedProcedure.query(async ({ ctx }) => {
    const quests = await getOrCreateDailyQuests(
      ctx.db,
      ctx.user.userId,
      ctx.user.l1 as L1Code,
    );
    return quests.map((q) => ({
      id: q.id,
      questType: q.questType,
      targetValue: q.targetValue,
      currentValue: q.currentValue,
      completed: q.completed,
      description: q.description,
    }));
  }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        questType: z.enum([
          "complete_lesson",
          "earn_xp",
          "practice_speaking",
          "review_items",
          "maintain_streak",
          "learn_minutes",
          "perfect_lesson",
          "practice_mistakes",
        ]),
        increment: z.number().int().positive().default(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await updateQuestProgress(
        ctx.db,
        ctx.user.userId,
        input.questType,
        input.increment,
      );
      return updated
        ? {
            id: updated.id,
            currentValue: updated.currentValue,
            completed: updated.completed,
          }
        : null;
    }),

  getMonthlyProgress: protectedProcedure.query(async ({ ctx }) => {
    return getMonthlyProgress(ctx.db, ctx.user.userId);
  }),

  claimReward: protectedProcedure.mutation(async ({ ctx }) => {
    return claimMonthlyReward(ctx.db, ctx.user.userId);
  }),
});
