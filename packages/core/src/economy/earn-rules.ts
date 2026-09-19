import { CRYSTALS } from "../constants.js";

export type EarnReason =
  | "lesson_complete"
  | "perfect_lesson"
  | "daily_streak"
  | "reward_ad"
  | "milestone_100_lessons";

export interface EarnReward {
  amount: number;
  reason: EarnReason;
}

export function getLessonReward(isPerfect: boolean): EarnReward {
  if (isPerfect) {
    return { amount: CRYSTALS.EARN_PERFECT_LESSON, reason: "perfect_lesson" };
  }
  return { amount: CRYSTALS.EARN_LESSON_COMPLETE, reason: "lesson_complete" };
}

export function getDailyStreakReward(): EarnReward {
  return { amount: CRYSTALS.EARN_DAILY_STREAK, reason: "daily_streak" };
}

export function getRewardAdReward(): EarnReward {
  return { amount: CRYSTALS.EARN_REWARD_AD, reason: "reward_ad" };
}

export function getMilestoneReward(lessonsCompleted: number): EarnReward | null {
  if (lessonsCompleted === 100) {
    return { amount: CRYSTALS.EARN_MILESTONE_100_LESSONS, reason: "milestone_100_lessons" };
  }
  return null;
}
