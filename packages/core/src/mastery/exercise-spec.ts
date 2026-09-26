import type { CEFRLevel, CognitiveLevel, ExerciseType, L1Code } from "../constants.js";

export type ExerciseGenerationRequest = {
  knowledgeItemCode: string;
  skillCode: string;
  cefrLevel: CEFRLevel;
  l1: L1Code;
  exerciseType: ExerciseType;
  cognitiveLevel: CognitiveLevel;
  difficulty: number;
  constraints?: ExerciseConstraints;
};

export type ExerciseConstraints = {
  avoidVocabulary?: string[];
  requireContext?: string;
  maxSentenceLength?: number;
  includeAudio?: boolean;
  targetProductionType?: "written" | "spoken";
};

export type ExerciseValidationResult = {
  valid: boolean;
  errors: string[];
  knowledgeAlignment: "strong" | "weak" | "none";
};

export function validateExerciseAlignment(
  _exerciseType: ExerciseType,
  declaredKnowledgeCodes: string[],
  primaryKnowledgeCode: string | null,
): ExerciseValidationResult {
  const errors: string[] = [];

  if (declaredKnowledgeCodes.length === 0) {
    errors.push("Exercise has no declared knowledge items");
    return { valid: false, errors, knowledgeAlignment: "none" };
  }

  if (primaryKnowledgeCode && !declaredKnowledgeCodes.includes(primaryKnowledgeCode)) {
    errors.push("Primary knowledge item not in declared list");
  }

  if (declaredKnowledgeCodes.length > 5) {
    errors.push("Exercise declares too many knowledge items (max 5)");
  }

  const alignment: "strong" | "weak" = primaryKnowledgeCode ? "strong" : "weak";

  return {
    valid: errors.length === 0,
    errors,
    knowledgeAlignment: alignment,
  };
}
