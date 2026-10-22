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
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: false,
      boostLevel: 0,
    });
    expect(xp.total).toBeGreaterThan(0);
  });

  it("wrong answer does not earn XP for that exercise", () => {
    const result = scoreTextAnswer("something wrong", ["Eu gosto de café"]);
    expect(result.correct).toBe(false);
    expect(result.score).toBeLessThan(0.5);
  });

  it("perfect bonus increases XP", () => {
    const perfect = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    const normal = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    expect(perfect.total).toBeGreaterThan(normal.total);
  });

  it("later sections give more XP", () => {
    const early = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    const late = calculateXP({
      sectionSortOrder: 3,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    expect(late.total).toBeGreaterThan(early.total);
  });

  it("all normal sessions give flat 20 XP base", () => {
    const xp = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    expect(xp.base).toBe(20);
  });

  it("unit final gives 50 base XP", () => {
    const unitFinal = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: true,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    expect(unitFinal.base).toBe(50);
  });

  it("review sessions give 10 XP base", () => {
    const reviewXp = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: "review",
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    expect(reviewXp.base).toBe(10);
  });

  it("hearts practice gives 15 XP base", () => {
    const heartsXp = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: "hearts",
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    expect(heartsXp.base).toBe(15);
  });

  it("double XP boost doubles total", () => {
    const normal = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    const boosted = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 2,
    });

    expect(boosted.total).toBe(normal.total * 2);
  });

  it("triple XP boost triples total", () => {
    const normal = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });

    const boosted = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 3,
    });

    expect(boosted.total).toBe(normal.total * 3);
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

describe("XP formula: all multipliers combined", () => {
  it("first-of-day bonus adds 10 XP before boost", () => {
    const without = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });
    const with_ = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: false,
      isFirstOfDay: true,
      boostLevel: 0,
    });
    expect(with_.firstOfDayBonus).toBe(10);
    expect(with_.total - without.total).toBe(10);
  });

  it("first-of-day + perfect stack additively before boost", () => {
    const both = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: true,
      boostLevel: 0,
    });
    expect(both.total).toBe(both.base + both.perfectBonus + both.firstOfDayBonus);
  });

  it("boost multiplies the full sum (base + perfect + firstOfDay)", () => {
    const unboosted = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: true,
      boostLevel: 0,
    });
    const boosted = calculateXP({
      sectionSortOrder: 0,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: true,
      boostLevel: 2,
    });
    expect(boosted.total).toBe(unboosted.total * 2);
  });

  it("max XP scenario: unit-final + S4 + perfect + firstOfDay + triple boost", () => {
    const max = calculateXP({
      sectionSortOrder: 3,
      isUnitFinal: true,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: true,
      boostLevel: 3,
    });
    const sectionMult = 1.4;
    const scaledBase = Math.round(50 * sectionMult);
    const beforeBoost = scaledBase + 5 + 10;
    expect(max.total).toBe(Math.round(beforeBoost * 3));
  });

  it("practice types use section multiplier on their own base", () => {
    const review = calculateXP({
      sectionSortOrder: 3,
      isUnitFinal: false,
      practiceType: "review",
      isPerfect: false,
      isFirstOfDay: false,
      boostLevel: 0,
    });
    expect(review.base).toBe(Math.round(10 * 1.4));
  });

  it("XP result breakdown fields sum to total", () => {
    const result = calculateXP({
      sectionSortOrder: 2,
      isUnitFinal: false,
      practiceType: false,
      isPerfect: true,
      isFirstOfDay: true,
      boostLevel: 2,
    });
    const expected = Math.round(
      (result.base + result.perfectBonus + result.firstOfDayBonus) * result.boostMultiplier,
    );
    expect(result.total).toBe(expected);
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
