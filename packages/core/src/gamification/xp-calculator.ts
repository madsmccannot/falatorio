import { XP } from "../constants.js";

export interface XPInput {
  accuracy: number;
  streakDays: number;
  isPerfect: boolean;
  isFirstOfDay: boolean;
  hasXPBoost: boolean;
}

export interface XPResult {
  base: number;
  accuracyMultiplier: number;
  streakMultiplier: number;
  perfectBonus: number;
  firstOfDayBonus: number;
  boostMultiplier: number;
  total: number;
}

function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return XP.STREAK_MULTIPLIER_BEYOND;
  if (streakDays >= 7) return XP.STREAK_MULTIPLIER_MONTH;
  return XP.STREAK_MULTIPLIER_WEEK;
}

export function calculateXP(input: XPInput): XPResult {
  const base = XP.BASE_PER_EXERCISE;
  const accuracyMultiplier = input.accuracy;
  const streakMultiplier = getStreakMultiplier(input.streakDays);
  const perfectBonus = input.isPerfect ? XP.BONUS_PERFECT : 0;
  const firstOfDayBonus = input.isFirstOfDay ? XP.BONUS_FIRST_OF_DAY : 0;
  const boostMultiplier = input.hasXPBoost ? XP.BOOST_MULTIPLIER : 1;

  const total = Math.round(
    (base * accuracyMultiplier * streakMultiplier + perfectBonus + firstOfDayBonus) *
      boostMultiplier,
  );

  return {
    base,
    accuracyMultiplier,
    streakMultiplier,
    perfectBonus,
    firstOfDayBonus,
    boostMultiplier,
    total,
  };
}
