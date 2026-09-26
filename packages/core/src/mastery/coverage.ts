import type { KnowledgeItem, Skill } from "./types.js";

export type CoverageMetrics = {
  skillsTotal: number;
  knowledgeItemsTotal: number;

  skillsByCEFR: Record<string, number>;
  knowledgeByCEFR: Record<string, number>;

  skillsByDomain: Record<string, number>;
  knowledgeByDomain: Record<string, number>;

  knowledgeWithPrerequisites: number;
  knowledgeWithoutPrerequisites: number;

  knowledgeWithExerciseTypes: number;
  knowledgeWithoutExerciseTypes: number;

  knowledgeWithMasteryCriteria: number;
  knowledgeWithoutMasteryCriteria: number;

  knowledgeWithExamples: number;
  knowledgeWithCounterexamples: number;
  knowledgeWithCommonErrors: number;
  knowledgeWithL1Notes: number;
};

export function computeCoverageMetrics(
  skills: Skill[],
  knowledgeItems: KnowledgeItem[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
): CoverageMetrics {
  const skillsByCEFR: Record<string, number> = {};
  const knowledgeByCEFR: Record<string, number> = {};
  const skillsByDomain: Record<string, number> = {};
  const knowledgeByDomain: Record<string, number> = {};

  for (const s of skills) {
    skillsByCEFR[s.cefrLevel] = (skillsByCEFR[s.cefrLevel] ?? 0) + 1;
    skillsByDomain[s.domain] = (skillsByDomain[s.domain] ?? 0) + 1;
  }

  const skillDomainMap = new Map(skills.map((s) => [s.id, s.domain]));

  for (const ki of knowledgeItems) {
    knowledgeByCEFR[ki.cefrLevel] = (knowledgeByCEFR[ki.cefrLevel] ?? 0) + 1;
    const domain = skillDomainMap.get(ki.skillId) ?? "unknown";
    knowledgeByDomain[domain] = (knowledgeByDomain[domain] ?? 0) + 1;
  }

  const skillsWithPrereqs = new Set(prerequisites.map((p) => p.skillId));

  let knowledgeWithPrerequisites = 0;
  let knowledgeWithoutPrerequisites = 0;
  for (const ki of knowledgeItems) {
    if (skillsWithPrereqs.has(ki.skillId)) {
      knowledgeWithPrerequisites++;
    } else {
      knowledgeWithoutPrerequisites++;
    }
  }

  let knowledgeWithExerciseTypes = 0;
  let knowledgeWithMasteryCriteria = 0;
  let knowledgeWithExamples = 0;
  let knowledgeWithCounterexamples = 0;
  let knowledgeWithCommonErrors = 0;
  let knowledgeWithL1Notes = 0;

  for (const ki of knowledgeItems) {
    if (ki.exerciseTypes.length > 0) knowledgeWithExerciseTypes++;
    if (ki.masteryCriteria) knowledgeWithMasteryCriteria++;
    if (ki.examples.length > 0) knowledgeWithExamples++;
    if (ki.counterexamples.length > 0) knowledgeWithCounterexamples++;
    if (ki.commonErrors.length > 0) knowledgeWithCommonErrors++;
    if (ki.l1Notes && Object.keys(ki.l1Notes).length > 0) knowledgeWithL1Notes++;
  }

  return {
    skillsTotal: skills.length,
    knowledgeItemsTotal: knowledgeItems.length,
    skillsByCEFR,
    knowledgeByCEFR,
    skillsByDomain,
    knowledgeByDomain,
    knowledgeWithPrerequisites,
    knowledgeWithoutPrerequisites,
    knowledgeWithExerciseTypes,
    knowledgeWithoutExerciseTypes: knowledgeItems.length - knowledgeWithExerciseTypes,
    knowledgeWithMasteryCriteria,
    knowledgeWithoutMasteryCriteria: knowledgeItems.length - knowledgeWithMasteryCriteria,
    knowledgeWithExamples,
    knowledgeWithCounterexamples,
    knowledgeWithCommonErrors,
    knowledgeWithL1Notes,
  };
}

export type ExerciseCoverageMetrics = {
  totalExercises: number;
  exercisesWithKnowledgeMapping: number;
  exercisesWithoutKnowledgeMapping: number;
  knowledgeItemsWithExercises: number;
  knowledgeItemsWithoutExercises: number;
  averageExercisesPerKnowledge: number;
};

export function computeExerciseCoverage(
  knowledgeItemIds: string[],
  exerciseKnowledgeLinks: Array<{ exerciseId: string; knowledgeItemId: string }>,
  totalExercises: number,
): ExerciseCoverageMetrics {
  const exercisesWithMapping = new Set(exerciseKnowledgeLinks.map((l) => l.exerciseId));
  const kisWithExercises = new Set(exerciseKnowledgeLinks.map((l) => l.knowledgeItemId));
  const kiSet = new Set(knowledgeItemIds);

  const kisWithExercisesCount = [...kisWithExercises].filter((id) => kiSet.has(id)).length;

  return {
    totalExercises,
    exercisesWithKnowledgeMapping: exercisesWithMapping.size,
    exercisesWithoutKnowledgeMapping: totalExercises - exercisesWithMapping.size,
    knowledgeItemsWithExercises: kisWithExercisesCount,
    knowledgeItemsWithoutExercises: knowledgeItemIds.length - kisWithExercisesCount,
    averageExercisesPerKnowledge:
      knowledgeItemIds.length > 0
        ? exerciseKnowledgeLinks.length / knowledgeItemIds.length
        : 0,
  };
}
