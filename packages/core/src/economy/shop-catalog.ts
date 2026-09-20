import type { ShopItemType } from "../constants.js";
import { CRYSTALS, SUPER_PRICING } from "../constants.js";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  priceCrystals: number | null;
  priceEur: number | null;
  icon: string;
  effect: ShopEffect;
  active: boolean;
  sortOrder: number;
}

export type ShopEffect =
  | { kind: "streak_freeze" }
  | { kind: "heart_refill"; amount: 1 }
  | { kind: "full_energy" }
  | { kind: "continue_lesson" }
  | { kind: "xp_boost"; multiplier: number; durationMs: number }
  | { kind: "time_extend" }
  | { kind: "crystal_pack"; crystals: number }
  | { kind: "super_subscription"; period: "monthly" | "yearly" };

export const SHOP_ITEMS: readonly ShopItem[] = [
  {
    id: "streak_freeze",
    name: "Streak Freeze",
    description: "Protect your streak for one day",
    type: "consumable",
    priceCrystals: CRYSTALS.COST_STREAK_FREEZE,
    priceEur: null,
    icon: "shield",
    effect: { kind: "streak_freeze" },
    active: true,
    sortOrder: 1,
  },
  {
    id: "heart_refill",
    name: "Heart Refill",
    description: "Refill one heart",
    type: "consumable",
    priceCrystals: CRYSTALS.COST_HEART_REFILL,
    priceEur: null,
    icon: "heart",
    effect: { kind: "heart_refill", amount: 1 },
    active: true,
    sortOrder: 2,
  },
  {
    id: "full_energy",
    name: "Full Energy",
    description: "Refill all hearts to maximum",
    type: "consumable",
    priceCrystals: CRYSTALS.COST_FULL_ENERGY,
    priceEur: null,
    icon: "bolt",
    effect: { kind: "full_energy" },
    active: true,
    sortOrder: 3,
  },
  {
    id: "xp_boost",
    name: "XP Boost",
    description: "Double XP for 15 minutes",
    type: "consumable",
    priceCrystals: CRYSTALS.COST_XP_BOOST,
    priceEur: null,
    icon: "rocket",
    effect: { kind: "xp_boost", multiplier: 2, durationMs: 15 * 60 * 1000 },
    active: true,
    sortOrder: 4,
  },
  {
    id: "time_extend",
    name: "Time Extend",
    description: "Extra time on timed challenges",
    type: "consumable",
    priceCrystals: CRYSTALS.COST_TIME_EXTEND,
    priceEur: null,
    icon: "timer",
    effect: { kind: "time_extend" },
    active: true,
    sortOrder: 5,
  },
  {
    id: "crystals_1200",
    name: "Crystal Pouch",
    description: "1,200 crystals",
    type: "consumable",
    priceCrystals: null,
    priceEur: 4.99,
    icon: "prisms",
    effect: { kind: "crystal_pack", crystals: 1200 },
    active: true,
    sortOrder: 10,
  },
  {
    id: "crystals_3000",
    name: "Crystal Chest",
    description: "3,000 crystals",
    type: "consumable",
    priceCrystals: null,
    priceEur: 9.99,
    icon: "prisms",
    effect: { kind: "crystal_pack", crystals: 3000 },
    active: true,
    sortOrder: 11,
  },
  {
    id: "crystals_6500",
    name: "Crystal Vault",
    description: "6,500 crystals",
    type: "consumable",
    priceCrystals: null,
    priceEur: 20.99,
    icon: "prisms",
    effect: { kind: "crystal_pack", crystals: 6500 },
    active: true,
    sortOrder: 12,
  },
  {
    id: "super_monthly",
    name: "Super Monthly",
    description: "Unlimited hearts, no ads, error review",
    type: "subscription",
    priceCrystals: null,
    priceEur: SUPER_PRICING.MONTHLY_EUR,
    icon: "crown",
    effect: { kind: "super_subscription", period: "monthly" },
    active: true,
    sortOrder: 20,
  },
  {
    id: "super_yearly",
    name: "Super Yearly",
    description: "Best value — save over 35%",
    type: "subscription",
    priceCrystals: null,
    priceEur: SUPER_PRICING.YEARLY_EUR,
    icon: "crown",
    effect: { kind: "super_subscription", period: "yearly" },
    active: true,
    sortOrder: 21,
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export function getActiveShopItems(): readonly ShopItem[] {
  return SHOP_ITEMS.filter((item) => item.active);
}
