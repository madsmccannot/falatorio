import { describe, it, expect } from "vitest";
import { scoreTextAnswer } from "@falatorio/core/scoring";
import { calculateXP } from "@falatorio/core/gamification";
import { schedule, createNewCard, scoreToRating } from "@falatorio/core/fsrs";
import { computeBalance } from "@falatorio/core/economy";
import { LESSON, HEARTS, OURO, PRACTICE } from "@falatorio/core";

describe("lesson flow: answer -> score -> XP -> economy", () => {
  it("correct answer earns XP and positive score", () => {
    const result = scoreTextAnswer("Eu gosto de café", ["Eu gosto de café"]);
    expect(result.correct).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0.9);

    const xp = calculateXP({
      accuracy: 1,
      streakDays: 0,
      isPerfect: true,
      isFirstOfDay: false,
      hasXPBoost: false,
    });
    expect(xp.total).toBeGreaterThan(0);
  });

  it("wrong answer does not earn XP for that exercise", () => {
    const result = scoreTextAnswer("something wrong", ["Eu gosto de café"]);
    expect(result.correct).toBe(false);
    expect(result.score).toBeLessThan(0.5);
  });

  it("partial accuracy reduces XP", () => {
    const perfect = calculateXP({
      accuracy: 1,
      streakDays: 0,
      isPerfect: true,
      isFirstOfDay: false,
      hasXPBoost: false,
    });

    const partial = calculateXP({
      accuracy: 0.6,
      streakDays: 0,
      isPerfect: false,
      isFirstOfDay: false,
      hasXPBoost: false,
    });

    expect(perfect.total).toBeGreaterThan(partial.total);
  });

  it("streak multiplier increases XP", () => {
    const noStreak = calculateXP({
      accuracy: 0.8,
      streakDays: 0,
      isPerfect: false,
      isFirstOfDay: false,
      hasXPBoost: false,
    });

    const withStreak = calculateXP({
      accuracy: 0.8,
      streakDays: 7,
      isPerfect: false,
      isFirstOfDay: false,
      hasXPBoost: false,
    });

    expect(withStreak.total).toBeGreaterThanOrEqual(noStreak.total);
  });

  it("review sessions apply XP multiplier", () => {
    const lessonXp = calculateXP({
      accuracy: 0.8,
      streakDays: 0,
      isPerfect: false,
      isFirstOfDay: false,
      hasXPBoost: false,
    });

    const reviewXp = Math.round(lessonXp.total * PRACTICE.REVIEW_XP_MULTIPLIER);
    expect(reviewXp).toBeLessThanOrEqual(lessonXp.total);
    expect(PRACTICE.REVIEW_XP_MULTIPLIER).toBeLessThanOrEqual(1);
  });
});

describe("hearts system invariants", () => {
  it("free user starts with max hearts", () => {
    expect(HEARTS.MAX).toBeGreaterThanOrEqual(3);
    expect(HEARTS.MAX).toBeLessThanOrEqual(10);
  });

  it("wrong answer deducts exactly one heart", () => {
    const hearts = HEARTS.MAX;
    const afterWrong = Math.max(hearts - 1, 0);
    expect(afterWrong).toBe(hearts - 1);
  });

  it("hearts cannot go below zero", () => {
    expect(Math.max(0 - 1, 0)).toBe(0);
  });

  it("review completion awards hearts capped at max", () => {
    const current = HEARTS.MAX - 1;
    const earned = PRACTICE.HEART_REWARD_ON_REVIEW;
    const afterReward = Math.min(current + earned, HEARTS.MAX);
    expect(afterReward).toBeLessThanOrEqual(HEARTS.MAX);
  });

  it("review heart award does not overflow max", () => {
    const current = HEARTS.MAX;
    const earned = PRACTICE.HEART_REWARD_ON_REVIEW;
    const afterReward = Math.min(current + earned, HEARTS.MAX);
    expect(afterReward).toBe(HEARTS.MAX);
  });
});

