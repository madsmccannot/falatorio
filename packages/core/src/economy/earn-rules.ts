import { OURO } from "../constants.js";

export type EarnReason =
  | "lesson_complete"
  | "perfect_lesson"
  | "daily_streak"
  | "reward_ad"
  | "milestone_100_lessons"
  | "skill_mastered"
  | "first_production"
  | "domain_milestone";

export interface EarnReward {
  amount: number;
  reason: EarnReason;
}

export function getLessonReward(isPerfect: boolean): EarnReward {
  if (isPerfect) {
    return { amount: OURO.EARN_PERFECT_LESSON, reason: "perfect_lesson" };
  }
  return { amount: OURO.EARN_LESSON_COMPLETE, reason: "lesson_complete" };
}

export function getDailyStreakReward(): EarnReward {
  return { amount: OURO.EARN_DAILY_STREAK, reason: "daily_streak" };
}

export function getRewardAdReward(): EarnReward {
  return { amount: OURO.EARN_REWARD_AD, reason: "reward_ad" };
}

export function getMilestoneReward(lessonsCompleted: number): EarnReward | null {
  if (lessonsCompleted === 100) {
    return { amount: OURO.EARN_MILESTONE_100_LESSONS, reason: "milestone_100_lessons" };
  }
  return null;
}

export function getSkillMasteredReward(): EarnReward {
  return { amount: OURO.EARN_SKILL_MASTERED, reason: "skill_mastered" };
}

export function getFirstProductionReward(): EarnReward {
  return { amount: OURO.EARN_FIRST_PRODUCTION, reason: "first_production" };
}

export function getDomainMilestoneReward(domainsCovered: number): EarnReward | null {
  if (domainsCovered > 0 && domainsCovered % 5 === 0) {
    return { amount: OURO.EARN_DOMAIN_MILESTONE, reason: "domain_milestone" };
  }
  return null;
}
