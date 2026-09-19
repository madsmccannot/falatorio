import Purchases, {
  type CustomerInfo,
  type PurchasesPackage,
  LOG_LEVEL,
} from "react-native-purchases";

export type { PurchasesPackage };
import { Platform } from "react-native";

const API_KEYS = {
  apple: "REVENUECAT_APPLE_API_KEY",
  google: "REVENUECAT_GOOGLE_API_KEY",
} as const;

export async function initRevenueCat(userId: string): Promise<void> {
  const apiKey = Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google;

  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey, appUserID: userId });
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) return [];
  return current.availablePackages;
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function isSuperActive(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active["super"] !== undefined;
}
