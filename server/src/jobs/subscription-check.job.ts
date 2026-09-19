import type { Job } from "bullmq";
import type { createDb } from "@fala-pt/db";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { users } from "@fala-pt/db/schema";
import { HEARTS } from "@fala-pt/core";

export interface SubscriptionCheckData {
  batchSize: number;
}

export async function processSubscriptionCheck(
  job: Job<SubscriptionCheckData>,
  db: ReturnType<typeof createDb>,
): Promise<void> {
  const batchSize = job.data.batchSize || 100;
  const now = new Date();

  const expiredSubscriptions = await db
    .select({ id: users.id, tierExpiresAt: users.tierExpiresAt })
    .from(users)
    .where(
      and(
        eq(users.tier, "super"),
        isNotNull(users.tierExpiresAt),
        sql`${users.tierExpiresAt} < ${now}`,
      ),
    )
    .limit(batchSize);

  let downgraded = 0;
  for (const user of expiredSubscriptions) {
    await db
      .update(users)
      .set({
        tier: "free",
        tierExpiresAt: null,
        hearts: HEARTS.MAX,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    downgraded++;
  }

  await job.updateProgress(100);
  await job.log(`Downgraded ${downgraded} expired Super subscriptions`);
}
