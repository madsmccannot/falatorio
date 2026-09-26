import { canAfford } from "./currency.js";
import { getShopItem, type ShopItem } from "./shop-catalog.js";
import { validateIAPProductId } from "./iap-tiers.js";

export type PurchaseError =
  | "item_not_found"
  | "item_inactive"
  | "insufficient_ouro"
  | "requires_real_money"
  | "invalid_product_id"
  | "already_subscribed";

export interface PurchaseValidation {
  valid: boolean;
  error: PurchaseError | null;
  item: ShopItem | null;
}

export function validateOuroPurchase(
  itemId: string,
  balance: number,
): PurchaseValidation {
  const item = getShopItem(itemId);

  if (!item) {
    return { valid: false, error: "item_not_found", item: null };
  }

  if (!item.active) {
    return { valid: false, error: "item_inactive", item };
  }

  if (item.priceOuro === null) {
    return { valid: false, error: "requires_real_money", item };
  }

  if (!canAfford(balance, item.priceOuro)) {
    return { valid: false, error: "insufficient_ouro", item };
  }

  return { valid: true, error: null, item };
}

export function validateIAPPurchase(
  productId: string,
  isAlreadySuper: boolean,
): PurchaseValidation {
  if (!validateIAPProductId(productId)) {
    const item = getShopItem(productId);
    if (!item) {
      return { valid: false, error: "invalid_product_id", item: null };
    }
  }

  const item = getShopItem(productId);
  if (!item) {
    return { valid: false, error: "item_not_found", item: null };
  }

  if (item.effect.kind === "super_subscription" && isAlreadySuper) {
    return { valid: false, error: "already_subscribed", item };
  }

  return { valid: true, error: null, item };
}
