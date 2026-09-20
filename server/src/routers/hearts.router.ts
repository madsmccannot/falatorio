import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users, transactions } from "@falatorio/db/schema";
import { HEARTS, CRYSTALS } from "@falatorio/core";
import { getHearts } from "@falatorio/core/entitlements";
import { computeBalance, type Transaction } from "@falatorio/core/economy";
import type { Tier } from "@falatorio/core";

export const heartsRouter = t.router({
  getState: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        hearts: users.hearts,
        heartsRefillAt: users.heartsRefillAt,
        tier: users.tier,
      })
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    if (user.tier === "super") {
      return { hearts: HEARTS.MAX, unlimited: true, nextRefillAt: null };
    }

    const current = getHearts(
      { hearts: user.hearts, heartsRefillAt: user.heartsRefillAt },
      user.tier as Tier,
    );

    return {
      hearts: current ?? HEARTS.MAX,
      unlimited: false,
      nextRefillAt: user.heartsRefillAt,
    };
  }),

  refillWithCrystals: protectedProcedure.mutation(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({ hearts: users.hearts, tier: users.tier })
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    if (user.hearts !== null && user.hearts >= HEARTS.MAX) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "hearts_already_full",
      });
    }

    const rows = await ctx.db
      .select({ type: transactions.type, amount: transactions.amount })
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.userId));

    const txs = rows.map((r) => ({
      type: r.type as Transaction["type"],
      amount: r.amount,
    }));

    const balance = computeBalance(txs);
    if (balance < CRYSTALS.COST_HEART_REFILL) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "insufficient_crystals",
      });
    }

    await ctx.db
      .insert(transactions)
      .values({
        userId: ctx.user.userId,
        type: "spend",
        amount: -CRYSTALS.COST_HEART_REFILL,
        reason: "heart_refill",
      });

    await ctx.db
      .update(users)
      .set({
        hearts: HEARTS.MAX,
        heartsRefillAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.userId));

    return { hearts: HEARTS.MAX, crystalsSpent: CRYSTALS.COST_HEART_REFILL };
  }),

  continueWithCrystals: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({ type: transactions.type, amount: transactions.amount })
        .from(transactions)
        .where(eq(transactions.userId, ctx.user.userId));

      const txs = rows.map((r) => ({
        type: r.type as Transaction["type"],
        amount: r.amount,
      }));

      const balance = computeBalance(txs);
      if (balance < CRYSTALS.COST_CONTINUE_LESSON) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "insufficient_crystals",
        });
      }

      await ctx.db
        .insert(transactions)
        .values({
          userId: ctx.user.userId,
          type: "spend",
          amount: -CRYSTALS.COST_CONTINUE_LESSON,
          reason: "continue_lesson",
          itemId: input.sessionId,
        });

      await ctx.db
        .update(users)
        .set({ hearts: 1, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));

      return { hearts: 1, crystalsSpent: CRYSTALS.COST_CONTINUE_LESSON };
    }),
});
