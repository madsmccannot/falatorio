import type { CEFRLevel, ExerciseType, CognitiveLevel, KnowledgeRelationType } from "../constants.js";

export const SKILL_DOMAINS = [
  "phonetics",
  "morphology",
  "tenses_moods",
  "determiners",
  "pronouns",
  "prepositions",
  "syntax",
  "lexicon",
  "pragmatics",
  "orthography",
] as const;
export type SkillDomain = (typeof SKILL_DOMAINS)[number];

export type MasteryCriteria = {
  minAccuracy: number;
  minVariety: number;
  minReps: number;
};

export type L1Difficulty = {
  difficulty: "low" | "medium" | "high";
  reason: string;
  expectedErrors?: string[];
};

export type KnowledgeItem = {
  id: string;
  skillId: string;
  code: string;
  cefrLevel: CEFRLevel;
  rule: string;
  examples: string[];
  counterexamples: string[];
  commonErrors: string[];
  l1Notes: Record<string, string | L1Difficulty> | null;
  shortExplanation: Record<string, string> | null;
  exerciseTypes: CognitiveLevel[];
  masteryCriteria: MasteryCriteria | null;
};

export type KnowledgeRelation = {
  sourceId: string;
  targetId: string;
  relationType: KnowledgeRelationType;
};

export type Skill = {
  id: string;
  code: string;
  domain: SkillDomain;
  name: Record<string, string>;
  description: Record<string, string> | null;
  cefrLevel: CEFRLevel;
  sortOrder: number;
};

export type LessonSkill = {
  lessonId: string;
  skillId: string;
  isPrimary: boolean;
};

export type EvidenceEntry = {
  id: string;
  userId: string;
  knowledgeItemId: string;
  exerciseId: string | null;
  score: number;
  exerciseType: ExerciseType;
  createdAt: Date;
};

export type MasteryScore = {
  userId: string;
  skillId: string;
  mastery: number;
  confidence: number;
  totalEvidence: number;
  varietyScore: number;
  productionScore: number;
  lastEvidenceAt: Date | null;
};

export type CEFREstimate = {
  level: CEFRLevel;
  confidence: number;
  strongDomains: SkillDomain[];
  weakDomains: SkillDomain[];
  unevaluatedDomains: SkillDomain[];
};
