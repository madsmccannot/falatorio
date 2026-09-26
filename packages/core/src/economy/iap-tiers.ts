import { IAP_TIERS } from "../constants.js";

export interface IAPTier {
  id: string;
  ouro: number;
  priceEur: number;
  pricePerOuro: number;
}

export const IAP_PRODUCTS: readonly IAPTier[] = IAP_TIERS.map((tier) => ({
  id: tier.id,
  ouro: tier.amount,
  priceEur: tier.priceEur,
  pricePerOuro: Math.round((tier.priceEur / tier.amount) * 10000) / 10000,
}));

export function getIAPTier(productId: string): IAPTier | undefined {
  return IAP_PRODUCTS.find((t) => t.id === productId);
}

export function validateIAPProductId(productId: string): boolean {
  return IAP_PRODUCTS.some((t) => t.id === productId);
}
