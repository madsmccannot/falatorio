import { LEAGUE, type LeagueTier } from "../constants.js";

export interface LeagueEntry {
  userId: string;
  weeklyXP: number;
  tier: LeagueTier;
}

export interface PromotionResult {
  userId: string;
  previousTier: LeagueTier;
  newTier: LeagueTier;
  action: "promote" | "demote" | "stay";
}

const TIER_ORDER: readonly LeagueTier[] = [
  "bronze", "silver", "gold", "diamond", "obsidian",
];

function tierIndex(tier: LeagueTier): number {
  return TIER_ORDER.indexOf(tier);
}

function tierAbove(tier: LeagueTier): LeagueTier {
  const idx = tierIndex(tier);
  return TIER_ORDER[Math.min(idx + 1, TIER_ORDER.length - 1)]!;
}

function tierBelow(tier: LeagueTier): LeagueTier {
  const idx = tierIndex(tier);
  return TIER_ORDER[Math.max(idx - 1, 0)]!;
}

export function calculatePromotions(entries: readonly LeagueEntry[]): PromotionResult[] {
  const sorted = [...entries].sort((a, b) => b.weeklyXP - a.weeklyXP);

  return sorted.map((entry, rank) => {
    const position = rank + 1;

    if (position <= LEAGUE.PROMOTE_TOP && entry.tier !== "obsidian") {
      return {
        userId: entry.userId,
        previousTier: entry.tier,
        newTier: tierAbove(entry.tier),
        action: "promote" as const,
      };
    }

    if (
      position > sorted.length - LEAGUE.DEMOTE_BOTTOM &&
      entry.tier !== "bronze"
    ) {
      return {
        userId: entry.userId,
        previousTier: entry.tier,
        newTier: tierBelow(entry.tier),
        action: "demote" as const,
      };
    }

    return {
      userId: entry.userId,
      previousTier: entry.tier,
      newTier: entry.tier,
      action: "stay" as const,
    };
  });
}
