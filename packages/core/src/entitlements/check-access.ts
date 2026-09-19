import type { Tier } from "../constants.js";
import { EXPLAINS } from "../constants.js";
import { type Feature, hasFeature } from "./feature-gates.js";

export interface UserEntitlements {
  tier: Tier;
  tierExpiresAt: Date | null;
}

export function checkAccess(user: UserEntitlements, feature: Feature): boolean {
  if (user.tier === "super") {
    if (user.tierExpiresAt && user.tierExpiresAt < new Date()) {
      return false;
    }
    return hasFeature("super", feature);
  }
  return hasFeature("free", feature);
}

export function getExplainLimit(tier: Tier): number {
  return tier === "super" ? EXPLAINS.SUPER_LIMIT : EXPLAINS.FREE_DAILY_LIMIT;
}

export function isSuperActive(user: UserEntitlements): boolean {
  if (user.tier !== "super") return false;
  if (user.tierExpiresAt && user.tierExpiresAt < new Date()) return false;
  return true;
}

export function getEffectiveTier(user: UserEntitlements): Tier {
  return isSuperActive(user) ? "super" : "free";
}
