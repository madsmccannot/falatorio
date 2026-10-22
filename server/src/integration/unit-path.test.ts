import { describe, it, expect } from "vitest";
import { exerciseCountForNode } from "@falatorio/core/lesson";
import { LESSON } from "@falatorio/core";

const NODE_TYPES = ["lesson", "application", "practice", "recap", "chest"] as const;

describe("unit path: node types and exercise counts", () => {
  it("chest nodes have zero base exercises", () => {
    expect(LESSON.EXERCISES_BY_NODE_TYPE["chest"]).toBe(0);
    expect(exerciseCountForNode("chest", 0)).toBe(0);
  });

  it("exercise count equals base + section bonus", () => {
    const bonus = LESSON.SECTION_EXERCISE_BONUS;
    for (const nodeType of NODE_TYPES) {
      for (let s = 0; s < bonus.length; s++) {
        const base = LESSON.EXERCISES_BY_NODE_TYPE[nodeType]!;
        expect(exerciseCountForNode(nodeType, s)).toBe(base + bonus[s]!);
      }
    }
  });

  it("exercise count increases with section index", () => {
    for (const nodeType of ["lesson", "application", "practice"] as const) {
      const s0 = exerciseCountForNode(nodeType, 0);
      const s3 = exerciseCountForNode(nodeType, 3);
      expect(s3).toBeGreaterThan(s0);
    }
  });

  it("lesson nodes always have more exercises than application nodes in same section", () => {
    for (let s = 0; s < 4; s++) {
      const lesson = exerciseCountForNode("lesson", s);
      const application = exerciseCountForNode("application", s);
      expect(lesson).toBeGreaterThan(application);
    }
  });

  it("all non-chest node types have at least 1 exercise at section 0", () => {
    for (const nodeType of ["lesson", "application", "practice", "recap"] as const) {
      expect(exerciseCountForNode(nodeType, 0)).toBeGreaterThan(0);
    }
  });

  it("EXERCISES_BY_NODE_TYPE has all 5 node types", () => {
    for (const nodeType of NODE_TYPES) {
      expect(LESSON.EXERCISES_BY_NODE_TYPE).toHaveProperty(nodeType);
    }
  });

  it("unknown node type falls back to EXERCISES_PER_LESSON base", () => {
    const count = exerciseCountForNode("unknown_type", 0);
    expect(count).toBe(LESSON.EXERCISES_PER_LESSON);
  });
});

describe("unit path: session matrix", () => {
  const NODE_BASE_SESSIONS: Record<string, number> = {
    lesson: 4,
    application: 3,
    practice: 2,
    recap: 1,
    chest: 0,
  };

  const SECTION_MULTIPLIER = [1.0, 1.15, 1.3, 1.5];

  function computeSessions(nodeType: string, sectionIdx: number): number {
    if (nodeType === "chest") return 0;
    if (nodeType === "recap") return 1;
    const base = NODE_BASE_SESSIONS[nodeType]!;
    const mult = SECTION_MULTIPLIER[sectionIdx] ?? 1.15;
    return Math.round(base * mult);
  }

  it("chest always has 0 sessions regardless of section", () => {
    for (let s = 0; s < 4; s++) {
      expect(computeSessions("chest", s)).toBe(0);
    }
  });

  it("recap always has exactly 1 session regardless of section", () => {
    for (let s = 0; s < 4; s++) {
      expect(computeSessions("recap", s)).toBe(1);
    }
  });

  it("session counts match the documented matrix", () => {
    // README: S1: lesson=4, app=3, practice=2, recap=1
    expect(computeSessions("lesson", 0)).toBe(4);
    expect(computeSessions("application", 0)).toBe(3);
    expect(computeSessions("practice", 0)).toBe(2);
    expect(computeSessions("recap", 0)).toBe(1);

    // S2: lesson=5, app=3, practice=2, recap=1
    expect(computeSessions("lesson", 1)).toBe(5);
    expect(computeSessions("application", 1)).toBe(3);
    expect(computeSessions("practice", 1)).toBe(2);
    expect(computeSessions("recap", 1)).toBe(1);

    // S3: lesson=5, app=4, practice=3, recap=1
    expect(computeSessions("lesson", 2)).toBe(5);
    expect(computeSessions("application", 2)).toBe(4);
    expect(computeSessions("practice", 2)).toBe(3);
    expect(computeSessions("recap", 2)).toBe(1);

    // S4: lesson=6, app=5, practice=3, recap=1
    expect(computeSessions("lesson", 3)).toBe(6);
    expect(computeSessions("application", 3)).toBe(5);
    expect(computeSessions("practice", 3)).toBe(3);
    expect(computeSessions("recap", 3)).toBe(1);
  });

  it("later sections always have equal or more sessions than earlier ones", () => {
    for (const nodeType of ["lesson", "application", "practice"] as const) {
      for (let s = 1; s < 4; s++) {
        expect(computeSessions(nodeType, s)).toBeGreaterThanOrEqual(
          computeSessions(nodeType, s - 1),
        );
      }
    }
  });
});

describe("unit path: node type assignment", () => {
  function assignNodeTypes(lessonCount: number, unitIdx: number): string[] {
    if (lessonCount <= 1) return ["recap"];
    if (lessonCount === 2) return ["lesson", "recap"];

    const body = lessonCount - 1;
    const types: string[] = [];

    if (unitIdx < 3) {
      for (let i = 0; i < body; i++) types.push("lesson");
    } else if (unitIdx < 6) {
      const contentEnd = Math.ceil(body * 0.6);
      for (let i = 0; i < body; i++) {
        types.push(i < contentEnd ? "lesson" : "application");
      }
    } else {
      const contentEnd = Math.ceil(body * 0.4);
      const appEnd = contentEnd + Math.ceil(body * 0.3);
      for (let i = 0; i < body; i++) {
        if (i < contentEnd) types.push("lesson");
        else if (i < appEnd) types.push("application");
        else types.push("practice");
      }
    }

    types.push("recap");
    return types;
  }

  it("last non-chest node is always recap", () => {
    for (let unitIdx = 0; unitIdx < 20; unitIdx++) {
      for (let count = 1; count <= 8; count++) {
        const types = assignNodeTypes(count, unitIdx);
        expect(types[types.length - 1]).toBe("recap");
      }
    }
  });

  it("early units (1-3) have only lesson + recap", () => {
    const types = assignNodeTypes(5, 0);
    expect(types.filter((t) => t !== "lesson" && t !== "recap")).toEqual([]);
  });

  it("mid units (4-6) introduce application", () => {
    const types = assignNodeTypes(5, 4);
    expect(types).toContain("application");
    expect(types).not.toContain("practice");
  });

  it("later units (7+) introduce practice", () => {
    const types = assignNodeTypes(6, 10);
    expect(types).toContain("practice");
    expect(types).toContain("application");
    expect(types).toContain("lesson");
  });

  it("single-lesson unit is just recap", () => {
    expect(assignNodeTypes(1, 0)).toEqual(["recap"]);
  });

  it("two-lesson unit is lesson + recap", () => {
    expect(assignNodeTypes(2, 0)).toEqual(["lesson", "recap"]);
  });
});
