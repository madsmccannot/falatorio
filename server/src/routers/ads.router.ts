import { z } from "zod";
import { eq, gte, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users, adEvents, transactions } from "@fala-pt/db/schema";
import { ADS, HEARTS, CRYSTALS } from "@fala-pt/core";
import {
  shouldShowBannerAd,
  shouldShowInterstitialAd,
  canShowRewardAd,
  getRewardAdOptions,
} from "@fala-pt/core/ads";

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

      const adState = {
        tier: user.tier as "free" | "super",
        adConsent: user.adConsent,
        lastAdShownAt: user.lastAdShownAt,
        lessonsCompletedSinceLastInterstitial: input.lessonCount ?? 0,
      };

      switch (input.placement) {
        case "banner":
          return { show: shouldShowBannerAd(adState), reason: null };
        case "interstitial":
          return { show: shouldShowInterstitialAd(adState), reason: null };
        case "reward": {
          const canShow = canShowRewardAd(adState);
          if (!canShow) return { show: false, reason: "cooldown" };
          return { show: true, options: getRewardAdOptions(), reason: null };
        }
      }
    }),

  recordAdView: protectedProcedure
    .input(
      z.object({
        adType: z.enum(["banner", "interstitial", "reward"]),
        rewardType: z.enum(["heart", "crystal"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(adEvents).values({
        userId: ctx.user.userId,
        adType: input.adType,
        rewardType: input.rewardType ?? null,
        rewardAmount: input.rewardType === "heart"
          ? HEARTS.REWARD_AD_AMOUNT
          : input.rewardType === "crystal"
            ? CRYSTALS.EARN_REWARD_AD
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

      if (input.rewardType === "crystal") {
        await ctx.db.insert(transactions).values({
          userId: ctx.user.userId,
          type: "earn",
          amount: CRYSTALS.EARN_REWARD_AD,
          reason: "reward_ad",
        });

        return { rewarded: true, rewardType: "crystal", amount: CRYSTALS.EARN_REWARD_AD };
      }

      return { rewarded: false, rewardType: null, amount: 0 };
    }),
});
