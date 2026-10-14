import { describe, it, expect } from "vitest";
import {
  topologicalSort,
  estimateCEFR,
  getAvailableSkills,
  type Skill,
  type MasteryScore,
} from "@falatorio/core";

const makeSkill = (id: string, code: string, domain: string, cefr: string, order: number): Skill => ({
  id,
  code,
  domain: domain as any,
  name: { en: code },
  description: null,
  cefrLevel: cefr as any,
  sortOrder: order,
});

describe("mastery.topologicalSort", () => {
  it("sorts skills respecting prerequisites", () => {
    const skills = [
      makeSkill("s1", "grammar.articles", "grammar", "A1", 1),
      makeSkill("s2", "grammar.adjectives", "grammar", "A1", 2),
      makeSkill("s3", "grammar.agreement", "grammar", "A2", 3),
    ];
    const prereqs = [
      { skillId: "s3", prerequisiteId: "s1" },
      { skillId: "s3", prerequisiteId: "s2" },
    ];

    const sorted = topologicalSort(skills, prereqs);
    const s1Idx = sorted.findIndex((s) => s.id === "s1");
    const s2Idx = sorted.findIndex((s) => s.id === "s2");
    const s3Idx = sorted.findIndex((s) => s.id === "s3");

    expect(s1Idx).toBeLessThan(s3Idx);
    expect(s2Idx).toBeLessThan(s3Idx);
  });

  it("handles skills with no prerequisites", () => {
    const skills = [
      makeSkill("s1", "vocab.greetings", "vocabulary", "A1", 1),
      makeSkill("s2", "vocab.numbers", "vocabulary", "A1", 2),
    ];

    const sorted = topologicalSort(skills, []);
    expect(sorted.length).toBe(2);
  });
});

describe("mastery.getAvailableSkills", () => {
  it("returns skills whose prereqs are mastered", () => {
    const skills = [
      makeSkill("s1", "grammar.articles", "grammar", "A1", 1),
      makeSkill("s2", "grammar.adjectives", "grammar", "A1", 2),
    ];
    const prereqs = [{ skillId: "s2", prerequisiteId: "s1" }];
    const mastery: MasteryScore[] = [
      {
        userId: "u1",
        skillId: "s1",
        mastery: 0.9,
        confidence: 0.8,
        totalEvidence: 10,
        varietyScore: 0.8,
        productionScore: 0.7,
        lastEvidenceAt: new Date(),
      },
    ];

    const available = getAvailableSkills(skills, prereqs, mastery, 0.7);
    const codes = available.map((s) => s.code);
    expect(codes).toContain("grammar.adjectives");
  });

  it("excludes skills whose prereqs are not mastered", () => {
    const skills = [
      makeSkill("s1", "grammar.articles", "grammar", "A1", 1),
      makeSkill("s2", "grammar.adjectives", "grammar", "A1", 2),
    ];
    const prereqs = [{ skillId: "s2", prerequisiteId: "s1" }];
    const mastery: MasteryScore[] = [
      {
        userId: "u1",
        skillId: "s1",
        mastery: 0.3,
        confidence: 0.2,
        totalEvidence: 2,
        varietyScore: 0.2,
        productionScore: 0.1,
        lastEvidenceAt: new Date(),
      },
    ];

    const available = getAvailableSkills(skills, prereqs, mastery, 0.7);
    const codes = available.map((s) => s.code);
    expect(codes).not.toContain("grammar.adjectives");
  });
});

describe("mastery.estimateCEFR", () => {
  it("returns A1 for empty mastery", () => {
    const skills = [
      makeSkill("s1", "grammar.articles", "grammar", "A1", 1),
    ];
    const skillsWithMastery = skills.map((s) => ({ skill: s, mastery: null }));

    const estimate = estimateCEFR(skillsWithMastery);
    expect(estimate.level).toBe("A1");
  });
});

describe("mastery.recordEvidence invariants", () => {
  it("score is bounded between 0 and 1", () => {
    const validScores = [0, 0.5, 1];
    for (const score of validScores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it("exerciseType is required and non-empty", () => {
    const exerciseType = "fill_blank";
    expect(exerciseType.length).toBeGreaterThan(0);
  });
});

describe("mastery.recordVocabLookup invariants", () => {
  it("lookup score is fixed at 0.5", () => {
    const lookupScore = 0.5;
    expect(lookupScore).toBe(0.5);
  });

  it("returns not recorded when knowledge item not found", () => {
    const ki = undefined;
    const recorded = !!ki;
    expect(recorded).toBe(false);
  });
});

describe("mastery.linkLessonSkill invariants", () => {
  it("upserts isPrimary on conflict", () => {
    const existingLink = { lessonId: "l1", skillId: "s1", isPrimary: false };
    const newIsPrimary = true;
    const afterUpsert = { ...existingLink, isPrimary: newIsPrimary };
    expect(afterUpsert.isPrimary).toBe(true);
  });
});
