import { XP } from "../constants.js";
import type { CognitiveLevel } from "../constants.js";

export interface XPInput {
  accuracy: number;
  streakDays: number;
  isPerfect: boolean;
  isFirstOfDay: boolean;
  hasXPBoost: boolean;
  cognitiveLevel?: CognitiveLevel;
}

export interface XPResult {
  base: number;
  accuracyMultiplier: number;
  streakMultiplier: number;
  cognitiveMultiplier: number;
  perfectBonus: number;
  firstOfDayBonus: number;
  boostMultiplier: number;
  total: number;
}

const COGNITIVE_XP_MULTIPLIER: Record<CognitiveLevel, number> = {
  recognition: 1.0,
  comprehension: 1.1,
  controlled_production: 1.2,
  transformation: 1.3,
  translation: 1.3,
  free_production: 1.5,
  communication: 1.5,
};

function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return XP.STREAK_MULTIPLIER_BEYOND;
  if (streakDays >= 7) return XP.STREAK_MULTIPLIER_MONTH;
  return XP.STREAK_MULTIPLIER_WEEK;
}

export function calculateXP(input: XPInput): XPResult {
  const base = XP.BASE_PER_EXERCISE;
  const accuracyMultiplier = input.accuracy;
  const streakMultiplier = getStreakMultiplier(input.streakDays);
  const cognitiveMultiplier = input.cognitiveLevel
    ? COGNITIVE_XP_MULTIPLIER[input.cognitiveLevel]
    : 1.0;
  const perfectBonus = input.isPerfect ? XP.BONUS_PERFECT : 0;
  const firstOfDayBonus = input.isFirstOfDay ? XP.BONUS_FIRST_OF_DAY : 0;
  const boostMultiplier = input.hasXPBoost ? XP.BOOST_MULTIPLIER : 1;

  const total = Math.round(
    (base * accuracyMultiplier * streakMultiplier * cognitiveMultiplier +
      perfectBonus + firstOfDayBonus) *
      boostMultiplier,
  );

  return {
    base,
    accuracyMultiplier,
    streakMultiplier,
    cognitiveMultiplier,
    perfectBonus,
    firstOfDayBonus,
    boostMultiplier,
    total,
  };
}
