import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { userRouter } from "./user.router.js";
import { createMockContext, createMockUser } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ user: userRouter }));

describe("user.router", () => {
  describe("getProfile", () => {
    it("throws when user not found", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      await expect(caller.user.getProfile()).rejects.toThrow("User not found");
    });
  });

  describe("follow", () => {
    it("rejects self-follow", async () => {
      const user = createMockUser();
      const ctx = createMockContext({ user });
      const caller = createCaller(ctx);
      await expect(
        caller.user.follow({ userId: user.userId }),
      ).rejects.toThrow("cannot_follow_self");
    });
  });

  describe("updateSettings", () => {
    it("calls db update with provided fields", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.user.updateSettings({ dailyGoalMin: 15 });
      expect(result).toEqual({ updated: true });
      expect(ctx.db.update).toHaveBeenCalled();
    });
  });

  describe("updateCEFR", () => {
    it("updates cefr level", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.user.updateCEFR({ level: "B1" });
      expect(result).toEqual({ level: "B1" });
      expect(ctx.db.update).toHaveBeenCalled();
    });
  });

  describe("searchUsers", () => {
    it("calls db with search term", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.user.searchUsers({ query: "maria" });
      expect(Array.isArray(result)).toBe(true);
      expect(ctx.db.select).toHaveBeenCalled();
    });
  });
});
