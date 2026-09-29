import { describe, it, expect } from "vitest";
import { validateTaxonomy, SKILLS, KNOWLEDGE_ITEMS } from "@falatorio/db/seed/taxonomy";

describe("taxonomy graph integrity", () => {
  it("passes validateTaxonomy with zero errors", () => {
    const errors = validateTaxonomy();
    expect(errors).toEqual([]);
  });

  it("has no duplicate skill codes", () => {
    const codes = SKILLS.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("has no duplicate KI codes", () => {
    const codes = KNOWLEDGE_ITEMS.map((k) => k.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("every KI references an existing skill", () => {
    const skillCodes = new Set(SKILLS.map((s) => s.code));
    for (const ki of KNOWLEDGE_ITEMS) {
      expect(skillCodes.has(ki.skillCode), `KI ${ki.code} -> skill ${ki.skillCode}`).toBe(true);
    }
  });

  it("every skill has at least one KI", () => {
    const kiBySkill = new Map<string, number>();
    for (const ki of KNOWLEDGE_ITEMS) {
      kiBySkill.set(ki.skillCode, (kiBySkill.get(ki.skillCode) ?? 0) + 1);
    }
    const orphanSkills = SKILLS.filter((s) => !kiBySkill.has(s.code));
    expect(orphanSkills.map((s) => s.code)).toEqual([]);
  });

  it("every prerequisite references an existing skill", () => {
    const skillCodes = new Set(SKILLS.map((s) => s.code));
    for (const s of SKILLS) {
      for (const p of s.prerequisites) {
        expect(skillCodes.has(p), `${s.code} -> prerequisite ${p}`).toBe(true);
      }
    }
  });

  it("no skill references itself as prerequisite", () => {
    for (const s of SKILLS) {
      expect(s.prerequisites).not.toContain(s.code);
    }
  });

  it("prerequisite graph is acyclic (DAG)", () => {
    const adj = new Map<string, string[]>();
    for (const s of SKILLS) {
      adj.set(s.code, [...s.prerequisites]);
    }
    const visited = new Set<string>();
    const inStack = new Set<string>();
    let cycleNode: string | null = null;

    function dfs(node: string): boolean {
      if (inStack.has(node)) { cycleNode = node; return true; }
      if (visited.has(node)) return false;
      visited.add(node);
      inStack.add(node);
      for (const n of adj.get(node) ?? []) {
        if (dfs(n)) return true;
      }
      inStack.delete(node);
      return false;
    }

    for (const s of SKILLS) {
      if (dfs(s.code)) break;
    }
    expect(cycleNode, `Cycle detected at: ${cycleNode}`).toBeNull();
  });

  it("relatedTo references existing KIs", () => {
    const kiCodes = new Set(KNOWLEDGE_ITEMS.map((k) => k.code));
    for (const ki of KNOWLEDGE_ITEMS) {
      for (const rel of ki.relatedTo ?? []) {
        expect(kiCodes.has(rel), `KI ${ki.code} relatedTo ${rel}`).toBe(true);
      }
    }
  });

  it("confusableWith references existing KIs", () => {
    const kiCodes = new Set(KNOWLEDGE_ITEMS.map((k) => k.code));
    for (const ki of KNOWLEDGE_ITEMS) {
      for (const conf of ki.confusableWith ?? []) {
        expect(kiCodes.has(conf), `KI ${ki.code} confusableWith ${conf}`).toBe(true);
      }
    }
  });

  it("every KI has exerciseTypes", () => {
    const missing = KNOWLEDGE_ITEMS.filter((k) => !k.exerciseTypes?.length);
    expect(missing.map((k) => k.code)).toEqual([]);
  });

  it("every KI has masteryCriteria", () => {
    const missing = KNOWLEDGE_ITEMS.filter((k) => !k.masteryCriteria);
    expect(missing.map((k) => k.code)).toEqual([]);
  });

  it("every KI has l1Difficulty for at least 10 languages", () => {
    const weak = KNOWLEDGE_ITEMS.filter(
      (k) => !k.l1Difficulty || Object.keys(k.l1Difficulty).length < 10,
    );
    expect(weak.map((k) => k.code)).toEqual([]);
  });

  it("CEFR levels are valid", () => {
    const valid = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
    for (const s of SKILLS) {
      expect(valid.has(s.cefrLevel), `Skill ${s.code} has level ${s.cefrLevel}`).toBe(true);
    }
    for (const ki of KNOWLEDGE_ITEMS) {
      expect(valid.has(ki.cefrLevel), `KI ${ki.code} has level ${ki.cefrLevel}`).toBe(true);
    }
  });

  it("KI cefrLevel matches or is within skill cefrLevel", () => {
    const order: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const skillLevel = new Map(SKILLS.map((s) => [s.code, s.cefrLevel]));
    for (const ki of KNOWLEDGE_ITEMS) {
      const sLevel = skillLevel.get(ki.skillCode);
      if (!sLevel) continue;
      expect(
        order[ki.cefrLevel]! >= order[sLevel]! - 1,
        `KI ${ki.code} (${ki.cefrLevel}) too low for skill ${ki.skillCode} (${sLevel})`,
      ).toBe(true);
    }
  });

  it("has minimum skill count", () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(100);
  });

  it("has minimum KI count", () => {
    expect(KNOWLEDGE_ITEMS.length).toBeGreaterThanOrEqual(150);
  });
});
