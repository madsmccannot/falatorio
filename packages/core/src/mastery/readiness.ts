import type { KnowledgeItem, Skill } from "./types.js";
import type { CoverageMetrics } from "./coverage.js";
import type { QAResult } from "./qa-validator.js";

// ---------------------------------------------------------------------------
// #56 — Definition of Done: Architecture
// ---------------------------------------------------------------------------

export type ArchitectureReadiness = {
  ready: boolean;
  checks: {
    skillsExist: boolean;
    knowledgeItemsExist: boolean;
    prerequisitesFunctional: boolean;
    exerciseMappingFunctional: boolean;
    evidenceFunctional: boolean;
    masteryFunctional: boolean;
  };
  missing: string[];
};

export function checkArchitectureReadiness(params: {
  skillCount: number;
  knowledgeItemCount: number;
  prerequisiteCount: number;
  exerciseKnowledgeLinkCount: number;
  evidenceCount: number;
  masteryCount: number;
}): ArchitectureReadiness {
  const checks = {
    skillsExist: params.skillCount > 0,
    knowledgeItemsExist: params.knowledgeItemCount > 0,
    prerequisitesFunctional: params.prerequisiteCount > 0,
    exerciseMappingFunctional: params.exerciseKnowledgeLinkCount > 0,
    evidenceFunctional: params.evidenceCount >= 0,
    masteryFunctional: params.masteryCount >= 0,
  };

  const missing: string[] = [];
  if (!checks.skillsExist) missing.push("No skills in database");
  if (!checks.knowledgeItemsExist) missing.push("No knowledge items in database");
  if (!checks.prerequisitesFunctional) missing.push("No prerequisites defined");
  if (!checks.exerciseMappingFunctional) missing.push("No exercise-knowledge links");

  return {
    ready: missing.length === 0,
    checks,
    missing,
  };
}

// ---------------------------------------------------------------------------
// #56 — Definition of Done: Content
// ---------------------------------------------------------------------------

export type ContentReadiness = {
  ready: boolean;
  checks: {
    taxonomyComplete: boolean;
    idsStable: boolean;
    relationsExist: boolean;
    cefrAssigned: boolean;
    contentValidated: boolean;
    masteryCriteriaDefined: boolean;
  };
  missing: string[];
  coverage: {
    withMasteryCriteria: number;
    withExerciseTypes: number;
    withExamples: number;
    withL1Notes: number;
    total: number;
  };
};

export function checkContentReadiness(
  skills: Skill[],
  knowledgeItems: KnowledgeItem[],
  qaResult: QAResult,
  coverage: CoverageMetrics,
): ContentReadiness {
  const missing: string[] = [];

  const taxonomyComplete =
    coverage.skillsTotal >= 10 &&
    coverage.knowledgeItemsTotal >= 10 &&
    Object.keys(coverage.skillsByDomain).length >= 5;

  const idsStable = skills.every((s) => s.code.startsWith("PT.")) &&
    knowledgeItems.every((ki) => ki.code.startsWith("PT."));

  const relationsExist = coverage.knowledgeWithPrerequisites > 0;

  const cefrAssigned = Object.keys(coverage.skillsByCEFR).length >= 3;

  const contentValidated = qaResult.valid;

  const masteryCriteriaDefined =
    coverage.knowledgeWithMasteryCriteria / Math.max(coverage.knowledgeItemsTotal, 1) >= 0.5;

  if (!taxonomyComplete) missing.push("Taxonomy needs more skills/KIs across domains");
  if (!idsStable) missing.push("Not all codes follow PT.* format");
  if (!relationsExist) missing.push("No prerequisite relations defined");
  if (!cefrAssigned) missing.push("CEFR levels need broader distribution");
  if (!contentValidated) missing.push(`QA validation failed: ${qaResult.errors.length} errors`);
  if (!masteryCriteriaDefined) missing.push("Less than 50% of KIs have mastery criteria");

  return {
    ready: missing.length === 0,
    checks: {
      taxonomyComplete,
      idsStable,
      relationsExist,
      cefrAssigned,
      contentValidated,
      masteryCriteriaDefined,
    },
    missing,
    coverage: {
      withMasteryCriteria: coverage.knowledgeWithMasteryCriteria,
      withExerciseTypes: coverage.knowledgeWithExerciseTypes,
      withExamples: coverage.knowledgeWithExamples,
      withL1Notes: coverage.knowledgeWithL1Notes,
      total: coverage.knowledgeItemsTotal,
    },
  };
}

