import { LESSON } from "../constants.js";
import type { CognitiveLevel, CEFRLevel, L1Code } from "../constants.js";
import type { ExerciseItem } from "./session-state.js";
import type { FSRSCard } from "../fsrs/types.js";
import type { MasteryScore } from "../mastery/types.js";
import type { ErrorPattern, ErrorEscalation } from "./error-engine.js";
import type { DifficultyProfile } from "./difficulty-controller.js";
import { isDue, getRetrievability } from "../fsrs/scheduler.js";
import { escalate } from "./error-engine.js";
import { computeDifficulty } from "./difficulty-controller.js";

export interface CandidateExercise {
  id: string;
  type: ExerciseItem["type"];
  isCultural: boolean;
  fsrsCard: FSRSCard | null;
  knowledgeItemIds?: string[];
  cognitiveLevel?: CognitiveLevel;
  difficulty?: number;
}

export interface SelectionConfig {
  totalCount: number;
  newRatio: number;
  reviewRatio: number;
  culturalItemsMax: number;
}

export interface AdaptiveSelectionInput {
  newExercises: readonly CandidateExercise[];
  reviewCandidates: readonly CandidateExercise[];
  culturalExercises: readonly CandidateExercise[];
  mastery: MasteryScore | null;
  errorPatterns: ErrorPattern[];
  cefrLevel: CEFRLevel;
  l1: L1Code;
  recentAccuracy: number;
  sessionPosition?: number;
  prerequisitesUnlocked?: Set<string>;
  now?: Date;
  config?: SelectionConfig;
}

const DEFAULT_CONFIG: SelectionConfig = {
  totalCount: LESSON.EXERCISES_PER_LESSON,
  newRatio: LESSON.NEW_RATIO,
  reviewRatio: LESSON.REVIEW_RATIO,
  culturalItemsMax: LESSON.CULTURAL_ITEMS_PER_SESSION,
};

export function selectExercises(
  newExercises: readonly CandidateExercise[],
  reviewCandidates: readonly CandidateExercise[],
  culturalExercises: readonly CandidateExercise[],
  now: Date = new Date(),
  config: SelectionConfig = DEFAULT_CONFIG,
): ExerciseItem[] {
  return selectAdaptive({
    newExercises,
    reviewCandidates,
    culturalExercises,
    mastery: null,
    errorPatterns: [],
    cefrLevel: "A1",
    l1: "en",
    recentAccuracy: 0.8,
    now,
    config,
  });
}

export function selectAdaptive(input: AdaptiveSelectionInput): ExerciseItem[] {
  const {
    newExercises,
    reviewCandidates,
    culturalExercises,
    mastery,
    errorPatterns,
    cefrLevel,
    l1,
    recentAccuracy,
    sessionPosition = 0,
    prerequisitesUnlocked,
    now = new Date(),
    config = DEFAULT_CONFIG,
  } = input;

  const escalations = escalate(errorPatterns);

  const diffProfile = mastery
    ? computeDifficulty({
        mastery,
        cefrLevel,
        l1,
        errorPatterns,
        recentAccuracy,
        sessionPosition,
      })
    : null;

  const weaknessSlots = Math.min(
    Math.ceil(config.totalCount * 0.2),
    escalations.length,
  );
  const reviewSlots = Math.floor(
    (config.totalCount - weaknessSlots) * config.reviewRatio,
  );
  const newSlots = config.totalCount - weaknessSlots - reviewSlots;

  const weaknessExercises = selectWeaknessExercises(
    [...newExercises, ...reviewCandidates],
    escalations,
    weaknessSlots,
    diffProfile,
  );
  const usedIds = new Set(weaknessExercises.map((e) => e.id));

  const dueForReview = reviewCandidates
    .filter((c) => !usedIds.has(c.id) && c.fsrsCard !== null && isDue(c.fsrsCard, now))
    .sort((a, b) => {
      const retA = a.fsrsCard ? getRetrievability(a.fsrsCard, now) : 1;
      const retB = b.fsrsCard ? getRetrievability(b.fsrsCard, now) : 1;
      return retA - retB;
    });

  const selectedReview = dueForReview.slice(0, reviewSlots);
  for (const e of selectedReview) usedIds.add(e.id);

  let filteredNew = newExercises.filter((e) => !usedIds.has(e.id));
  if (prerequisitesUnlocked) {
    const gated = filteredNew.filter((e) =>
      e.knowledgeItemIds?.every((ki) => prerequisitesUnlocked.has(ki)) ?? true,
    );
    if (gated.length >= newSlots) {
      filteredNew = gated;
    }
  }

  if (diffProfile) {
    filteredNew = sortByDifficultyMatch(filteredNew, diffProfile);
  }

  const selectedNew = filteredNew.slice(0, newSlots);

  const selected: ExerciseItem[] = [
    ...weaknessExercises.map((e) => ({
      id: e.id,
      type: e.type,
      isReview: true,
      isCultural: e.isCultural,
    })),
    ...selectedNew.map((e) => ({
      id: e.id,
      type: e.type,
      isReview: false,
      isCultural: e.isCultural,
    })),
    ...selectedReview.map((e) => ({
      id: e.id,
      type: e.type,
      isReview: true,
      isCultural: e.isCultural,
    })),
  ];

  const culturalCount = selected.filter((e) => e.isCultural).length;
  if (culturalCount < config.culturalItemsMax) {
    const needed = config.culturalItemsMax - culturalCount;
    const allIds = new Set(selected.map((e) => e.id));
    const available = culturalExercises.filter((c) => !allIds.has(c.id));
    const toAdd = available.slice(0, needed);

    for (const item of toAdd) {
      if (selected.length >= config.totalCount) {
        selected.pop();
      }
      selected.push({
        id: item.id,
        type: item.type,
        isReview: false,
        isCultural: true,
      });
    }
  }

  return shuffle(selected);
}

function selectWeaknessExercises(
  candidates: readonly CandidateExercise[],
  escalations: ErrorEscalation[],
  maxCount: number,
  diffProfile: DifficultyProfile | null,
): CandidateExercise[] {
  if (escalations.length === 0 || maxCount === 0) return [];

  const result: CandidateExercise[] = [];

  for (const esc of escalations) {
    if (result.length >= maxCount) break;

    const matching = candidates.filter(
      (c) =>
        c.knowledgeItemIds?.includes(esc.knowledgeItemId) &&
        !result.some((r) => r.id === c.id),
    );

    if (matching.length === 0) continue;

    const best = diffProfile
      ? matching.sort((a, b) => {
          const aMatch = difficultyDistance(a, diffProfile);
          const bMatch = difficultyDistance(b, diffProfile);
          return aMatch - bMatch;
        })[0]!
      : matching[0]!;

    result.push(best);
  }

  return result;
}

function difficultyDistance(
  exercise: CandidateExercise,
  profile: DifficultyProfile,
): number {
  const d = exercise.difficulty ?? 0.5;
  return Math.abs(d - profile.targetDifficulty);
}

function sortByDifficultyMatch(
  exercises: readonly CandidateExercise[],
  profile: DifficultyProfile,
): CandidateExercise[] {
  return [...exercises].sort((a, b) => {
    const typeWeightA = profile.exerciseTypeWeights[a.type] ?? 0;
    const typeWeightB = profile.exerciseTypeWeights[b.type] ?? 0;

    if (typeWeightA !== typeWeightB) return typeWeightB - typeWeightA;

    return difficultyDistance(a, profile) - difficultyDistance(b, profile);
  });
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
