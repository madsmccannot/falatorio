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

export type KnowledgeItemSpec = {
  code: string;
  cefrLevel: CEFRLevel;
  exerciseTypes: CognitiveLevel[];
};

const CEFR_ORDER: Record<CEFRLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

export function validateExerciseAlignment(
  _exerciseType: ExerciseType,
  declaredKnowledgeCodes: string[],
  primaryKnowledgeCode: string | null,
  options?: {
    cognitiveLevel?: CognitiveLevel;
    cefrLevel?: CEFRLevel;
    knowledgeSpecs?: KnowledgeItemSpec[];
  },
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

  if (options?.knowledgeSpecs) {
    const specMap = new Map(options.knowledgeSpecs.map((s) => [s.code, s]));
    for (const code of declaredKnowledgeCodes) {
      if (!specMap.has(code)) {
        errors.push(`Knowledge item not found in taxonomy: ${code}`);
      }
    }

    if (options.cognitiveLevel && primaryKnowledgeCode) {
      const primarySpec = specMap.get(primaryKnowledgeCode);
      if (primarySpec && !primarySpec.exerciseTypes.includes(options.cognitiveLevel)) {
        errors.push(
          `Cognitive level '${options.cognitiveLevel}' not supported by KI ${primaryKnowledgeCode}`,
        );
      }
    }

    if (options.cefrLevel && primaryKnowledgeCode) {
      const primarySpec = specMap.get(primaryKnowledgeCode);
      if (primarySpec) {
        const diff = CEFR_ORDER[options.cefrLevel]! - CEFR_ORDER[primarySpec.cefrLevel]!;
        if (diff < -1) {
          errors.push(
            `Exercise CEFR ${options.cefrLevel} too low for KI ${primaryKnowledgeCode} (${primarySpec.cefrLevel})`,
          );
        }
      }
    }
  }

  const alignment: "strong" | "weak" = primaryKnowledgeCode ? "strong" : "weak";

  return {
    valid: errors.length === 0,
    errors,
    knowledgeAlignment: alignment,
  };
}
