import type { Tier } from "../constants.js";
import { ADS, HEARTS, OURO } from "../constants.js";

export interface AdState {
  lastBannerShownAt: Date | null;
  lastInterstitialShownAt: Date | null;
  lastRewardAdShownAt: Date | null;
  lessonsCompletedSinceLastInterstitial: number;
  sessionStartedAt: Date;
  hasGDPRConsent: boolean;
}

export interface AdDecision {
  show: boolean;
  reason: string;
}

export function shouldShowBannerAd(tier: Tier, state: AdState): AdDecision {
  if (tier === "super") {
    return { show: false, reason: "super_user" };
  }
  if (!state.hasGDPRConsent) {
    return { show: false, reason: "no_consent" };
  }
  return { show: true, reason: "eligible" };
}

export function shouldShowInterstitialAd(tier: Tier, state: AdState, now: Date = new Date()): AdDecision {
  if (tier === "super") {
    return { show: false, reason: "super_user" };
  }
  if (!state.hasGDPRConsent) {
    return { show: false, reason: "no_consent" };
  }
  if (state.lessonsCompletedSinceLastInterstitial < ADS.INTERSTITIAL_EVERY_N_LESSONS) {
    return { show: false, reason: "not_enough_lessons" };
  }
  if (state.lastInterstitialShownAt) {
    const elapsed = now.getTime() - state.lastInterstitialShownAt.getTime();
    if (elapsed < ADS.INTERSTITIAL_COOLDOWN_MS) {
      return { show: false, reason: "cooldown_active" };
    }
  }
  return { show: true, reason: "eligible" };
}

export function canShowRewardAd(tier: Tier, state: AdState, now: Date = new Date()): AdDecision {
  if (tier === "super") {
    return { show: false, reason: "super_user" };
  }
  if (!state.hasGDPRConsent) {
    return { show: false, reason: "no_consent" };
  }
  if (state.lastRewardAdShownAt) {
    const elapsed = now.getTime() - state.lastRewardAdShownAt.getTime();
    if (elapsed < ADS.REWARD_COOLDOWN_MS) {
      return { show: false, reason: "cooldown_active" };
    }
  }
  return { show: true, reason: "eligible" };
}

export interface RewardAdClaim {
  type: "heart" | "ouro";
  amount: number;
}

export function getRewardAdOptions(): readonly RewardAdClaim[] {
  return [
    { type: "heart", amount: HEARTS.REWARD_AD_AMOUNT },
    { type: "ouro", amount: OURO.EARN_REWARD_AD },
  ];
}

export function createInitialAdState(hasConsent: boolean): AdState {
  return {
    lastBannerShownAt: null,
    lastInterstitialShownAt: null,
    lastRewardAdShownAt: null,
    lessonsCompletedSinceLastInterstitial: 0,
    sessionStartedAt: new Date(),
    hasGDPRConsent: hasConsent,
  };
}
