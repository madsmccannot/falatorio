import type { Tier } from "../constants.js";

export interface StreakState {
  currentDays: number;
  longestDays: number;
  lastActivityDate: string | null;
  freezeAvailable: boolean;
  freezeUsedToday: boolean;
}

export interface StreakCheckResult {
  streakDays: number;
  streakBroken: boolean;
  freezeUsed: boolean;
  longestDays: number;
}

function toDateString(date: Date, timezone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone: timezone });
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + "T00:00:00Z");
  const b = new Date(dateB + "T00:00:00Z");
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function checkStreak(
  state: StreakState,
  now: Date,
  timezone: string,
): StreakCheckResult {
  const today = toDateString(now, timezone);

  if (state.lastActivityDate === null) {
    return {
      streakDays: 0,
      streakBroken: false,
      freezeUsed: false,
      longestDays: state.longestDays,
    };
  }

  if (state.lastActivityDate === today) {
    return {
      streakDays: state.currentDays,
      streakBroken: false,
      freezeUsed: false,
      longestDays: state.longestDays,
    };
  }

  const gap = daysBetween(state.lastActivityDate, today);

  if (gap === 1) {
    return {
      streakDays: state.currentDays,
      streakBroken: false,
      freezeUsed: false,
      longestDays: state.longestDays,
    };
  }

  if (gap === 2 && state.freezeAvailable && !state.freezeUsedToday) {
    return {
      streakDays: state.currentDays,
      streakBroken: false,
      freezeUsed: true,
      longestDays: state.longestDays,
    };
  }

  return {
    streakDays: 0,
    streakBroken: true,
    freezeUsed: false,
    longestDays: state.longestDays,
  };
}

export function recordActivity(
  state: StreakState,
  now: Date,
  timezone: string,
): StreakState {
  const today = toDateString(now, timezone);

  if (state.lastActivityDate === today) {
    return state;
  }

  const check = checkStreak(state, now, timezone);
  const newDays = check.streakBroken ? 1 : check.streakDays + 1;
  const newLongest = Math.max(state.longestDays, newDays);

  return {
    currentDays: newDays,
    longestDays: newLongest,
    lastActivityDate: today,
    freezeAvailable: check.freezeUsed ? false : state.freezeAvailable,
    freezeUsedToday: false,
  };
}

export function canRecoverStreak(
  state: StreakState,
  tier: Tier,
  recoveryUsedThisWeek: boolean,
): boolean {
  return tier === "super" && !recoveryUsedThisWeek && state.currentDays === 0;
}
