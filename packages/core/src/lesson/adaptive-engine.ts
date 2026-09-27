import type { CEFRLevel } from "../constants.js";
import type {
  AdaptiveContext,
  AdaptiveRecommendation,
  SelectorInput,
  SelectorOutput,
} from "../mastery/adaptive-types.js";
import type { Skill } from "../mastery/types.js";
import { getAvailableSkills } from "../mastery/prerequisites.js";
import { analyzeErrors, type ErrorRecord, type ErrorPattern } from "./error-engine.js";
import { LESSON } from "../constants.js";

export interface AdaptiveEngineInput {
  context: AdaptiveContext;
  allSkills: Skill[];
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>;
  fsrsReviewDueSkillIds: string[];
  l1DifficultyMap?: Map<string, "low" | "medium" | "high">;
  errorRecords?: ErrorRecord[];
}

export interface AdaptiveEngineOutput {
  recommendations: AdaptiveRecommendation[];
  errorPatterns: ErrorPattern[];
  exerciseDistribution: SelectorOutput["exerciseDistribution"];
  unlockedSkillIds: string[];
}

export function runAdaptiveEngine(input: AdaptiveEngineInput): AdaptiveEngineOutput {
  const {
    context,
    allSkills,
    prerequisites,
    fsrsReviewDueSkillIds,
    l1DifficultyMap,
    errorRecords = [],
  } = input;

  const errorPatterns = analyzeErrors(errorRecords);

  const masteryMap = new Map(context.skillMastery.map((m) => [m.skillId, m]));

  const availableSkills = getAvailableSkills(
    allSkills,
    prerequisites,
    context.skillMastery,
    0.7,
  );
  const unlockedSkillIds = availableSkills.map((s) => s.id);
  const unlockedSet = new Set(unlockedSkillIds);

  const cefrOrder = cefrLevelIndex(context.currentCEFR);
  const relevantSkills = availableSkills.filter(
    (s) => cefrLevelIndex(s.cefrLevel) <= cefrOrder + 1,
  );

  const recommendations: AdaptiveRecommendation[] = [];

  for (const pattern of errorPatterns) {
    if (pattern.severity === "low") continue;
    const matchingSkills = relevantSkills.filter((_s) =>
      context.recentErrors.some(
        (e) => e.knowledgeItemId === pattern.knowledgeItemId,
      ),
    );
    for (const skill of matchingSkills) {
      recommendations.push({
        skillId: skill.id,
        reason: "weakness_detected",
        priority: severityToPriority(pattern.severity),
        suggestedDifficulty: Math.max(0.1, (masteryMap.get(skill.id)?.mastery ?? 0.5) * 0.7),
      });
    }
  }

  const reviewDueSet = new Set(fsrsReviewDueSkillIds);
  for (const skillId of fsrsReviewDueSkillIds) {
    if (!unlockedSet.has(skillId)) continue;
    if (recommendations.some((r) => r.skillId === skillId)) continue;
    const mastery = masteryMap.get(skillId);
    recommendations.push({
      skillId,
      reason: "review_due",
      priority: 5 + (mastery ? (1 - mastery.mastery) * 3 : 2),
      suggestedDifficulty: mastery?.mastery ?? 0.5,
    });
  }

  for (const skill of relevantSkills) {
    if (recommendations.some((r) => r.skillId === skill.id)) continue;
    if (reviewDueSet.has(skill.id)) continue;
    const mastery = masteryMap.get(skill.id);
    if (mastery && mastery.totalEvidence > 0) continue;

    let priority = 3;
    if (l1DifficultyMap) {
      const diff = l1DifficultyMap.get(skill.id);
      if (diff === "high") priority += 2;
      else if (diff === "medium") priority += 1;
    }
    if (cefrLevelIndex(skill.cefrLevel) === cefrOrder) priority += 1;

    recommendations.push({
      skillId: skill.id,
      reason: "new_content",
      priority,
      suggestedDifficulty: cefrToDifficulty(skill.cefrLevel),
    });
  }

  for (const skill of relevantSkills) {
    if (recommendations.some((r) => r.skillId === skill.id)) continue;
    const mastery = masteryMap.get(skill.id);
    if (!mastery || mastery.totalEvidence === 0) continue;
    if (mastery.mastery >= 0.9 && mastery.confidence >= 0.7) continue;

    recommendations.push({
      skillId: skill.id,
      reason: "prerequisite_ready",
      priority: 2,
      suggestedDifficulty: mastery.mastery,
    });
  }

  recommendations.sort((a, b) => b.priority - a.priority);

  const weaknessCount = recommendations.filter((r) => r.reason === "weakness_detected").length;
  const reviewCount = recommendations.filter((r) => r.reason === "review_due").length;
  const totalSlots = LESSON.EXERCISES_PER_LESSON;

  const weaknessSlots = Math.min(Math.ceil(totalSlots * 0.2), weaknessCount);
  const reviewSlots = Math.min(
    Math.floor((totalSlots - weaknessSlots) * LESSON.REVIEW_RATIO),
    reviewCount * 2,
  );
  const newSlots = totalSlots - weaknessSlots - reviewSlots;

  return {
    recommendations,
    errorPatterns,
    exerciseDistribution: {
      newContent: newSlots,
      review: reviewSlots,
      weaknessTargeted: weaknessSlots,
    },
    unlockedSkillIds,
  };
}

export function buildSelectorOutput(
  _input: SelectorInput,
  _allSkills: Skill[],
  _prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
  engineOutput: AdaptiveEngineOutput,
): SelectorOutput {
  const topSkillIds = engineOutput.recommendations
    .slice(0, LESSON.EXERCISES_PER_LESSON)
    .map((r) => r.skillId);

  return {
    selectedSkillIds: [...new Set(topSkillIds)],
    exerciseDistribution: engineOutput.exerciseDistribution,
  };
}

function cefrLevelIndex(level: CEFRLevel): number {
  const levels: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return levels.indexOf(level);
}

function cefrToDifficulty(level: CEFRLevel): number {
  const map: Record<CEFRLevel, number> = {
    A1: 0.15, A2: 0.3, B1: 0.45, B2: 0.6, C1: 0.75, C2: 0.9,
  };
  return map[level];
}

function severityToPriority(severity: ErrorPattern["severity"]): number {
  const map = { low: 2, medium: 5, high: 8, critical: 12 };
  return map[severity];
}
