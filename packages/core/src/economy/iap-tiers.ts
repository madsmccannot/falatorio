import { IAP_TIERS } from "../constants.js";

export interface IAPTier {
  id: string;
  crystals: number;
  priceEur: number;
  pricePerCrystal: number;
}

export const IAP_PRODUCTS: readonly IAPTier[] = IAP_TIERS.map((tier) => ({
  id: tier.id,
  crystals: tier.amount,
  priceEur: tier.priceEur,
  pricePerCrystal: Math.round((tier.priceEur / tier.amount) * 10000) / 10000,
}));

export function getIAPTier(productId: string): IAPTier | undefined {
  return IAP_PRODUCTS.find((t) => t.id === productId);
}

export function validateIAPProductId(productId: string): boolean {
  return IAP_PRODUCTS.some((t) => t.id === productId);
}
