import type { CEFRLevel, L1Code } from "../constants.js";
import type { MasteryScore, Skill } from "./types.js";

export type AdaptiveContext = {
  userId: string;
  l1: L1Code;
  currentCEFR: CEFRLevel;
  skillMastery: MasteryScore[];
  recentErrors: RecentError[];
  completedLessonIds: string[];
};

export type RecentError = {
  knowledgeItemId: string;
  errorCount: number;
  lastErrorAt: Date;
};

export type AdaptiveRecommendation = {
  skillId: string;
  reason: RecommendationReason;
  priority: number;
  suggestedDifficulty: number;
};

export type RecommendationReason =
  | "new_content"
  | "review_due"
  | "weakness_detected"
  | "prerequisite_ready"
  | "l1_priority";

export type CurriculumPosition = {
  courseId: string;
  unitId: string;
  lessonId: string;
  skillIds: string[];
};

export type SelectorInput = {
  context: AdaptiveContext;
  curriculumPosition: CurriculumPosition;
  availableSkills: Skill[];
  fsrsReviewDue: string[];
};

export type SelectorOutput = {
  selectedSkillIds: string[];
  exerciseDistribution: {
    newContent: number;
    review: number;
    weaknessTargeted: number;
  };
};
