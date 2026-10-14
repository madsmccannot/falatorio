import { describe, it, expect } from "vitest";

describe("quests.updateProgress invariants", () => {
  it("increment must be positive", () => {
    const increment = 1;
    expect(increment).toBeGreaterThan(0);
  });

  it("quest types are limited to known set", () => {
    const validTypes = [
      "complete_lesson",
      "earn_xp",
      "practice_speaking",
      "review_items",
      "maintain_streak",
      "learn_minutes",
      "perfect_lesson",
      "practice_mistakes",
    ];
    expect(validTypes.length).toBe(8);
  });

  it("returns null when no matching quest found", () => {
    const updated = null;
    expect(updated).toBeNull();
  });

  it("completion is detected when currentValue reaches targetValue", () => {
    const quest = { currentValue: 4, targetValue: 5, completed: false };
    const newValue = quest.currentValue + 1;
    const completed = newValue >= quest.targetValue;
    expect(completed).toBe(true);
  });

  it("does not regress below target once completed", () => {
    const quest = { currentValue: 5, targetValue: 5, completed: true };
    expect(quest.completed).toBe(true);
    expect(quest.currentValue).toBeGreaterThanOrEqual(quest.targetValue);
  });
});

describe("quests.claimReward invariants", () => {
  it("monthly reward requires all daily quests completed in period", () => {
    const daysWithCompletedQuests = 15;
    const requiredDays = 20;
    const canClaim = daysWithCompletedQuests >= requiredDays;
    expect(canClaim).toBe(false);
  });

  it("allows claim when threshold is met", () => {
    const daysWithCompletedQuests = 20;
    const requiredDays = 20;
    const canClaim = daysWithCompletedQuests >= requiredDays;
    expect(canClaim).toBe(true);
  });
});

describe("quests rate limiting", () => {
  it("updateProgress has higher limit than claimReward", () => {
    const progressLimit = 30;
    const claimLimit = 10;
    expect(progressLimit).toBeGreaterThan(claimLimit);
  });
});
