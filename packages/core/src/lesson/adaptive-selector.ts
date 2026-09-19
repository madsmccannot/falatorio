import { LESSON } from "../constants.js";
import type { ExerciseItem } from "./session-state.js";
import type { FSRSCard } from "../fsrs/types.js";
import { isDue, getRetrievability } from "../fsrs/scheduler.js";

export interface CandidateExercise {
  id: string;
  type: ExerciseItem["type"];
  isCultural: boolean;
  fsrsCard: FSRSCard | null;
}

export interface SelectionConfig {
  totalCount: number;
  newRatio: number;
  reviewRatio: number;
  culturalItemsMax: number;
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
  const targetNew = Math.floor(config.totalCount * config.newRatio);
  const targetReview = config.totalCount - targetNew;

  const dueForReview = reviewCandidates
    .filter((c) => c.fsrsCard !== null && isDue(c.fsrsCard, now))
    .sort((a, b) => {
      const retA = a.fsrsCard ? getRetrievability(a.fsrsCard, now) : 1;
      const retB = b.fsrsCard ? getRetrievability(b.fsrsCard, now) : 1;
      return retA - retB;
    });

  const selectedReview = dueForReview.slice(0, targetReview);
  const remainingNewSlots = config.totalCount - selectedReview.length;
  const selectedNew = newExercises.slice(0, remainingNewSlots);

  const selected: ExerciseItem[] = [
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
    const usedIds = new Set(selected.map((e) => e.id));
    const available = culturalExercises.filter((c) => !usedIds.has(c.id));
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

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}
