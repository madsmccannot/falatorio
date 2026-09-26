import type { EvidenceEntry, MasteryCriteria, MasteryScore } from "./types.js";
import { computeVarietyScore, computeProductionRatio } from "./evidence-recorder.js";
import type { ExerciseType } from "../constants.js";

const DEFAULT_CRITERIA: MasteryCriteria = {
  minAccuracy: 0.8,
  minVariety: 0.5,
  minReps: 5,
};

export function calculateMastery(
  userId: string,
  skillId: string,
  evidence: EvidenceEntry[],
  criteria?: MasteryCriteria | null,
): MasteryScore {
  if (evidence.length === 0) {
    return {
      userId,
      skillId,
      mastery: 0,
      confidence: 0,
      totalEvidence: 0,
      varietyScore: 0,
      productionScore: 0,
      lastEvidenceAt: null,
    };
  }

  const c = criteria ?? DEFAULT_CRITERIA;
  const types = evidence.map((e) => e.exerciseType as ExerciseType);
  const scores = evidence.map((e) => e.score);

  const recentWindow = 10;
  const recentScores = scores.slice(-recentWindow);
  const accuracy = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  const varietyScore = computeVarietyScore(types);
  const productionScore = computeProductionRatio(types);

  const accuracyWeight = 0.5;
  const varietyWeight = 0.25;
  const productionWeight = 0.25;

  const rawMastery =
    accuracy * accuracyWeight +
    varietyScore * varietyWeight +
    productionScore * productionWeight;

  const mastery = Math.min(Math.max(rawMastery, 0), 1);

  const repsFactor = Math.min(evidence.length / c.minReps, 1);
  const varietyFactor = Math.min(varietyScore / Math.max(c.minVariety, 0.01), 1);
  const recencyMs = Date.now() - evidence[evidence.length - 1]!.createdAt.getTime();
  const recencyDays = recencyMs / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(1 - recencyDays / 90, 0.2);

  const confidence = Math.min(
    repsFactor * 0.4 + varietyFactor * 0.3 + recencyFactor * 0.3,
    1,
  );

  const sorted = [...evidence].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return {
    userId,
    skillId,
    mastery,
    confidence,
    totalEvidence: evidence.length,
    varietyScore,
    productionScore,
    lastEvidenceAt: sorted[0]!.createdAt,
  };
}

export function hasMastered(score: MasteryScore, criteria?: MasteryCriteria | null): boolean {
  const c = criteria ?? DEFAULT_CRITERIA;
  return (
    score.mastery >= c.minAccuracy &&
    score.varietyScore >= c.minVariety &&
    score.totalEvidence >= c.minReps
  );
}
