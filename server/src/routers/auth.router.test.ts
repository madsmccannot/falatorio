import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { authRouter } from "./auth.router.js";
import { createMockContext, createMockUser } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ auth: authRouter }));

describe("auth.router", () => {
  describe("checkAccount", () => {
    it("returns exists:false when no user in context", async () => {
      const ctx = createMockContext({ user: null, clerkId: null });
      const caller = createCaller(ctx);
      const result = await caller.auth.checkAccount();
      expect(result.exists).toBe(false);
    });

    it("returns exists:true with l1 and tier for authenticated user", async () => {
      const ctx = createMockContext({ user: createMockUser({ l1: "bn", tier: "super" }) });
      const caller = createCaller(ctx);
      const result = await caller.auth.checkAccount();
      expect(result).toEqual({ exists: true, l1: "bn", tier: "super" });
    });
  });

  describe("checkUsername", () => {
    it("rejects invalid format", async () => {
      const ctx = createMockContext({ user: null, clerkId: null });
      const caller = createCaller(ctx);
      const result = await caller.auth.checkUsername({ username: "123invalid" });
      expect(result.available).toBe(false);
      expect(result.reason).toBe("INVALID_FORMAT");
    });

    it("returns available for untaken username", async () => {
      const ctx = createMockContext({ user: null, clerkId: null });
      const caller = createCaller(ctx);
      const result = await caller.auth.checkUsername({ username: "newuser123" });
      expect(result.available).toBe(true);
    });
  });

  describe("getSession", () => {
    it("returns null when user not found in DB", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.auth.getSession();
      expect(result).toBeNull();
    });
  });

  describe("deleteAccount", () => {
    it("calls db delete and redis del", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.auth.deleteAccount();
      expect(result).toEqual({ deleted: true });
      expect(ctx.db.delete).toHaveBeenCalled();
      expect(ctx.redis.del).toHaveBeenCalled();
    });
  });
});
