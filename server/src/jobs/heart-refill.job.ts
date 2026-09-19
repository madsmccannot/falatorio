import type { Job } from "bullmq";
import type { createDb } from "@fala-pt/db";
import { eq, and, lt, isNotNull, sql } from "drizzle-orm";
import { users } from "@fala-pt/db/schema";
import { HEARTS } from "@fala-pt/core";

interface HeartRefillData {
  batchSize: number;
}

export async function processHeartRefill(
  job: Job<HeartRefillData>,
  db: ReturnType<typeof createDb>,
): Promise<void> {
  const batchSize = job.data.batchSize || 200;
  const now = new Date();

  const dueUsers = await db
    .select({ id: users.id, hearts: users.hearts, heartsRefillAt: users.heartsRefillAt })
    .from(users)
    .where(
      and(
        eq(users.tier, "free"),
        isNotNull(users.heartsRefillAt),
        sql`${users.heartsRefillAt} <= ${now}`,
        sql`${users.hearts} < ${HEARTS.MAX}`,
      ),
    )
    .limit(batchSize);

  let refilled = 0;
  for (const user of dueUsers) {
    const currentHearts = user.hearts ?? 0;
    const elapsed = now.getTime() - (user.heartsRefillAt?.getTime() ?? now.getTime());
    const heartsToAdd = Math.floor(elapsed / HEARTS.REFILL_INTERVAL_MS);

    if (heartsToAdd <= 0) continue;

    const newHearts = Math.min(HEARTS.MAX, currentHearts + heartsToAdd);
    const nextRefill = newHearts >= HEARTS.MAX
      ? null
      : new Date(now.getTime() + HEARTS.REFILL_INTERVAL_MS);

    await db
      .update(users)
      .set({
        hearts: newHearts,
        heartsRefillAt: nextRefill,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    refilled++;
  }

  await job.updateProgress(100);
  await job.log(`Refilled hearts for ${refilled} users`);
}
