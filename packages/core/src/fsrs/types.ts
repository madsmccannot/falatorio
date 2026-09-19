export const FSRS_RATINGS = ["again", "hard", "good", "easy"] as const;
export type FSRSRating = (typeof FSRS_RATINGS)[number];

export interface FSRSCard {
  stability: number;
  difficulty: number;
  lastReview: Date;
  nextReview: Date;
  reps: number;
  lapses: number;
}

export interface ReviewLog {
  exerciseId: string;
  rating: FSRSRating;
  score: number;
  reviewedAt: Date;
  previousStability: number;
  newStability: number;
  previousDifficulty: number;
  newDifficulty: number;
  scheduledDays: number;
}

export interface FSRSParams {
  requestRetention: number;
  maximumInterval: number;
  w: readonly number[];
}

export const DEFAULT_FSRS_PARAMS: FSRSParams = {
  requestRetention: 0.9,
  maximumInterval: 365,
  w: [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01,
    1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61,
  ],
};

export function createNewCard(): FSRSCard {
  const now = new Date();
  return {
    stability: 0,
    difficulty: 0,
    lastReview: now,
    nextReview: now,
    reps: 0,
    lapses: 0,
  };
}
