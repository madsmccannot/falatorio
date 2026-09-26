import type { CognitiveLevel, CEFRLevel, L1Code, ExerciseType } from "../constants.js";
import { EXERCISE_COGNITIVE_MAP } from "../constants.js";
import type { MasteryScore } from "../mastery/types.js";
import type { ErrorPattern } from "./error-engine.js";

export interface DifficultyProfile {
  targetDifficulty: number;
  allowedCognitiveLevels: CognitiveLevel[];
  maxCognitiveLevel: CognitiveLevel;
  comprehensionRatio: number;
  productionRatio: number;
  exerciseTypeWeights: Partial<Record<ExerciseType, number>>;
}

export interface DifficultyInput {
  mastery: MasteryScore;
  cefrLevel: CEFRLevel;
  l1: L1Code;
  errorPatterns: ErrorPattern[];
  recentAccuracy: number;
  sessionPosition: number;
}

const COGNITIVE_LADDER: CognitiveLevel[] = [
  "recognition",
  "comprehension",
  "controlled_production",
  "transformation",
  "translation",
  "free_production",
  "communication",
];

const CEFR_DIFFICULTY_FLOOR: Record<CEFRLevel, number> = {
  A1: 0.1,
  A2: 0.2,
  B1: 0.35,
  B2: 0.5,
  C1: 0.65,
  C2: 0.8,
};

const CEFR_MAX_COGNITIVE: Record<CEFRLevel, number> = {
  A1: 2,
  A2: 3,
  B1: 4,
  B2: 5,
  C1: 6,
  C2: 6,
};

export function computeDifficulty(input: DifficultyInput): DifficultyProfile {
  const { mastery, cefrLevel, errorPatterns, recentAccuracy, sessionPosition } = input;

  const floor = CEFR_DIFFICULTY_FLOOR[cefrLevel];
  const maxCogIdx = CEFR_MAX_COGNITIVE[cefrLevel];

  let baseDifficulty = mastery.mastery * 0.6 + mastery.confidence * 0.2 + floor * 0.2;

  const hasHighErrors = errorPatterns.some(
    (p) => p.severity === "high" || p.severity === "critical",
  );
  if (hasHighErrors) {
    baseDifficulty *= 0.7;
  }

  if (recentAccuracy < 0.5) {
    baseDifficulty *= 0.8;
  } else if (recentAccuracy > 0.9 && mastery.confidence > 0.6) {
    baseDifficulty = Math.min(baseDifficulty * 1.15, 1);
  }

  if (sessionPosition <= 2) {
    baseDifficulty *= 0.85;
  }

  const targetDifficulty = Math.max(floor, Math.min(baseDifficulty, 1));

  let effectiveMaxIdx = maxCogIdx;
  if (mastery.mastery < 0.4) {
    effectiveMaxIdx = Math.min(effectiveMaxIdx, 2);
  } else if (mastery.mastery < 0.6) {
    effectiveMaxIdx = Math.min(effectiveMaxIdx, 3);
  }

  if (hasHighErrors) {
    effectiveMaxIdx = Math.max(0, effectiveMaxIdx - 1);
  }

  const allowedCognitiveLevels = COGNITIVE_LADDER.slice(0, effectiveMaxIdx + 1);
  const maxCognitiveLevel = COGNITIVE_LADDER[effectiveMaxIdx]!;

  const comprehensionRatio = mastery.mastery < 0.5 ? 0.7 : mastery.mastery < 0.7 ? 0.5 : 0.3;
  const productionRatio = 1 - comprehensionRatio;

  const exerciseTypeWeights = buildExerciseWeights(
    allowedCognitiveLevels,
    comprehensionRatio,
    productionRatio,
    mastery.productionScore,
  );

  return {
    targetDifficulty,
    allowedCognitiveLevels,
    maxCognitiveLevel,
    comprehensionRatio,
    productionRatio,
    exerciseTypeWeights,
  };
}

function buildExerciseWeights(
  allowedLevels: CognitiveLevel[],
  comprehensionRatio: number,
  productionRatio: number,
  currentProductionScore: number,
): Partial<Record<ExerciseType, number>> {
  const allowed = new Set(allowedLevels);
  const weights: Partial<Record<ExerciseType, number>> = {};

  const comprehensionTypes: ExerciseType[] = ["pick_correct", "match_pairs", "listen_and_type"];
  const productionTypes: ExerciseType[] = [
    "fill_blank",
    "reorder_words",
    "translate_l1_to_pt",
    "translate_pt_to_l1",
    "speak_and_score",
  ];

  for (const et of comprehensionTypes) {
    const level = EXERCISE_COGNITIVE_MAP[et];
    if (allowed.has(level)) {
      weights[et] = comprehensionRatio / comprehensionTypes.length;
    }
  }

  const needsMoreProduction = currentProductionScore < 0.3;
  const productionBoost = needsMoreProduction ? 1.3 : 1.0;

  for (const et of productionTypes) {
    const level = EXERCISE_COGNITIVE_MAP[et];
    if (allowed.has(level)) {
      weights[et] = (productionRatio / productionTypes.length) * productionBoost;
    }
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const key of Object.keys(weights) as ExerciseType[]) {
      weights[key] = weights[key]! / total;
    }
  }

  return weights;
}

export function selectCognitiveLevel(
  profile: DifficultyProfile,
  rng: () => number = Math.random,
): CognitiveLevel {
  const levels = profile.allowedCognitiveLevels;
  if (levels.length === 0) return "recognition";

  const r = rng();
  if (r < profile.comprehensionRatio) {
    const compLevels = levels.filter(
      (l) => COGNITIVE_LADDER.indexOf(l) <= 1,
    );
    return compLevels.length > 0
      ? compLevels[Math.floor(rng() * compLevels.length)]!
      : levels[0]!;
  }

  const prodLevels = levels.filter(
    (l) => COGNITIVE_LADDER.indexOf(l) >= 2,
  );
  return prodLevels.length > 0
    ? prodLevels[Math.floor(rng() * prodLevels.length)]!
    : levels[levels.length - 1]!;
}
