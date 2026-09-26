import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { shopItems, transactions, users, iapReceipts } from "@falatorio/db/schema";
import { computeBalance, type Transaction } from "@falatorio/core/economy";
import { HEARTS } from "@falatorio/core";

export const shopRouter = t.router({
  listItems: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select()
      .from(shopItems)
      .where(eq(shopItems.active, true))
      .orderBy(shopItems.sortOrder);

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      priceOuro: item.priceOuro,
      priceEur: item.priceEur,
      icon: item.icon,
      effect: item.effect,
    }));
  }),

  purchaseWithOuro: protectedProcedure
    .input(z.object({ itemId: z.string().max(64) }))
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
        .select()
        .from(shopItems)
        .where(eq(shopItems.id, input.itemId))
        .limit(1);

      if (!item || !item.active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      if (item.priceOuro === null) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Item cannot be purchased with ouro",
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
      if (balance < item.priceOuro) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "insufficient_ouro",
        });
      }

      await ctx.db.insert(transactions).values({
        userId: ctx.user.userId,
        type: "spend",
        amount: -item.priceOuro,
        reason: "shop_purchase",
        itemId: item.id,
      });

      const effect = item.effect as { type: string; [key: string]: unknown };
      await applyEffect(ctx, effect);

      return {
        purchased: true,
        itemId: item.id,
        ouroSpent: item.priceOuro,
        newBalance: balance - item.priceOuro,
      };
    }),

  recordIAP: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["apple", "google"]),
        receiptData: z.string().min(1),
        productId: z.string().min(1).max(128),
        transactionId: z.string().max(255).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [receipt] = await ctx.db
        .insert(iapReceipts)
        .values({
          userId: ctx.user.userId,
          platform: input.platform,
          receiptData: input.receiptData,
          productId: input.productId,
          transactionId: input.transactionId ?? null,
          validated: false,
        })
        .returning({ id: iapReceipts.id });

      return { receiptId: receipt!.id, status: "pending_validation" };
    }),
});

async function applyEffect(
  ctx: { db: any; user: { userId: string } },
  effect: { type: string; [key: string]: unknown },
): Promise<void> {
  switch (effect.type) {
    case "heart_refill":
      await ctx.db
        .update(users)
        .set({ hearts: HEARTS.MAX, heartsRefillAt: null, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));
      break;
    case "streak_freeze":
      break;
    case "xp_boost":
      await ctx.db
        .update(users)
        .set({ updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));
      break;
    case "super_monthly":
    case "super_yearly": {
      const durationMs =
        effect.type === "super_yearly"
          ? 365 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
      await ctx.db
        .update(users)
        .set({
          tier: "super",
          tierExpiresAt: new Date(Date.now() + durationMs),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.userId));
      break;
    }
  }
}
