import { XP } from "../constants.js";
import type { XPBoostLevel } from "../constants.js";

export type PracticeType = "review" | "hearts" | false;

export interface XPInput {
  sectionSortOrder: number;
  isUnitFinal: boolean;
  practiceType: PracticeType;
  isPerfect: boolean;
  isFirstOfDay: boolean;
  boostLevel: XPBoostLevel;
}

export interface XPResult {
  base: number;
  sectionMultiplier: number;
  perfectBonus: number;
  firstOfDayBonus: number;
  boostMultiplier: number;
  total: number;
}

function getSectionMultiplier(sortOrder: number): number {
  const idx = Math.min(sortOrder, XP.SECTION_MULTIPLIERS.length - 1);
  return XP.SECTION_MULTIPLIERS[idx]!;
}

export function calculateXP(input: XPInput): XPResult {
  const sectionMultiplier = getSectionMultiplier(input.sectionSortOrder);

  let base: number;
  if (input.practiceType === "review") {
    base = XP.REVIEW_BASE;
  } else if (input.practiceType === "hearts") {
    base = XP.HEARTS_PRACTICE_BASE;
  } else if (input.isUnitFinal) {
    base = XP.UNIT_FINAL_BASE;
  } else {
    base = XP.SESSION_BASE;
  }

  const scaled = Math.round(base * sectionMultiplier);
  const perfectBonus = input.isPerfect ? XP.BONUS_PERFECT : 0;
  const firstOfDayBonus = input.isFirstOfDay ? XP.BONUS_FIRST_OF_DAY : 0;
  const boostMultiplier = input.boostLevel || 1;

  const total = Math.round((scaled + perfectBonus + firstOfDayBonus) * boostMultiplier);

  return {
    base: scaled,
    sectionMultiplier,
    perfectBonus,
    firstOfDayBonus,
    boostMultiplier,
    total,
  };
}
