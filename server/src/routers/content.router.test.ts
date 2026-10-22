import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { contentRouter } from "./content.router.js";
import { createMockContext } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ content: contentRouter }));

describe("content.router", () => {
  describe("getCourses", () => {
    it("queries courses filtered by user l1", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.content.getCourses();
      expect(Array.isArray(result)).toBe(true);
      expect(ctx.db.select).toHaveBeenCalled();
    });
  });

  describe("getLessons", () => {
    it("returns lessons for a unit", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.content.getLessons({
        unitId: "00000000-0000-0000-0000-000000000001",
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getExercise", () => {
    it("throws NOT_FOUND for missing exercise", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(
        caller.content.getExercise({
          exerciseId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow();
    });
  });

  describe("getCulturalContent", () => {
    it("returns empty array when no content exists", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.content.getCulturalContent({ limit: 5 });
      expect(result).toEqual([]);
    });
  });

  describe("getAudioClip", () => {
    it("throws NOT_FOUND for missing clip", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(
        caller.content.getAudioClip({
          clipId: "00000000-0000-0000-0000-000000000099",
        }),
      ).rejects.toThrow();
    });
  });
});
