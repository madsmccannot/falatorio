import type { ExerciseType } from "../constants.js";
import type { EvidenceEntry } from "./types.js";

export type ExerciseResult = {
  exerciseId: string;
  userId: string;
  score: number;
  exerciseType: ExerciseType;
};

export type KnowledgeLink = {
  exerciseId: string;
  knowledgeItemId: string;
};

export function createEvidenceEntries(
  result: ExerciseResult,
  knowledgeLinks: KnowledgeLink[],
): Omit<EvidenceEntry, "id" | "createdAt">[] {
  const links = knowledgeLinks.filter((l) => l.exerciseId === result.exerciseId);
  return links.map((link) => ({
    userId: result.userId,
    knowledgeItemId: link.knowledgeItemId,
    exerciseId: result.exerciseId,
    score: result.score,
    exerciseType: result.exerciseType,
  }));
}

const PRODUCTION_TYPES = new Set<ExerciseType>([
  "translate_l1_to_pt",
  "speak_and_score",
  "fill_blank",
  "reorder_words",
]);

export function isProductionExercise(type: ExerciseType): boolean {
  return PRODUCTION_TYPES.has(type);
}

export function computeVarietyScore(exerciseTypes: ExerciseType[]): number {
  if (exerciseTypes.length === 0) return 0;
  const unique = new Set(exerciseTypes);
  return Math.min(unique.size / 4, 1);
}

export function computeProductionRatio(exerciseTypes: ExerciseType[]): number {
  if (exerciseTypes.length === 0) return 0;
  const productionCount = exerciseTypes.filter((t) => PRODUCTION_TYPES.has(t)).length;
  return productionCount / exerciseTypes.length;
}
