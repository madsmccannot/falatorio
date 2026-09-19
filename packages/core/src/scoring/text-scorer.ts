import { normalizeForComparison } from "./phonetic-rules-pteu.js";

export interface TextScoreResult {
  correct: boolean;
  score: number;
  matchedAnswer: string | null;
  feedback: "correct" | "close" | "incorrect";
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }

  return dp[m]![n]!;
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

export function scoreTextAnswer(
  userAnswer: string,
  acceptedAnswers: readonly string[],
): TextScoreResult {
  if (acceptedAnswers.length === 0) {
    return { correct: false, score: 0, matchedAnswer: null, feedback: "incorrect" };
  }

  const normalizedUser = normalizeForComparison(userAnswer);

  let bestScore = 0;
  let bestMatch: string | null = null;

  for (const accepted of acceptedAnswers) {
    const normalizedAccepted = normalizeForComparison(accepted);
    const sim = similarity(normalizedUser, normalizedAccepted);
    if (sim > bestScore) {
      bestScore = sim;
      bestMatch = accepted;
    }
  }

  const correct = bestScore >= 0.95;
  const close = bestScore >= 0.7;

  return {
    correct,
    score: bestScore,
    matchedAnswer: bestMatch,
    feedback: correct ? "correct" : close ? "close" : "incorrect",
  };
}
