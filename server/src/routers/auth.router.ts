import { z } from "zod";
import { eq } from "drizzle-orm";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users, transactions } from "@falatorio/db/schema";
import { L1_CODES, USER_GOALS, OURO } from "@falatorio/core";

const USERNAME_RE = /^[a-z][a-z0-9_]{2,29}$/;

export const authRouter = t.router({
  register: t.procedure
    .input(
      z.object({
        clerkId: z.string().min(1),
        email: z.string().email().max(320),
        name: z.string().min(1).max(255),
        username: z.string().min(3).max(30).regex(USERNAME_RE),
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

      const taken = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (taken.length > 0) {
        throw new Error("USERNAME_TAKEN");
      }

      const [user] = await ctx.db
        .insert(users)
        .values({
          clerkId: input.clerkId,
          email: input.email,
          name: input.name,
          username: input.username,
          l1: input.l1,
          goal: input.goal ?? null,
        })
        .returning({ id: users.id });

      await ctx.db.insert(transactions).values({
        userId: user!.id,
        type: "earn",
        amount: OURO.WELCOME_BONUS,
        reason: "welcome_bonus",
      });

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

  checkAccount: t.procedure.query(async ({ ctx }) => {
    if (!ctx.user) return { exists: false as const };
    return { exists: true as const, l1: ctx.user.l1, tier: ctx.user.tier };
  }),

  checkUsername: t.procedure
    .input(z.object({ username: z.string().min(3).max(30) }))
    .query(async ({ ctx, input }) => {
      if (!USERNAME_RE.test(input.username)) {
        return { available: false, reason: "INVALID_FORMAT" as const };
      }

      const existing = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      return {
        available: existing.length === 0,
        reason: existing.length > 0 ? ("TAKEN" as const) : null,
      };
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
      username: user.username,
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
