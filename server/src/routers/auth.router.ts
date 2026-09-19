import { z } from "zod";
import { eq } from "drizzle-orm";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users } from "@fala-pt/db/schema";
import { L1_CODES, USER_GOALS, CEFR_LEVELS } from "@fala-pt/core";

export const authRouter = t.router({
  register: t.procedure
    .input(
      z.object({
        clerkId: z.string().min(1),
        email: z.string().email().max(320),
        name: z.string().min(1).max(255),
        l1: z.enum(L1_CODES),
        goal: z.enum(USER_GOALS).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, input.clerkId))
        .limit(1);

      if (existing.length > 0) {
        return { userId: existing[0]!.id, created: false };
      }

      const [user] = await ctx.db
        .insert(users)
        .values({
          clerkId: input.clerkId,
          email: input.email,
          name: input.name,
          l1: input.l1,
          goal: input.goal ?? null,
        })
        .returning({ id: users.id });

      await ctx.redis.set(
        `user:${input.clerkId}`,
        JSON.stringify({
          userId: user!.id,
          clerkId: input.clerkId,
          tier: "free",
          l1: input.l1,
        }),
        "EX",
        3600,
      );

      return { userId: user!.id, created: true };
    }),

  getSession: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      l1: user.l1,
      cefrLevel: user.cefrLevel,
      tier: user.tier,
      hearts: user.hearts,
      streakDays: user.streakDays,
      totalXp: user.totalXp,
      adConsent: user.adConsent,
    };
  }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(users).where(eq(users.id, ctx.user.userId));
    await ctx.redis.del(`user:${ctx.user.clerkId}`);
    return { deleted: true };
  }),
});
