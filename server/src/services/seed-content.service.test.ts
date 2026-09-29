import { describe, it, expect } from "vitest";
import { COURSE_SECTIONS } from "./seed-content.service.js";

function interpolateLessons(start: number, end: number, idx: number, total: number): number {
  const progress = total > 1 ? idx / (total - 1) : 0;
  return Math.round(start + (end - start) * progress);
}

describe("COURSE_SECTIONS", () => {
  const numberedSections = COURSE_SECTIONS.filter((s) => s.sectionType === "numbered");
  const allUnits = numberedSections.flatMap((s) => s.units);

  it("has 4 numbered sections and 1 daily refresh", () => {
    expect(numberedSections.length).toBe(4);
    expect(COURSE_SECTIONS.filter((s) => s.sectionType === "daily_refresh").length).toBe(1);
  });

  it("daily refresh section has no units", () => {
    const dr = COURSE_SECTIONS.find((s) => s.sectionType === "daily_refresh")!;
    expect(dr.units.length).toBe(0);
  });

  it("each numbered section has at least one unit", () => {
    for (const section of numberedSections) {
      expect(section.units.length).toBeGreaterThan(0);
    }
  });

  it("has unique themes across all sections", () => {
    const themes = allUnits.map((u) => u.theme);
    expect(new Set(themes).size).toBe(themes.length);
  });

  it("each unit has non-empty grammarFocus and vocabTarget", () => {
    for (const unit of allUnits) {
      expect(unit.grammarFocus.length).toBeGreaterThan(0);
      expect(unit.vocabTarget.length).toBeGreaterThan(0);
    }
  });

  it("each unit has a Portuguese title with content", () => {
    for (const unit of allUnits) {
      expect(unit.title).toBeTruthy();
      expect(unit.description).toBeTruthy();
    }
  });

  it("each section has valid CEFR range", () => {
    const cefrOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    for (const section of COURSE_SECTIONS) {
      const minIdx = cefrOrder.indexOf(section.cefrMin);
      const maxIdx = cefrOrder.indexOf(section.cefrMax);
      expect(minIdx).toBeGreaterThanOrEqual(0);
      expect(maxIdx).toBeGreaterThanOrEqual(minIdx);
    }
  });

  it("each section has positive lesson range", () => {
    for (const section of COURSE_SECTIONS) {
      expect(section.lessonsPerUnitStart).toBeGreaterThan(0);
      expect(section.lessonsPerUnitEnd).toBeGreaterThan(0);
    }
  });

  it("has correct unit distribution across sections", () => {
    expect(numberedSections[0]!.units.length).toBe(10);
    expect(numberedSections[1]!.units.length).toBe(30);
    expect(numberedSections[2]!.units.length).toBe(40);
    expect(numberedSections[3]!.units.length).toBe(50);
  });

  it("lesson count progression per section", () => {
    // S1: 5->6 (ramp up for beginners)
    expect(numberedSections[0]!.lessonsPerUnitStart).toBe(5);
    expect(numberedSections[0]!.lessonsPerUnitEnd).toBe(6);
    // S2: 7->6 (fewer lessons, more exercises)
    expect(numberedSections[1]!.lessonsPerUnitStart).toBe(7);
    expect(numberedSections[1]!.lessonsPerUnitEnd).toBe(6);
    // S3: 8->6
    expect(numberedSections[2]!.lessonsPerUnitStart).toBe(8);
    expect(numberedSections[2]!.lessonsPerUnitEnd).toBe(6);
    // S4: 9->7
    expect(numberedSections[3]!.lessonsPerUnitStart).toBe(9);
    expect(numberedSections[3]!.lessonsPerUnitEnd).toBe(7);
  });

  it("CEFR bands overlap intentionally at transitions", () => {
    expect(numberedSections[0]!.cefrMin).toBe("A1");
    expect(numberedSections[0]!.cefrMax).toBe("A2");
    expect(numberedSections[1]!.cefrMin).toBe("A2");
    expect(numberedSections[1]!.cefrMax).toBe("B1");
    expect(numberedSections[2]!.cefrMin).toBe("B2");
    expect(numberedSections[2]!.cefrMax).toBe("C1");
    expect(numberedSections[3]!.cefrMin).toBe("C1");
    expect(numberedSections[3]!.cefrMax).toBe("C2");
  });

  describe("lesson count calculation", () => {
    it("computes interpolated total lessons for all sections", () => {
      let total = 0;
      for (const section of numberedSections) {
        const n = section.units.length;
        for (let i = 0; i < n; i++) {
          total += interpolateLessons(
            section.lessonsPerUnitStart,
            section.lessonsPerUnitEnd,
            i,
            n,
          );
        }
      }
      expect(total).toBeGreaterThan(800);
      expect(total).toBeLessThan(1000);
    });

    it("first unit of each section gets start count", () => {
      for (const section of numberedSections) {
        const first = interpolateLessons(
          section.lessonsPerUnitStart,
          section.lessonsPerUnitEnd,
          0,
          section.units.length,
        );
        expect(first).toBe(section.lessonsPerUnitStart);
      }
    });

    it("last unit of each section gets end count", () => {
      for (const section of numberedSections) {
        const n = section.units.length;
        const last = interpolateLessons(
          section.lessonsPerUnitStart,
          section.lessonsPerUnitEnd,
          n - 1,
          n,
        );
        expect(last).toBe(section.lessonsPerUnitEnd);
      }
    });
  });

  it("each section has i18n titles", () => {
    for (const section of COURSE_SECTIONS) {
      expect(section.title["pt"]).toBeTruthy();
      expect(section.title["en"]).toBeTruthy();
    }
  });
});
