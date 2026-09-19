import type { TransactionType } from "../constants.js";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  itemId: string | null;
  reason: string;
  createdAt: Date;
}

export function computeBalance(transactions: readonly Transaction[]): number {
  let balance = 0;
  for (const tx of transactions) {
    switch (tx.type) {
      case "earn":
      case "iap":
        balance += tx.amount;
        break;
      case "spend":
        balance -= Math.abs(tx.amount);
        break;
      case "refund":
        balance += Math.abs(tx.amount);
        break;
    }
  }
  return balance;
}

export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost && cost > 0;
}

export function createEarnTransaction(
  userId: string,
  amount: number,
  reason: string,
): Omit<Transaction, "id" | "createdAt"> {
  if (amount <= 0) throw new Error("Earn amount must be positive");
  return { userId, type: "earn", amount, itemId: null, reason };
}

export function createSpendTransaction(
  userId: string,
  amount: number,
  itemId: string,
  reason: string,
): Omit<Transaction, "id" | "createdAt"> {
  if (amount <= 0) throw new Error("Spend amount must be positive");
  return { userId, type: "spend", amount, itemId, reason };
}

export function createIAPTransaction(
  userId: string,
  amount: number,
  productId: string,
): Omit<Transaction, "id" | "createdAt"> {
  if (amount <= 0) throw new Error("IAP amount must be positive");
  return { userId, type: "iap", amount, itemId: productId, reason: "iap_purchase" };
}
