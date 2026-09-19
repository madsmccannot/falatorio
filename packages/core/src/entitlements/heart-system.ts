import { HEARTS } from "../constants.js";
import type { Tier } from "../constants.js";

export interface HeartState {
  hearts: number | null;
  heartsRefillAt: Date | null;
}

export function getHearts(state: HeartState, tier: Tier, now: Date = new Date()): number | null {
  if (tier === "super") return null;

  let current = state.hearts ?? HEARTS.MAX;

  if (state.heartsRefillAt && now >= state.heartsRefillAt && current < HEARTS.MAX) {
    const elapsed = now.getTime() - state.heartsRefillAt.getTime();
    const refills = Math.floor(elapsed / HEARTS.REFILL_INTERVAL_MS) + 1;
    current = Math.min(HEARTS.MAX, current + refills);
  }

  return current;
}

export function spendHeart(state: HeartState, now: Date = new Date()): HeartState {
  const current = state.hearts ?? HEARTS.MAX;
  if (current <= 0) throw new Error("No hearts to spend");

  const newHearts = current - 1;
  const heartsRefillAt = newHearts < HEARTS.MAX && !state.heartsRefillAt
    ? new Date(now.getTime() + HEARTS.REFILL_INTERVAL_MS)
    : state.heartsRefillAt;

  return { hearts: newHearts, heartsRefillAt };
}

export function refillOneHeart(state: HeartState): HeartState {
  const current = state.hearts ?? HEARTS.MAX;
  const newHearts = Math.min(HEARTS.MAX, current + 1);

  return {
    hearts: newHearts,
    heartsRefillAt: newHearts >= HEARTS.MAX ? null : state.heartsRefillAt,
  };
}

export function refillAllHearts(): HeartState {
  return { hearts: HEARTS.MAX, heartsRefillAt: null };
}

export function canStartLesson(state: HeartState, tier: Tier, now: Date = new Date()): boolean {
  if (tier === "super") return true;
  const current = getHearts(state, tier, now);
  return current !== null && current > 0;
}

export function getTimeUntilRefill(state: HeartState, now: Date = new Date()): number | null {
  if (!state.heartsRefillAt) return null;
  const remaining = state.heartsRefillAt.getTime() - now.getTime();
  return Math.max(0, remaining);
}
