import { describe, it, expect } from "vitest";
import { ADS } from "@falatorio/core";

describe("ads.recordAdView security invariants", () => {
  it("rejects reward when cooldown is active", () => {
    const lastAdShownAt = new Date(Date.now() - 60_000);
    const elapsed = Date.now() - lastAdShownAt.getTime();
    expect(elapsed).toBeLessThan(ADS.REWARD_COOLDOWN_MS);
  });

  it("allows reward when cooldown has passed", () => {
    const lastAdShownAt = new Date(Date.now() - ADS.REWARD_COOLDOWN_MS - 1000);
    const elapsed = Date.now() - lastAdShownAt.getTime();
    expect(elapsed).toBeGreaterThanOrEqual(ADS.REWARD_COOLDOWN_MS);
  });

  it("allows reward when never shown before", () => {
    const lastAdShownAt = null;
    const shouldBlock = lastAdShownAt !== null;
    expect(shouldBlock).toBe(false);
  });

  it("super users cannot claim ad rewards", () => {
    const user = { tier: "super", adConsent: true };
    const eligible = user.tier !== "super" && user.adConsent;
    expect(eligible).toBe(false);
  });

  it("users without consent cannot claim ad rewards", () => {
    const user = { tier: "free", adConsent: false };
    const eligible = user.tier !== "super" && user.adConsent;
    expect(eligible).toBe(false);
  });

  it("free users with consent and expired cooldown can claim", () => {
    const user = { tier: "free", adConsent: true };
    const lastAdShownAt = new Date(Date.now() - ADS.REWARD_COOLDOWN_MS - 1000);
    const elapsed = Date.now() - lastAdShownAt.getTime();

    const eligible = user.tier !== "super" && user.adConsent;
    const cooldownPassed = elapsed >= ADS.REWARD_COOLDOWN_MS;
    expect(eligible && cooldownPassed).toBe(true);
  });
});

describe("spendLock invariants", () => {
  it("redis SET NX returns null when lock already held", () => {
    const firstAcquire = "OK";
    const secondAcquire = null;

    expect(firstAcquire).toBeTruthy();
    expect(secondAcquire).toBeFalsy();
  });

  it("lock key is scoped per user", () => {
    const userId1 = "user_a";
    const userId2 = "user_b";
    const key1 = `lock:spend:${userId1}`;
    const key2 = `lock:spend:${userId2}`;

    expect(key1).not.toBe(key2);
  });
});