// ---------------------------------------------------------------------------
// #57/#58 — Vertical Slice completeness
// ---------------------------------------------------------------------------

export type VerticalSliceCheck = {
  skillCode: string;
  complete: boolean;
  checks: {
    skillExists: boolean;
    hasKnowledgeItems: boolean;
    kiCount: number;
    hasPrerequisites: boolean;
    hasExamples: boolean;
    hasCounterexamples: boolean;
    hasCommonErrors: boolean;
    hasL1Notes: boolean;
    hasExerciseTypes: boolean;
    exerciseTypeCount: number;
    hasMasteryCriteria: boolean;
    hasRelations: boolean;
  };
  missing: string[];
};

export function checkVerticalSlice(
  skillCode: string,
  skills: Skill[],
  knowledgeItems: KnowledgeItem[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
): VerticalSliceCheck {
  const missing: string[] = [];
  const skill = skills.find((s) => s.code === skillCode);

  if (!skill) {
    return {
      skillCode,
      complete: false,
      checks: {
        skillExists: false,
        hasKnowledgeItems: false,
        kiCount: 0,
        hasPrerequisites: false,
        hasExamples: false,
        hasCounterexamples: false,
        hasCommonErrors: false,
        hasL1Notes: false,
        hasExerciseTypes: false,
        exerciseTypeCount: 0,
        hasMasteryCriteria: false,
        hasRelations: false,
      },
      missing: [`Skill ${skillCode} not found`],
    };
  }

  const kis = knowledgeItems.filter((ki) => ki.skillId === skill.id);
  const hasKIs = kis.length >= 2;
  const hasPrereqs = prerequisites.some((p) => p.skillId === skill.id) ||
    prerequisites.some((p) => p.prerequisiteId === skill.id);
  const allHaveExamples = kis.every((ki) => ki.examples.length > 0);
  const someHaveCounterexamples = kis.some((ki) => ki.counterexamples.length > 0);
  const someHaveErrors = kis.some((ki) => ki.commonErrors.length > 0);
  const someHaveL1Notes = kis.some((ki) => ki.l1Notes && Object.keys(ki.l1Notes).length > 0);
  const allHaveExerciseTypes = kis.every((ki) => ki.exerciseTypes.length > 0);
  const uniqueExerciseTypes = new Set(kis.flatMap((ki) => ki.exerciseTypes));
  const has3PlusTypes = uniqueExerciseTypes.size >= 3;
  const allHaveMastery = kis.every((ki) => ki.masteryCriteria != null);
  const someHaveRelations = kis.some(
    (ki) => ki.code !== skillCode,
  );

  if (!hasKIs) missing.push(`Need at least 2 KIs (have ${kis.length})`);
  if (!allHaveExamples) missing.push("Not all KIs have examples");
  if (!someHaveCounterexamples) missing.push("No KIs have counterexamples");
  if (!someHaveErrors) missing.push("No KIs have common errors");
  if (!someHaveL1Notes) missing.push("No KIs have L1 notes");
  if (!allHaveExerciseTypes) missing.push("Not all KIs have exercise types");
  if (!has3PlusTypes) missing.push(`Need 3+ exercise types (have ${uniqueExerciseTypes.size})`);
  if (!allHaveMastery) missing.push("Not all KIs have mastery criteria");

  const complete = missing.length === 0;

  return {
    skillCode,
    complete,
    checks: {
      skillExists: true,
      hasKnowledgeItems: hasKIs,
      kiCount: kis.length,
      hasPrerequisites: hasPrereqs,
      hasExamples: allHaveExamples,
      hasCounterexamples: someHaveCounterexamples,
      hasCommonErrors: someHaveErrors,
      hasL1Notes: someHaveL1Notes,
      hasExerciseTypes: allHaveExerciseTypes,
      exerciseTypeCount: uniqueExerciseTypes.size,
      hasMasteryCriteria: allHaveMastery,
      hasRelations: someHaveRelations,
    },
    missing,
  };
}

export const RECOMMENDED_VERTICAL_SLICES = [
  "PT.TENSES.PRESENT",
  "PT.PREP.BASIC",
  "PT.SYNTAX.DIRECT_OBJECT",
  "PT.SYNTAX.SUB.CAUSAL",
  "PT.SEM.ASPECT.HABITUAL",
  "PT.DISCOURSE.COHESION.LEXICAL",
  "PT.RHETORIC.METAPHOR",
] as const;

// ---------------------------------------------------------------------------
// #59 — Phase status
// ---------------------------------------------------------------------------

export type PhaseStatus = {
  phase: string;
  name: string;
  status: "complete" | "partial" | "not_started";
  output: string;
};

export function checkPhaseStatus(params: {
  skillCount: number;
  kiCount: number;
  domainCount: number;
  prerequisiteCount: number;
  cefrLevelCount: number;
  exerciseKnowledgeLinkCount: number;
  evidenceCount: number;
  masteryCount: number;
  lessonSkillLinkCount: number;
  qaValid: boolean;
  verticalSliceComplete: boolean;
  knowledgeWithRules: number;
  knowledgeWithExamples: number;
  knowledgeWithL1Notes: number;
  contentGeneratorIntegrated: boolean;
}): PhaseStatus[] {
  const p = params;

  return [
    {
      phase: "5.1",
      name: "Audit & hardening",
      status: p.skillCount > 0 && p.kiCount > 0 ? "complete" : "not_started",
      output: "Model confirmed and ready for content",
    },
    {
      phase: "5.2",
      name: "Taxonomy",
      status: p.skillCount >= 50 && p.domainCount >= 5 ? "complete" :
        p.skillCount > 0 ? "partial" : "not_started",
      output: "Versioned taxonomy",
    },
    {
      phase: "5.3",
      name: "Knowledge Graph",
      status: p.kiCount >= 20 && p.prerequisiteCount > 0 ? "complete" :
        p.kiCount > 0 ? "partial" : "not_started",
      output: "First version of the graph",
    },
    {
      phase: "5.4",
      name: "Curriculum mapping",
      status: p.lessonSkillLinkCount > 0 ? "complete" : "not_started",
      output: "Competency-based curriculum",
    },
    {
      phase: "5.5",
      name: "Content authoring",
      status: p.knowledgeWithRules >= 20 && p.knowledgeWithExamples >= 20 && p.knowledgeWithL1Notes >= 10 ? "complete" :
        p.knowledgeWithRules > 0 ? "partial" : "not_started",
      output: "Usable Knowledge Base",
    },
    {
      phase: "5.6",
      name: "Exercise mapping",
      status: p.exerciseKnowledgeLinkCount >= 10 ? "complete" :
        p.exerciseKnowledgeLinkCount > 0 ? "partial" : "not_started",
      output: "Semantically indexed Exercise Bank",
    },
    {
      phase: "5.7",
      name: "Content generation pipeline",
      status: p.contentGeneratorIntegrated ? "complete" : "not_started",
      output: "AI generates from Knowledge Graph",
    },
    {
      phase: "5.8",
      name: "Validation",
      status: p.qaValid ? "complete" : "partial",
      output: "QA pipeline",
    },
    {
      phase: "5.9",
      name: "Vertical slice",
      status: p.verticalSliceComplete ? "complete" : "not_started",
      output: "First provably functional implementation",
    },
    {
      phase: "5.10",
      name: "Expansion",
      status: p.cefrLevelCount >= 5 && p.kiCount >= 100 ? "complete" :
        p.cefrLevelCount >= 4 ? "partial" : "not_started",
      output: "Progressive CEFR expansion",
    },
  ];
}
