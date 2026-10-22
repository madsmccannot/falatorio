import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { masteryRouter } from "./mastery.router.js";
import { createMockContext } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ mastery: masteryRouter }));

describe("mastery.router", () => {
  describe("getSkills", () => {
    it("returns skills array from db", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getSkills();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getKnowledgeItems", () => {
    it("returns empty array when no items exist", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getKnowledgeItems();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getPrerequisites", () => {
    it("returns empty for skill with no prereqs", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getPrerequisites({
        skillId: "00000000-0000-0000-0000-000000000001",
      });
      expect(result).toEqual([]);
    });
  });

  describe("getUserMastery", () => {
    it("returns empty array for fresh user", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getUserMastery();
      expect(result).toEqual([]);
    });
  });

  describe("getEvidence", () => {
    it("returns empty evidence for unknown KI", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getEvidence({
        knowledgeItemId: "00000000-0000-0000-0000-000000000001",
      });
      expect(result).toEqual([]);
    });
  });

  describe("getUserGlossary", () => {
    it("returns empty when user has no evidence", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getUserGlossary();
      expect(result).toEqual([]);
    });
  });

  describe("getLessonSkills", () => {
    it("returns empty for lesson with no linked skills", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.getLessonSkills({
        lessonId: "00000000-0000-0000-0000-000000000001",
      });
      expect(result).toEqual([]);
    });
  });

  describe("recordEvidence", () => {
    it("inserts evidence and returns id", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.recordEvidence({
        knowledgeItemId: "00000000-0000-0000-0000-000000000001",
        score: 0.8,
        exerciseType: "translate_l1_to_pt",
      });
      expect(result).toHaveProperty("evidenceId");
      expect(ctx.db.insert).toHaveBeenCalled();
    });
  });

  describe("recordVocabLookup", () => {
    it("returns recorded:false for unknown code", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.mastery.recordVocabLookup({
        knowledgeItemCode: "PT.UNKNOWN.CODE",
      });
      expect(result.recorded).toBe(false);
    });
  });
});
