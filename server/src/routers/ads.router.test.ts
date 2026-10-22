import { describe, it, expect } from "vitest";
import { t } from "../trpc/trpc.js";
import { adsRouter } from "./ads.router.js";
import { createMockContext, createMockUser } from "../test/helpers.js";

const createCaller = t.createCallerFactory(t.router({ ads: adsRouter }));

describe("ads.router", () => {
  describe("getAdDecision", () => {
    it("returns show:false for super users", async () => {
      const ctx = createMockContext({
        user: createMockUser({ tier: "super" }),
      });
      (ctx.db.select as any).mockReturnValue({
        from: () => ({
          where: () => ({
            limit: () => ({
              then: (r: any) => r([{ tier: "super", adConsent: true, lastAdShownAt: null }]),
            }),
          }),
        }),
      });
      const caller = createCaller(ctx);
      const result = await caller.ads.getAdDecision({ placement: "banner" });
      expect(result.show).toBe(false);
      expect(result.reason).toBe("super_user");
    });

    it("returns show:false when no ad consent", async () => {
      const ctx = createMockContext();
      (ctx.db.select as any).mockReturnValue({
        from: () => ({
          where: () => ({
            limit: () => ({
              then: (r: any) => r([{ tier: "free", adConsent: false, lastAdShownAt: null }]),
            }),
          }),
        }),
      });
      const caller = createCaller(ctx);
      const result = await caller.ads.getAdDecision({ placement: "interstitial" });
      expect(result.show).toBe(false);
      expect(result.reason).toBe("no_consent");
    });
  });

  describe("recordAdView", () => {
    it("records non-reward ad view", async () => {
      const ctx = createMockContext();
      const caller = createCaller(ctx);
      const result = await caller.ads.recordAdView({ adType: "banner" });
      expect(result.rewarded).toBe(false);
      expect(ctx.db.insert).toHaveBeenCalled();
      expect(ctx.db.update).toHaveBeenCalled();
    });
  });
});
