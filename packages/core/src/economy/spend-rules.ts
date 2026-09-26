import { OURO } from "../constants.js";

export type SpendItem =
  | "streak_freeze"
  | "heart_refill"
  | "continue_lesson"
  | "xp_boost"
  | "time_extend"
  | "full_energy";

export interface SpendCost {
  item: SpendItem;
  cost: number;
}

const COSTS: Record<SpendItem, number> = {
  streak_freeze: OURO.COST_STREAK_FREEZE,
  heart_refill: OURO.COST_HEART_REFILL,
  continue_lesson: OURO.COST_CONTINUE_LESSON,
  xp_boost: OURO.COST_XP_BOOST,
  time_extend: OURO.COST_TIME_EXTEND,
  full_energy: OURO.COST_FULL_ENERGY,
};

export function getSpendCost(item: SpendItem): SpendCost {
  return { item, cost: COSTS[item] };
}

export function validateSpend(balance: number, item: SpendItem): { valid: boolean; cost: number } {
  const cost = COSTS[item];
  return { valid: balance >= cost, cost };
}
