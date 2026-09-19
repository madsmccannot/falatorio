import type { Job } from "bullmq";
import type { createDb } from "@fala-pt/db";
import { eq, and, sql, count, avg } from "drizzle-orm";
import { exercises, userProgress } from "@fala-pt/db/schema";

export interface QualityFlagData {
  minResponses: number;
  lowScoreThreshold: number;
}

export async function processQualityFlag(
  job: Job<QualityFlagData>,
  db: ReturnType<typeof createDb>,
): Promise<void> {
  const { minResponses = 10, lowScoreThreshold = 0.3 } = job.data;

  const flaggable = await db
    .select({
      exerciseId: userProgress.exerciseId,
      responseCount: count(userProgress.userId),
      avgScore: avg(userProgress.lastScore),
    })
    .from(userProgress)
    .groupBy(userProgress.exerciseId)
    .having(
      and(
        sql`count(${userProgress.userId}) >= ${minResponses}`,
        sql`avg(${userProgress.lastScore}) < ${lowScoreThreshold}`,
      ),
    );

  let flagged = 0;
  for (const row of flaggable) {
    const [exercise] = await db
      .select({ status: exercises.status })
      .from(exercises)
      .where(eq(exercises.id, row.exerciseId))
      .limit(1);

    if (exercise?.status === "live") {
      await db
        .update(exercises)
        .set({ status: "review", updatedAt: new Date() })
        .where(eq(exercises.id, row.exerciseId));
      flagged++;
    }
  }

  await job.updateProgress(100);
  await job.log(`Flagged ${flagged} exercises for review out of ${flaggable.length} candidates`);
}
