export type {
  SkillDomain,
  MasteryCriteria,
  KnowledgeItem,
  Skill,
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
