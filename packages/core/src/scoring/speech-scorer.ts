import { normalizeForComparison } from "./phonetic-rules-pteu.js";
import type { L1Code, CognitiveLevel } from "../constants.js";

export interface SpeechScoreResult {
  correct: boolean;
  score: number;
  transcription: string;
  feedback: "correct" | "close" | "incorrect";
  l1Tip: string | null;
}

interface Thresholds {
  correct: number;
  close: number;
}

const COGNITIVE_THRESHOLDS: Record<CognitiveLevel, Thresholds> = {
  recognition: { correct: 0.85, close: 0.5 },
  comprehension: { correct: 0.85, close: 0.5 },
  controlled_production: { correct: 0.80, close: 0.45 },
  transformation: { correct: 0.80, close: 0.45 },
  translation: { correct: 0.80, close: 0.45 },
  free_production: { correct: 0.75, close: 0.40 },
  communication: { correct: 0.75, close: 0.40 },
};

const DEFAULT_THRESHOLDS: Thresholds = { correct: 0.85, close: 0.5 };

interface L1PhoneticTip {
  pattern: RegExp;
  tip: string;
}

const L1_TIPS: Partial<Record<L1Code, readonly L1PhoneticTip[]>> = {
  es: [
    { pattern: /ão/, tip: "The nasal -ão doesn't exist in Spanish — it's not -an or -on." },
    { pattern: /v/, tip: "In PT-EU, v and b are distinct sounds, unlike in Spanish." },
  ],
  hi: [
    { pattern: /ão/, tip: "Think of -ão as a nasal vowel — Hindi doesn't have this, but try nasalizing the a." },
    { pattern: /lh/, tip: "The lh sound is close to the Hindi ल्य (lya) — tongue on the palate." },
  ],
  ar: [
    { pattern: /[aeiou]/, tip: "PT-EU has many vowel sounds — Arabic has only three, so pay extra attention." },
    { pattern: /r/, tip: "Initial R in PT-EU is uvular /ʁ/, similar to the Arabic غ (ghain)." },
  ],
  zh: [
    { pattern: /r/, tip: "The PT-EU R is not like Mandarin r — it's a back-of-throat sound." },
    { pattern: /[áéíóú]/, tip: "Stress is phonemic in PT-EU, not tonal — the accent marks show stress, not tone." },
  ],
  fr: [
    { pattern: /ão/, tip: "Similar to French nasals but with a diphthong — -ão has a glide, unlike -on." },
  ],
  ur: [
    { pattern: /ão/, tip: "Nasalize the -ão like Urdu nasal vowels — but add a diphthong." },
    { pattern: /lh/, tip: "The lh sound is close to the Urdu لی — tongue touches the palate." },
  ],
  bn: [
    { pattern: /ão/, tip: "Think of -ão as combining a nasal with a glide — similar to Bengali nasalized vowels but stronger." },
    { pattern: /r/, tip: "Initial R in PT-EU is uvular, not the flapped r of Bengali." },
  ],
};

function getL1Tip(expected: string, l1: L1Code): string | null {
  const tips = L1_TIPS[l1];
  if (!tips) return null;

  for (const tip of tips) {
    if (tip.pattern.test(expected)) {
      return tip.tip;
    }
  }
  return null;
}

export function scoreSpeechAnswer(
  transcription: string,
  expected: string,
  l1: L1Code,
  cognitiveLevel?: CognitiveLevel,
): SpeechScoreResult {
  const normTranscription = normalizeForComparison(transcription);
  const normExpected = normalizeForComparison(expected);

  const words = normExpected.split(" ");
  const spokenWords = normTranscription.split(" ");
  let matched = 0;

  for (const word of words) {
    if (spokenWords.includes(word)) {
      matched++;
    }
  }

  const score = words.length > 0 ? matched / words.length : 0;

  const thresholds = cognitiveLevel
    ? COGNITIVE_THRESHOLDS[cognitiveLevel]
    : DEFAULT_THRESHOLDS;

  const correct = score >= thresholds.correct;
  const close = score >= thresholds.close;

  return {
    correct,
    score,
    transcription,
    feedback: correct ? "correct" : close ? "close" : "incorrect",
    l1Tip: correct ? null : getL1Tip(expected, l1),
  };
}
