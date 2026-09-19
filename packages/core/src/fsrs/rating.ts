import type { FSRSRating } from "./types.js";

const THRESHOLDS: readonly { max: number; rating: FSRSRating }[] = [
  { max: 0.3, rating: "again" },
  { max: 0.6, rating: "hard" },
  { max: 0.9, rating: "good" },
  { max: Infinity, rating: "easy" },
];

export function scoreToRating(score: number): FSRSRating {
  const clamped = Math.max(0, Math.min(1, score));
  const match = THRESHOLDS.find((t) => clamped < t.max);
  return match?.rating ?? "easy";
}

export function ratingToIndex(rating: FSRSRating): number {
  switch (rating) {
    case "again": return 0;
    case "hard": return 1;
    case "good": return 2;
    case "easy": return 3;
  }
}
