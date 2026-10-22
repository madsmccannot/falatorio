import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/trpc.js";
import { protectedProcedure, rateLimiter } from "../trpc/middleware.js";
import { users, adEvents, transactions } from "@falatorio/db/schema";
import { HEARTS, OURO, ADS } from "@falatorio/core";
import {
  shouldShowBannerAd,
  shouldShowInterstitialAd,
  canShowRewardAd,
  getRewardAdOptions,
  type AdState,
} from "@falatorio/core/ads";
import type { Tier } from "@falatorio/core";

export const adsRouter = t.router({
  getAdDecision: protectedProcedure
    .input(
      z.object({
        placement: z.enum(["banner", "interstitial", "reward"]),
        lessonCount: z.number().int().min(0).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          tier: users.tier,
          adConsent: users.adConsent,
          lastAdShownAt: users.lastAdShownAt,
        })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (user.tier === "super" || !user.adConsent) {
        return { show: false, reason: user.tier === "super" ? "super_user" : "no_consent" };
      }

      const tier = user.tier as Tier;
      const adState: AdState = {
        lastBannerShownAt: null,
        lastInterstitialShownAt: user.lastAdShownAt,
        lastRewardAdShownAt: user.lastAdShownAt,
        lessonsCompletedSinceLastInterstitial: input.lessonCount ?? 0,
        sessionStartedAt: new Date(),
        hasGDPRConsent: user.adConsent,
      };

      switch (input.placement) {
        case "banner":
          return { show: shouldShowBannerAd(tier, adState).show, reason: null };
        case "interstitial":
          return { show: shouldShowInterstitialAd(tier, adState).show, reason: null };
        case "reward": {
          const decision = canShowRewardAd(tier, adState);
          if (!decision.show) return { show: false, reason: "cooldown" };
          return { show: true, options: getRewardAdOptions(), reason: null };
        }
      }
    }),

  recordAdView: protectedProcedure
    .use(rateLimiter(10, 60_000, "ads:view"))
    .input(
      z.object({
        adType: z.enum(["banner", "interstitial", "reward"]),
        rewardType: z.enum(["heart", "ouro"]).optional(),
        transactionId: z.string().max(256).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.rewardType) {
        const [user] = await ctx.db
          .select({ lastAdShownAt: users.lastAdShownAt, tier: users.tier, adConsent: users.adConsent })
          .from(users)
          .where(eq(users.id, ctx.user.userId))
          .limit(1);

        if (!user) throw new TRPCError({ code: "NOT_FOUND" });
        if (user.tier === "super" || !user.adConsent) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not eligible for ad rewards" });
        }

        if (user.lastAdShownAt) {
          const elapsed = Date.now() - new Date(user.lastAdShownAt).getTime();
          if (elapsed < ADS.REWARD_COOLDOWN_MS) {
            throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Reward cooldown active" });
          }
        }

        if (input.transactionId) {
          const verifiedKey = `admob:verified:${ctx.user.userId}:${input.transactionId}`;
          const verified = await ctx.redis.get(verifiedKey);
          if (!verified) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Ad reward not verified by SSV" });
          }
          await ctx.redis.del(verifiedKey);
        }
      }

      await ctx.db.insert(adEvents).values({
        userId: ctx.user.userId,
        adType: input.adType,
        rewardType: input.rewardType ?? null,
        rewardAmount: input.rewardType === "heart"
          ? HEARTS.REWARD_AD_AMOUNT
          : input.rewardType === "ouro"
            ? OURO.EARN_REWARD_AD
            : null,
      });

      await ctx.db
        .update(users)
        .set({ lastAdShownAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));

      if (input.rewardType === "heart") {
        await ctx.db
          .update(users)
          .set({
            hearts: sql`LEAST(${users.hearts} + ${HEARTS.REWARD_AD_AMOUNT}, ${HEARTS.MAX})`,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.userId));

        return { rewarded: true, rewardType: "heart", amount: HEARTS.REWARD_AD_AMOUNT };
      }

      if (input.rewardType === "ouro") {
        await ctx.db.insert(transactions).values({
          userId: ctx.user.userId,
          type: "earn",
          amount: OURO.EARN_REWARD_AD,
          reason: "reward_ad",
        });

        return { rewarded: true, rewardType: "ouro", amount: OURO.EARN_REWARD_AD };
      }

      return { rewarded: false, rewardType: null, amount: 0 };
    }),
});
