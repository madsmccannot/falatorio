import type { Tier } from "../constants.js";

export const FEATURES = [
  "unlimited_hearts",
  "no_ads",
  "error_review",
  "streak_recovery",
  "bonus_powerups",
  "unlimited_explains",
  "priority_support",
] as const;

export type Feature = (typeof FEATURES)[number];

const SUPER_FEATURES: ReadonlySet<Feature> = new Set([
  "unlimited_hearts",
  "no_ads",
  "error_review",
  "streak_recovery",
  "bonus_powerups",
  "unlimited_explains",
  "priority_support",
]);

const FREE_FEATURES: ReadonlySet<Feature> = new Set<Feature>();

export function hasFeature(tier: Tier, feature: Feature): boolean {
  if (tier === "super") return SUPER_FEATURES.has(feature);
  return FREE_FEATURES.has(feature);
}

export function getFeatures(tier: Tier): readonly Feature[] {
  if (tier === "super") return [...SUPER_FEATURES];
  return [...FREE_FEATURES];
}

export function getLockedFeatures(tier: Tier): readonly Feature[] {
  if (tier === "super") return [];
  return FEATURES.filter((f) => !FREE_FEATURES.has(f));
}
