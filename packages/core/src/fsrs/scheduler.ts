import type { FSRSCard, FSRSParams, FSRSRating, ReviewLog } from "./types.js";
import { DEFAULT_FSRS_PARAMS } from "./types.js";
import { ratingToIndex } from "./rating.js";

function clampDifficulty(d: number): number {
  return Math.max(1, Math.min(10, d));
}

function initDifficulty(params: FSRSParams, rating: FSRSRating): number {
  const g = ratingToIndex(rating);
  return clampDifficulty(params.w[4]! - Math.exp(params.w[5]! * (g - 1)) + 1);
}

function initStability(params: FSRSParams, rating: FSRSRating): number {
  const g = ratingToIndex(rating);
  return Math.max(0.1, params.w[g]!);
}

function nextDifficulty(
  params: FSRSParams,
  d: number,
  rating: FSRSRating,
): number {
  const g = ratingToIndex(rating);
  const newD = d - params.w[6]! * (g - 3);
  const meanReverted = params.w[7]! * initDifficulty(params, "easy") + (1 - params.w[7]!) * newD;
  return clampDifficulty(meanReverted);
}

function nextRecallStability(
  params: FSRSParams,
  d: number,
  s: number,
  r: number,
  rating: FSRSRating,
): number {
  const hardPenalty = rating === "hard" ? params.w[15]! : 1;
  const easyBonus = rating === "easy" ? params.w[16]! : 1;
  return (
    s *
    (1 +
      Math.exp(params.w[8]!) *
        (11 - d) *
        Math.pow(s, -params.w[9]!) *
        (Math.exp((1 - r) * params.w[10]!) - 1) *
        hardPenalty *
        easyBonus)
  );
}

function nextForgetStability(
  params: FSRSParams,
  d: number,
  s: number,
  r: number,
): number {
  return (
    params.w[11]! *
    Math.pow(d, -params.w[12]!) *
    (Math.pow(s + 1, params.w[13]!) - 1) *
    Math.exp((1 - r) * params.w[14]!)
  );
}

function intervalFromStability(
  s: number,
  requestRetention: number,
  maximumInterval: number,
): number {
  const interval = (s / 0.9) * (Math.pow(requestRetention, 1 / -0.5) - 1);
  return Math.min(Math.max(1, Math.round(interval)), maximumInterval);
}

function forgettingCurve(elapsedDays: number, stability: number): number {
  return Math.pow(1 + (0.9 * elapsedDays) / stability, -0.5);
}

export function schedule(
  card: FSRSCard,
  rating: FSRSRating,
  now: Date = new Date(),
  params: FSRSParams = DEFAULT_FSRS_PARAMS,
): { card: FSRSCard; log: Omit<ReviewLog, "exerciseId"> } {
  const isNew = card.reps === 0;

  let newStability: number;
  let newDifficulty: number;
  let newLapses = card.lapses;

  if (isNew) {
    newDifficulty = initDifficulty(params, rating);
    newStability = initStability(params, rating);
    if (rating === "again") {
      newLapses += 1;
    }
  } else {
    const elapsedDays = Math.max(
      0,
      (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24),
    );
    const retrievability = forgettingCurve(elapsedDays, card.stability);
    newDifficulty = nextDifficulty(params, card.difficulty, rating);

    if (rating === "again") {
      newStability = nextForgetStability(
        params, card.difficulty, card.stability, retrievability,
      );
      newLapses += 1;
    } else {
      newStability = nextRecallStability(
        params, card.difficulty, card.stability, retrievability, rating,
      );
    }
  }

  newStability = Math.max(0.1, newStability);

  const scheduledDays = rating === "again"
    ? 1
    : intervalFromStability(newStability, params.requestRetention, params.maximumInterval);

  const nextReview = new Date(now.getTime() + scheduledDays * 24 * 60 * 60 * 1000);

  const updatedCard: FSRSCard = {
    stability: newStability,
    difficulty: newDifficulty,
    lastReview: now,
    nextReview,
    reps: card.reps + 1,
    lapses: newLapses,
  };

  const log: Omit<ReviewLog, "exerciseId"> = {
    rating,
    score: 0,
    reviewedAt: now,
    previousStability: card.stability,
    newStability,
    previousDifficulty: card.difficulty,
    newDifficulty,
    scheduledDays,
  };

  return { card: updatedCard, log };
}

export function isDue(card: FSRSCard, now: Date = new Date()): boolean {
  return now >= card.nextReview;
}

export function getRetrievability(card: FSRSCard, now: Date = new Date()): number {
  if (card.reps === 0) return 0;
  const elapsedDays = Math.max(
    0,
    (now.getTime() - card.lastReview.getTime()) / (1000 * 60 * 60 * 24),
  );
  return forgettingCurve(elapsedDays, card.stability);
}
