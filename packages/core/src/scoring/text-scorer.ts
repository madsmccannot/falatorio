import { normalizeForComparison } from "./phonetic-rules-pteu.js";
import type { CognitiveLevel } from "../constants.js";

export interface PunctuationWarning {
  type: "missing_accent" | "missing_punctuation";
  message: string;
}

export interface TextScoreResult {
  correct: boolean;
  score: number;
  matchedAnswer: string | null;
  feedback: "correct" | "close" | "incorrect";
  warnings: PunctuationWarning[];
}

interface Thresholds {
  correct: number;
  close: number;
}

const COGNITIVE_THRESHOLDS: Record<CognitiveLevel, Thresholds> = {
  recognition: { correct: 0.95, close: 0.7 },
  comprehension: { correct: 0.95, close: 0.7 },
  controlled_production: { correct: 0.90, close: 0.65 },
  transformation: { correct: 0.90, close: 0.65 },
  translation: { correct: 0.90, close: 0.65 },
  free_production: { correct: 0.85, close: 0.55 },
  communication: { correct: 0.85, close: 0.55 },
};

const DEFAULT_THRESHOLDS: Thresholds = { correct: 0.95, close: 0.7 };

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

function stripPunctuation(text: string): string {
  return text.replace(/[.,;:!?¡¿\-—""''«»()[\]{}…]/g, "").replace(/\s+/g, " ").trim();
}

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
}

function detectPunctuationWarnings(userAnswer: string, matchedAnswer: string): PunctuationWarning[] {
  const warnings: PunctuationWarning[] = [];

  const userStripped = stripAccents(userAnswer.toLowerCase());
  const matchedStripped = stripAccents(matchedAnswer.toLowerCase());
  const userNorm = userAnswer.toLowerCase();
  const matchedNorm = matchedAnswer.toLowerCase();

  if (userStripped === matchedStripped && userNorm !== matchedNorm) {
    warnings.push({
      type: "missing_accent",
      message: "Watch out for accents - they can change meaning in Portuguese (e.g. avo/avo, la/la).",
    });
  }

  const userNoPunct = stripPunctuation(userAnswer);
  const matchedNoPunct = stripPunctuation(matchedAnswer);
  if (userNoPunct.toLowerCase() === matchedNoPunct.toLowerCase() && userAnswer.trim() !== matchedAnswer.trim()) {
    const hasMissingAccent = warnings.length > 0;
    if (!hasMissingAccent) {
      warnings.push({
        type: "missing_punctuation",
        message: "Pay attention to punctuation - it helps clarify meaning.",
      });
    }
  }

  return warnings;
}

export function scoreTextAnswer(
  userAnswer: string,
  acceptedAnswers: readonly string[],
  cognitiveLevel?: CognitiveLevel,
): TextScoreResult {
  if (acceptedAnswers.length === 0) {
    return { correct: false, score: 0, matchedAnswer: null, feedback: "incorrect", warnings: [] };
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

  const thresholds = cognitiveLevel
    ? COGNITIVE_THRESHOLDS[cognitiveLevel]
    : DEFAULT_THRESHOLDS;

  let correct = bestScore >= thresholds.correct;
  const close = bestScore >= thresholds.close;
  let warnings: PunctuationWarning[] = [];

  if (!correct && bestMatch) {
    const userNoPunct = stripPunctuation(userAnswer).toLowerCase();
    const matchNoPunct = stripPunctuation(bestMatch).toLowerCase();
    const userNoAccent = stripAccents(userNoPunct);
    const matchNoAccent = stripAccents(matchNoPunct);

    if (userNoAccent === matchNoAccent) {
      correct = true;
      bestScore = 1;

      if (userNoPunct !== matchNoPunct) {
        warnings.push({
          type: "missing_accent",
          message: "Watch out for accents - they can change meaning in Portuguese (e.g. avo/avo, la/la).",
        });
      }

      if (stripPunctuation(userAnswer.trim()) !== stripPunctuation(bestMatch.trim()) ||
          userAnswer.trim().length !== bestMatch.trim().length) {
        const hasAccentWarning = warnings.some(w => w.type === "missing_accent");
        if (!hasAccentWarning) {
          warnings.push({
            type: "missing_punctuation",
            message: "Pay attention to punctuation - it helps clarify meaning.",
          });
        }
      }
    }
  }

  if (correct && bestMatch && warnings.length === 0) {
    warnings = detectPunctuationWarnings(userAnswer, bestMatch);
  }

  return {
    correct,
    score: bestScore,
    matchedAnswer: bestMatch,
    feedback: correct ? "correct" : close ? "close" : "incorrect",
    warnings,
  };
}
