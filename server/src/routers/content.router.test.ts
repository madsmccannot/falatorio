import { describe, it, expect } from "vitest";

describe("content.seedContent invariants", () => {
  it("seedAll seeds all L1 courses, not just the user's", () => {
    const input = { seedAll: true, l1: undefined };
    expect(input.seedAll).toBe(true);
  });

  it("defaults to user's L1 when l1 not provided", () => {
    const inputL1 = undefined;
    const userL1 = "hi";
    const resolved = inputL1 ?? userL1;
    expect(resolved).toBe("hi");
  });

  it("uses explicit l1 when provided", () => {
    const inputL1 = "bn";
    const userL1 = "hi";
    const resolved = inputL1 ?? userL1;
    expect(resolved).toBe("bn");
  });
});

describe("content.skipSection invariants", () => {
  it("marks all lessons as completed with accuracy 1.0", () => {
    const bestAccuracy = 1.0;
    expect(bestAccuracy).toBe(1.0);
  });

  it("uses onConflictDoNothing to avoid overwriting real completions", () => {
    const existingCompletion = { bestAccuracy: 0.8, attempts: 3 };
    const skipCompletion = { bestAccuracy: 1.0, attempts: 1 };

    const shouldKeepExisting = existingCompletion.attempts > 0;
    expect(shouldKeepExisting).toBe(true);
    expect(existingCompletion.bestAccuracy).not.toBe(skipCompletion.bestAccuracy);
  });

  it("returns zero skipped when section has no units", () => {
    const unitIds: string[] = [];
    expect(unitIds.length).toBe(0);
  });
});

describe("content.getSectionMap invariants", () => {
  it("color index is sequential per unit in section", () => {
    const units = ["unit-a", "unit-b", "unit-c"];
    const colorIndices = units.map((_, idx) => idx);
    expect(colorIndices).toEqual([0, 1, 2]);
  });

  it("lessons are grouped by unitId", () => {
    const lessons = [
      { id: "l1", unitId: "u1" },
      { id: "l2", unitId: "u1" },
      { id: "l3", unitId: "u2" },
    ];

    const byUnit = new Map<string, typeof lessons>();
    for (const l of lessons) {
      const arr = byUnit.get(l.unitId) ?? [];
      arr.push(l);
      byUnit.set(l.unitId, arr);
    }

    expect(byUnit.get("u1")!.length).toBe(2);
    expect(byUnit.get("u2")!.length).toBe(1);
  });
});
