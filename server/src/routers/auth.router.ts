import { z } from "zod";
import { eq } from "drizzle-orm";
import { t } from "../trpc/trpc.js";
import { protectedProcedure, clerkTokenProcedure, rateLimiter, ipRateLimiter } from "../trpc/middleware.js";
import { users, transactions } from "@falatorio/db/schema";
import { L1_CODES, USER_GOALS, OURO } from "@falatorio/core";

const USERNAME_RE = /^[a-z][a-z0-9_]{2,29}$/;

export const authRouter = t.router({
  register: clerkTokenProcedure
    .use(rateLimiter(5, 60_000, "auth:register"))
    .input(
      z.object({
        email: z.string().email().max(320),
        name: z.string().min(1).max(255),
        username: z.string().min(3).max(30).regex(USERNAME_RE),
        l1: z.enum(L1_CODES),
        goal: z.enum(USER_GOALS).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clerkId = ctx.clerkId;

      const existing = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (existing.length > 0) {
        return { userId: existing[0]!.id, created: false };
      }

      const [byEmail] = await ctx.db
        .select({ id: users.id, clerkId: users.clerkId })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (byEmail) {
        if (byEmail.clerkId && byEmail.clerkId !== clerkId) {
          throw new Error("EMAIL_ALREADY_LINKED");
        }

        await ctx.db
          .update(users)
          .set({ clerkId, updatedAt: new Date() })
          .where(eq(users.id, byEmail.id));

        await ctx.redis.set(
          `user:${clerkId}`,
          JSON.stringify({
            userId: byEmail.id,
            clerkId,
            tier: "free",
            l1: input.l1,
          }),
          "EX",
          3600,
        );

        return { userId: byEmail.id, created: false };
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
          clerkId,
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
        `user:${clerkId}`,
        JSON.stringify({
          userId: user!.id,
          clerkId,
          tier: "free",
          l1: input.l1,
        }),
        "EX",
        3600,
      );

      return { userId: user!.id, created: true };
    }),

  checkAccount: t.procedure.use(ipRateLimiter(30, 60_000, "auth:check")).query(async ({ ctx }) => {
    if (!ctx.user) return { exists: false as const };
    return { exists: true as const, l1: ctx.user.l1, tier: ctx.user.tier };
  }),

  checkUsername: t.procedure
    .use(ipRateLimiter(20, 60_000, "auth:username"))
    .input(z.object({ username: z.string().min(3).max(30) }))
    .query(async ({ ctx, input }) => {
      if (!USERNAME_RE.test(input.username)) {
        return { available: false, reason: "INVALID_FORMAT" as const };
      }

      const [existing] = await ctx.db
        .select({ id: users.id, clerkId: users.clerkId })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!existing) return { available: true, reason: null };

      if (ctx.user && existing.clerkId === ctx.user.clerkId) {
        return { available: true, reason: null };
      }

      return { available: false, reason: "TAKEN" as const };
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

  deleteAccount: protectedProcedure.use(rateLimiter(3, 3_600_000, "auth:delete")).mutation(async ({ ctx }) => {
    await ctx.db.delete(users).where(eq(users.id, ctx.user.userId));
    await ctx.redis.del(`user:${ctx.user.clerkId}`);
    return { deleted: true };
  }),
});
