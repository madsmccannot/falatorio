import { Platform } from "react-native";

export const AD_UNITS = {
  banner: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS ?? "",
    android: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID ?? "",
  }) ?? "",
  interstitial: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS ?? "",
    android: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID ?? "",
  }) ?? "",
  reward: Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARD_IOS ?? "",
    android: process.env.EXPO_PUBLIC_ADMOB_REWARD_ANDROID ?? "",
  }) ?? "",
};

export const AD_COOLDOWNS = {
  BANNER_REFRESH_MS: 30_000,
  INTERSTITIAL_MIN_INTERVAL_MS: 180_000,
  REWARD_MIN_INTERVAL_MS: 60_000,
} as const;

export const AD_REWARDS = {
  REWARD_HEARTS: 1,
  REWARD_CRYSTALS: 25,
} as const;
