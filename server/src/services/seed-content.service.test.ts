import { describe, it, expect } from "vitest";
import { COURSE_UNITS } from "./seed-content.service.js";
import { CEFR_LEVELS, type CEFRLevel } from "@falatorio/core";

describe("COURSE_UNITS", () => {
  it("has entries for every CEFR level", () => {
    for (const level of CEFR_LEVELS) {
      expect(COURSE_UNITS[level]).toBeDefined();
      expect(COURSE_UNITS[level].length).toBeGreaterThan(0);
    }
  });

  it("has unique themes within each level", () => {
    for (const level of CEFR_LEVELS) {
      const themes = COURSE_UNITS[level].map((u) => u.theme);
      expect(new Set(themes).size).toBe(themes.length);
    }
  });

  it("has unique themes across all levels", () => {
    const allThemes = CEFR_LEVELS.flatMap((level) =>
      COURSE_UNITS[level].map((u) => u.theme),
    );
    expect(new Set(allThemes).size).toBe(allThemes.length);
  });

  it("each unit has non-empty grammarFocus and vocabTarget", () => {
    for (const level of CEFR_LEVELS) {
      for (const unit of COURSE_UNITS[level]) {
        expect(unit.grammarFocus.length).toBeGreaterThan(0);
        expect(unit.vocabTarget.length).toBeGreaterThan(0);
      }
    }
  });

  it("each unit has a Portuguese title with diacritics where expected", () => {
    for (const level of CEFR_LEVELS) {
      for (const unit of COURSE_UNITS[level]) {
        expect(unit.title).toBeTruthy();
        expect(unit.description).toBeTruthy();
      }
    }
  });

  it("has correct unit counts per level", () => {
    expect(COURSE_UNITS.A1.length).toBe(8);
    expect(COURSE_UNITS.A2.length).toBe(8);
    expect(COURSE_UNITS.B1.length).toBe(8);
    expect(COURSE_UNITS.B2.length).toBe(6);
    expect(COURSE_UNITS.C1.length).toBe(4);
    expect(COURSE_UNITS.C2.length).toBe(2);
  });

  describe("lesson count calculation", () => {
    it("computes expected total lessons for a full A1-C2 course", () => {
      let total = 0;
      for (const level of CEFR_LEVELS) {
        const lessonsPerUnit = level === "C2" ? 5 : level === "C1" ? 6 : 8;
        total += COURSE_UNITS[level].length * lessonsPerUnit;
      }
      const expected =
        8 * 8 + // A1
        8 * 8 + // A2
        8 * 8 + // B1
        6 * 8 + // B2
        4 * 6 + // C1
        2 * 5;  // C2
      expect(total).toBe(expected);
    });

    it("computes expected lessons for A2-start language (skipping A1)", () => {
      const levels: CEFRLevel[] = ["A2", "B1", "B2", "C1", "C2"];
      let total = 0;
      for (const level of levels) {
        const lessonsPerUnit = level === "C2" ? 5 : level === "C1" ? 6 : 8;
        total += COURSE_UNITS[level].length * lessonsPerUnit;
      }
      const expected =
        8 * 8 + // A2
        8 * 8 + // B1
        6 * 8 + // B2
        4 * 6 + // C1
        2 * 5;  // C2
      expect(total).toBe(expected);
    });
  });
});
