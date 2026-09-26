import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users, adEvents, transactions } from "@falatorio/db/schema";
import { HEARTS, OURO } from "@falatorio/core";
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
    .input(
      z.object({
        adType: z.enum(["banner", "interstitial", "reward"]),
        rewardType: z.enum(["heart", "ouro"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
        const [user] = await ctx.db
          .select({ hearts: users.hearts })
          .from(users)
          .where(eq(users.id, ctx.user.userId))
          .limit(1);

        const currentHearts = user?.hearts ?? 0;
        const newHearts = Math.min(HEARTS.MAX, currentHearts + HEARTS.REWARD_AD_AMOUNT);
        await ctx.db
          .update(users)
          .set({ hearts: newHearts, updatedAt: new Date() })
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
