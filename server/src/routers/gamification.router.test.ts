import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { gamificationRouter } from "./gamification.router.js";
import { createMockContext } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ gamification: gamificationRouter }));

describe("gamification.router", () => {
  describe("getStreak", () => {
    it("returns zero streak for fresh user", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.gamification.getStreak();
      expect(result.currentDays).toBe(0);
      expect(result.isActive).toBe(false);
      expect(result.freezeAvailable).toBe(false);
    });
  });

  describe("recordDailyActivity", () => {
    it("creates new streak for first activity", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.gamification.recordDailyActivity();
      expect(result.currentDays).toBe(1);
      expect(result.isNew).toBe(true);
      expect(ctx.db.insert).toHaveBeenCalled();
      expect(ctx.db.update).toHaveBeenCalled();
    });
  });

  describe("getAchievements", () => {
    it("returns all achievements with empty unlocked set", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.gamification.getAchievements();
      expect(result.unlocked).toEqual([]);
      expect(Array.isArray(result.all)).toBe(true);
      expect(result.all.length).toBeGreaterThan(0);
      expect(result.all[0]).toHaveProperty("id");
      expect(result.all[0]).toHaveProperty("name");
      expect(result.all.every((a: any) => a.isUnlocked === false)).toBe(true);
    });
  });

  describe("purchaseStreakFreeze", () => {
    it("rejects when balance is insufficient", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(
        caller.gamification.purchaseStreakFreeze(),
      ).rejects.toThrow("insufficient_ouro");
    });
  });

  describe("getLeaderboard", () => {
    it("returns empty when user has no league entry", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.gamification.getLeaderboard();
      expect(result.entries).toEqual([]);
      expect(result.myRank).toBeNull();
      expect(result.tier).toBeNull();
    });
  });
});
