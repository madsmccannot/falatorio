import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { questsRouter } from "./quests.router.js";
import { createMockContext } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ quests: questsRouter }));

describe("quests.router", () => {
  describe("getDailyQuests", () => {
    it("returns quests array from service", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.quests.getDailyQuests();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getMonthlyProgress", () => {
    it("returns progress object", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.quests.getMonthlyProgress();
      expect(result).toBeDefined();
    });
  });
});
