import { z } from "zod";
import { eq } from "drizzle-orm";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users } from "@falatorio/db/schema";
import { USER_GOALS, CEFR_LEVELS } from "@falatorio/core";

export const userRouter = t.router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) throw new Error("User not found");

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      l1: user.l1,
      cefrLevel: user.cefrLevel,
      goal: user.goal,
      timezone: user.timezone,
      dailyGoalMin: user.dailyGoalMin,
      tier: user.tier,
      tierExpiresAt: user.tierExpiresAt,
      hearts: user.hearts,
      heartsRefillAt: user.heartsRefillAt,
      streakDays: user.streakDays,
      longestStreak: user.longestStreak,
      totalXp: user.totalXp,
      adConsent: user.adConsent,
      createdAt: user.createdAt,
    };
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        timezone: z.string().max(64).optional(),
        dailyGoalMin: z.number().int().min(5).max(60).optional(),
        goal: z.enum(USER_GOALS).optional(),
        adConsent: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updates["name"] = input.name;
      if (input.timezone !== undefined) updates["timezone"] = input.timezone;
      if (input.dailyGoalMin !== undefined) updates["dailyGoalMin"] = input.dailyGoalMin;
      if (input.goal !== undefined) updates["goal"] = input.goal;
      if (input.adConsent !== undefined) updates["adConsent"] = input.adConsent;

      await ctx.db
        .update(users)
        .set(updates)
        .where(eq(users.id, ctx.user.userId));

      return { updated: true };
    }),

  updateCEFR: protectedProcedure
    .input(z.object({ level: z.enum(CEFR_LEVELS) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ cefrLevel: input.level, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));

      return { level: input.level };
    }),
});