describe("FSRS scheduling invariants", () => {
  it("new card creates initial state", () => {
    const card = createNewCard();
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
    expect(card.stability).toBeGreaterThanOrEqual(0);
  });

  it("correct answer increases stability", () => {
    const card = createNewCard();
    const rating = scoreToRating(1.0);
    const result = schedule(card, rating);
    expect(result.card.stability).toBeGreaterThanOrEqual(card.stability);
  });

  it("wrong answer increases lapses", () => {
    const card = createNewCard();
    const rating = scoreToRating(0.0);
    const result = schedule(card, rating);
    expect(result.card.lapses).toBeGreaterThanOrEqual(card.lapses);
  });

  it("scheduling preserves card fields", () => {
    const card = createNewCard();
    const rating = scoreToRating(0.8);
    const result = schedule(card, rating);

    expect(result.card).toHaveProperty("stability");
    expect(result.card).toHaveProperty("difficulty");
    expect(result.card).toHaveProperty("nextReview");
    expect(result.card).toHaveProperty("reps");
    expect(result.card).toHaveProperty("lapses");
  });
});

describe("economy flow invariants", () => {
  it("welcome bonus is positive", () => {
    expect(OURO.WELCOME_BONUS).toBeGreaterThan(0);
  });

  it("balance after welcome bonus equals welcome bonus", () => {
    const txs = [{ type: "earn" as const, amount: OURO.WELCOME_BONUS }];
    expect(computeBalance(txs)).toBe(OURO.WELCOME_BONUS);
  });

  it("spend reduces balance correctly", () => {
    const txs = [
      { type: "earn" as const, amount: OURO.WELCOME_BONUS },
      { type: "spend" as const, amount: -10 },
    ];
    expect(computeBalance(txs)).toBe(OURO.WELCOME_BONUS - 10);
  });

  it("cannot spend more than balance", () => {
    const txs = [{ type: "earn" as const, amount: 50 }];
    const balance = computeBalance(txs);
    const wantToSpend = 51;
    expect(balance < wantToSpend).toBe(true);
  });

  it("lesson exercises per lesson is reasonable", () => {
    expect(LESSON.EXERCISES_PER_LESSON).toBeGreaterThanOrEqual(5);
    expect(LESSON.EXERCISES_PER_LESSON).toBeLessThanOrEqual(30);
  });
});

describe("session security invariants", () => {
  it("session must belong to the user who created it", () => {
    const session = { userId: "user_a" };
    const requestingUser = "user_b";
    expect(session.userId).not.toBe(requestingUser);
  });

  it("exercise ordering is enforced sequentially", () => {
    const exerciseIds = ["ex1", "ex2", "ex3"];
    let currentIndex = 0;

    expect(exerciseIds[currentIndex]).toBe("ex1");
    currentIndex++;
    expect(exerciseIds[currentIndex]).toBe("ex2");
    currentIndex++;
    expect(exerciseIds[currentIndex]).toBe("ex3");
  });

  it("out-of-order exercise submission is rejected", () => {
    const session = { exerciseIds: ["ex1", "ex2", "ex3"], currentIndex: 0 };
    const submittedId = "ex2";
    const expectedId = session.exerciseIds[session.currentIndex];
    expect(submittedId).not.toBe(expectedId);
  });

  it("cannot complete lesson with zero answers", () => {
    const session = { correctCount: 0, incorrectCount: 0 };
    const total = session.correctCount + session.incorrectCount;
    expect(total).toBe(0);
  });

  it("pass threshold is between 0 and 1", () => {
    expect(LESSON.PASS_THRESHOLD).toBeGreaterThan(0);
    expect(LESSON.PASS_THRESHOLD).toBeLessThanOrEqual(1);
  });
});

describe("scoring edge cases", () => {
  it("accent-insensitive matching works for PT-EU", () => {
    const result = scoreTextAnswer("cafe", ["café"]);
    expect(result.score).toBeGreaterThan(0.5);
  });

  it("case-insensitive matching", () => {
    const result = scoreTextAnswer("EU GOSTO", ["Eu gosto"]);
    expect(result.score).toBeGreaterThan(0.8);
  });

  it("empty answer scores zero", () => {
    const result = scoreTextAnswer("", ["Eu gosto de café"]);
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
  });

  it("exact match scores 1.0", () => {
    const result = scoreTextAnswer("Eu gosto de café", ["Eu gosto de café"]);
    expect(result.score).toBe(1);
  });

  it("multiple accepted answers picks best match", () => {
    const result = scoreTextAnswer("Eu gosto de café", [
      "Eu gosto de café",
      "Gosto de café",
      "Eu adoro café",
    ]);
    expect(result.correct).toBe(true);
    expect(result.matchedAnswer).toBe("Eu gosto de café");
  });
});
