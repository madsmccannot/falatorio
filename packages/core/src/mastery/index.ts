export type {
  SkillDomain,
  MasteryCriteria,
  KnowledgeItem,
  KnowledgeRelation,
  L1Difficulty,
  Skill,
  LessonSkill,
  EvidenceEntry,
  MasteryScore,
  CEFREstimate,
} from "./types.js";

export { SKILL_DOMAINS } from "./types.js";

export {
  createEvidenceEntries,
  isProductionExercise,
  computeVarietyScore,
  computeProductionRatio,
  type ExerciseResult,
  type KnowledgeLink,
} from "./evidence-recorder.js";

export {
  calculateMastery,
  hasMastered,
} from "./mastery-calculator.js";

export {
  estimateCEFR,
} from "./cefr-estimator.js";

export {
  validateKnowledgeItemSchema,
  validateSkillSchema,
  validateGraphIntegrity,
  validateLinguisticCompleteness,
  runFullQA,
  type QAResult,
} from "./qa-validator.js";

export {
  checkPrerequisitesSatisfied,
  getAvailableSkills,
  getBlockingPrerequisites,
  getDependents,
  topologicalSort,
  type PrerequisiteCheck,
} from "./prerequisites.js";

export {
  computeCoverageMetrics,
  computeExerciseCoverage,
  type CoverageMetrics,
  type ExerciseCoverageMetrics,
} from "./coverage.js";

export {
  validateExerciseAlignment,
  type ExerciseGenerationRequest,
  type ExerciseConstraints,
  type ExerciseValidationResult,
} from "./exercise-spec.js";

export type {
  AdaptiveContext,
  RecentError,
  AdaptiveRecommendation,
  RecommendationReason,
  CurriculumPosition,
  SelectorInput,
  SelectorOutput,
} from "./adaptive-types.js";

export {
  checkArchitectureReadiness,
  checkContentReadiness,
  checkVerticalSlice,
  checkPhaseStatus,
  RECOMMENDED_VERTICAL_SLICES,
  type ArchitectureReadiness,
  type ContentReadiness,
  type VerticalSliceCheck,
  type PhaseStatus,
} from "./readiness.js";
