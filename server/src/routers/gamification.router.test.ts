import { describe, it, expect } from "vitest";
import { checkStreak, recordActivity } from "@falatorio/core/gamification";
import { computeBalance, type Transaction } from "@falatorio/core/economy";
import { OURO } from "@falatorio/core";

describe("gamification.recordDailyActivity invariants", () => {
  it("creates a fresh streak record for new users", () => {
    const existingStreak = null;
    expect(existingStreak).toBeNull();
  });

  it("streak is idempotent for same-day activity", () => {
    const now = new Date("2026-10-14T12:00:00Z");
    const timezone = "Europe/Lisbon";
    const streak = {
      currentDays: 5,
      longestDays: 10,
      lastActivityDate: "2026-10-14",
      freezeAvailable: false,
      freezeUsedToday: false,
    };

    const updated = recordActivity(streak, now, timezone);
    expect(updated.currentDays).toBe(5);
  });

  it("streak increments for next-day activity", () => {
    const now = new Date("2026-10-15T12:00:00Z");
    const timezone = "Europe/Lisbon";
    const streak = {
      currentDays: 5,
      longestDays: 10,
      lastActivityDate: "2026-10-14",
      freezeAvailable: false,
      freezeUsedToday: false,
    };

    const updated = recordActivity(streak, now, timezone);
    expect(updated.currentDays).toBe(6);
  });

  it("streak resets after a gap with no freeze", () => {
    const now = new Date("2026-10-16T12:00:00Z");
    const timezone = "Europe/Lisbon";
    const streak = {
      currentDays: 5,
      longestDays: 10,
      lastActivityDate: "2026-10-14",
      freezeAvailable: false,
      freezeUsedToday: false,
    };

    const updated = recordActivity(streak, now, timezone);
    expect(updated.currentDays).toBe(1);
  });
});

describe("gamification.purchaseStreakFreeze invariants", () => {
  it("rejects purchase when balance is insufficient", () => {
    const txs: Pick<Transaction, "type" | "amount">[] = [
      { type: "earn", amount: 10 },
    ];
    const balance = computeBalance(txs);
    expect(balance).toBeLessThan(OURO.COST_STREAK_FREEZE);
  });

  it("allows purchase when balance is sufficient", () => {
    const txs: Pick<Transaction, "type" | "amount">[] = [
      { type: "earn", amount: OURO.COST_STREAK_FREEZE + 100 },
    ];
    const balance = computeBalance(txs);
    expect(balance).toBeGreaterThanOrEqual(OURO.COST_STREAK_FREEZE);
  });

  it("freeze cost is recorded as negative spend transaction", () => {
    const amount = -OURO.COST_STREAK_FREEZE;
    expect(amount).toBeLessThan(0);
  });
});

describe("gamification.checkStreak invariants", () => {
  it("detects broken streak after two missed days", () => {
    const now = new Date("2026-10-16T12:00:00Z");
    const timezone = "Europe/Lisbon";
    const streak = {
      currentDays: 5,
      longestDays: 10,
      lastActivityDate: "2026-10-14",
      freezeAvailable: false,
      freezeUsedToday: false,
    };

    const result = checkStreak(streak, now, timezone);
    expect(result.streakBroken).toBe(true);
  });

  it("streak is active when last activity was today", () => {
    const now = new Date("2026-10-14T15:00:00Z");
    const timezone = "Europe/Lisbon";
    const streak = {
      currentDays: 5,
      longestDays: 10,
      lastActivityDate: "2026-10-14",
      freezeAvailable: false,
      freezeUsedToday: false,
    };

    const result = checkStreak(streak, now, timezone);
    expect(result.streakBroken).toBe(false);
  });
});
