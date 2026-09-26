import { CEFR_LEVELS, type CEFRLevel } from "../constants.js";
import type { CEFREstimate, MasteryScore, Skill, SkillDomain } from "./types.js";

type SkillWithMastery = {
  skill: Skill;
  mastery: MasteryScore | null;
};

const MASTERED_THRESHOLD = 0.7;
const STRONG_THRESHOLD = 0.8;
const WEAK_THRESHOLD = 0.4;
const MIN_EVIDENCE_FOR_LEVEL = 3;

export function estimateCEFR(skills: SkillWithMastery[]): CEFREstimate {
  if (skills.length === 0) {
    return {
      level: "A1",
      confidence: 0,
      strongDomains: [],
      weakDomains: [],
      unevaluatedDomains: [],
    };
  }

  const byLevel = new Map<CEFRLevel, SkillWithMastery[]>();
  for (const level of CEFR_LEVELS) {
    byLevel.set(level, []);
  }
  for (const s of skills) {
    byLevel.get(s.skill.cefrLevel)!.push(s);
  }

  let highestMastered: CEFRLevel = "A1";
  let totalConfidence = 0;
  let evaluatedLevels = 0;

  for (const level of CEFR_LEVELS) {
    const levelSkills = byLevel.get(level)!;
    if (levelSkills.length === 0) continue;

    const evaluated = levelSkills.filter(
      (s) => s.mastery !== null && s.mastery.totalEvidence >= MIN_EVIDENCE_FOR_LEVEL,
    );

    if (evaluated.length === 0) continue;

    const avgMastery =
      evaluated.reduce((sum, s) => sum + s.mastery!.mastery, 0) / evaluated.length;
    const coverageRatio = evaluated.length / levelSkills.length;

    if (avgMastery >= MASTERED_THRESHOLD && coverageRatio >= 0.5) {
      highestMastered = level;
    }

    totalConfidence += coverageRatio * evaluated.reduce((s, e) => s + e.mastery!.confidence, 0) / evaluated.length;
    evaluatedLevels++;
  }

  const domainScores = new Map<SkillDomain, { total: number; count: number }>();
  const allDomains = new Set<SkillDomain>();
  const evaluatedDomains = new Set<SkillDomain>();

  for (const s of skills) {
    allDomains.add(s.skill.domain);
    if (s.mastery && s.mastery.totalEvidence >= MIN_EVIDENCE_FOR_LEVEL) {
      evaluatedDomains.add(s.skill.domain);
      const entry = domainScores.get(s.skill.domain) ?? { total: 0, count: 0 };
      entry.total += s.mastery.mastery;
      entry.count++;
      domainScores.set(s.skill.domain, entry);
    }
  }

  const strongDomains: SkillDomain[] = [];
  const weakDomains: SkillDomain[] = [];
  for (const [domain, { total, count }] of domainScores) {
    const avg = total / count;
    if (avg >= STRONG_THRESHOLD) strongDomains.push(domain);
    else if (avg < WEAK_THRESHOLD) weakDomains.push(domain);
  }

  const unevaluatedDomains = [...allDomains].filter((d) => !evaluatedDomains.has(d));

  const confidence = evaluatedLevels > 0
    ? Math.min(totalConfidence / evaluatedLevels, 1)
    : 0;

  return {
    level: highestMastered,
    confidence: Math.round(confidence * 100) / 100,
    strongDomains,
    weakDomains,
    unevaluatedDomains,
  };
}
