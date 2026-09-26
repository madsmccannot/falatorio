import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { transactions } from "@falatorio/db/schema";
import {
  computeBalance,
  getSkillMasteredReward,
  getFirstProductionReward,
  getDomainMilestoneReward,
  type Transaction,
} from "@falatorio/core/economy";

export const economyRouter = t.router({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ type: transactions.type, amount: transactions.amount })
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.userId));

    const txs = rows.map((r) => ({
      type: r.type as Transaction["type"],
      amount: r.amount,
    }));

    return { balance: computeBalance(txs) };
  }),

  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, ctx.user.userId))
        .orderBy(sql`${transactions.createdAt} DESC`)
        .limit(input.limit)
        .offset(input.offset);

      return rows.map((r) => ({
        id: r.id,
        type: r.type,
        amount: r.amount,
        reason: r.reason,
        itemId: r.itemId,
        createdAt: r.createdAt,
      }));
    }),

  earnOuro: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().positive().max(1000),
        reason: z.string().min(1).max(255),
        itemId: z.string().max(128).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [tx] = await ctx.db
        .insert(transactions)
        .values({
          userId: ctx.user.userId,
          type: "earn",
          amount: input.amount,
          reason: input.reason,
          itemId: input.itemId ?? null,
        })
        .returning({ id: transactions.id });

      return { transactionId: tx!.id };
    }),

  spendOuro: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().positive(),
        reason: z.string().min(1).max(255),
        itemId: z.string().max(128).optional(),
      }),
    )
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
      if (balance < input.amount) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "insufficient_balance",
        });
      }

      const [tx] = await ctx.db
        .insert(transactions)
        .values({
          userId: ctx.user.userId,
          type: "spend",
          amount: -input.amount,
          reason: input.reason,
          itemId: input.itemId ?? null,
        })
        .returning({ id: transactions.id });

      return { transactionId: tx!.id, newBalance: balance - input.amount };
    }),

  awardMasteryReward: protectedProcedure
    .input(
      z.object({
        reason: z.enum(["skill_mastered", "first_production", "domain_milestone"]),
        domainsCovered: z.number().int().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let reward;
      switch (input.reason) {
        case "skill_mastered":
          reward = getSkillMasteredReward();
          break;
        case "first_production":
          reward = getFirstProductionReward();
          break;
        case "domain_milestone":
          reward = getDomainMilestoneReward(input.domainsCovered ?? 0);
          if (!reward) {
            return { awarded: false, amount: 0 };
          }
          break;
      }

      const [tx] = await ctx.db
        .insert(transactions)
        .values({
          userId: ctx.user.userId,
          type: "earn",
          amount: reward.amount,
          reason: reward.reason,
        })
        .returning({ id: transactions.id });

      return { awarded: true, amount: reward.amount, transactionId: tx!.id };
    }),
});
