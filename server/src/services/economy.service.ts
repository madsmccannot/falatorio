import { transactions } from "@falatorio/db/schema";
import {
  getSkillMasteredReward,
  getFirstProductionReward,
  getDomainMilestoneReward,
} from "@falatorio/core/economy";
import type { Database } from "@falatorio/db/client";

export async function creditOuro(
  db: Database,
  userId: string,
  amount: number,
  reason: string,
  itemId?: string,
): Promise<string> {
  const [tx] = await db
    .insert(transactions)
    .values({
      userId,
      type: "earn",
      amount,
      reason,
      itemId: itemId ?? null,
    })
    .returning({ id: transactions.id });

  return tx!.id;
}

export async function awardMasteryReward(
  db: Database,
  userId: string,
  reason: "skill_mastered" | "first_production" | "domain_milestone",
  domainsCovered?: number,
): Promise<{ awarded: boolean; amount: number; transactionId?: string }> {
  let reward;
  switch (reason) {
    case "skill_mastered":
      reward = getSkillMasteredReward();
      break;
    case "first_production":
      reward = getFirstProductionReward();
      break;
    case "domain_milestone":
      reward = getDomainMilestoneReward(domainsCovered ?? 0);
      if (!reward) return { awarded: false, amount: 0 };
      break;
  }

  const txId = await creditOuro(db, userId, reward.amount, reward.reason);
  return { awarded: true, amount: reward.amount, transactionId: txId };
}
