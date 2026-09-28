import { eq, and, sql } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import {
  skillEvidence,
  knowledgeItems,
  skillMastery,
} from "@falatorio/db/schema";
import { calculateMastery, type EvidenceEntry } from "@falatorio/core";

export async function recalculateMasteryForKnowledgeItems(
  db: Database,
  userId: string,
  knowledgeItemIds: string[],
): Promise<string[]> {
  if (knowledgeItemIds.length === 0) return [];

  const kis = await db
    .select({ id: knowledgeItems.id, skillId: knowledgeItems.skillId })
    .from(knowledgeItems)
    .where(sql`${knowledgeItems.id} = ANY(${knowledgeItemIds})`);

  const affectedSkillIds = [...new Set(kis.map((ki) => ki.skillId))];

  for (const skillId of affectedSkillIds) {
    const skillKIs = await db
      .select({ id: knowledgeItems.id })
      .from(knowledgeItems)
      .where(eq(knowledgeItems.skillId, skillId));

    const kiIds = skillKIs.map((ki) => ki.id);

    const evidenceRows = await db
      .select()
      .from(skillEvidence)
      .where(
        and(
          eq(skillEvidence.userId, userId),
          sql`${skillEvidence.knowledgeItemId} = ANY(${kiIds})`,
        ),
      )
      .orderBy(skillEvidence.createdAt);

    const entries: EvidenceEntry[] = evidenceRows.map((e) => ({
      id: e.id,
      userId: e.userId,
      knowledgeItemId: e.knowledgeItemId,
      exerciseId: e.exerciseId,
      score: e.score,
      exerciseType: e.exerciseType as EvidenceEntry["exerciseType"],
      createdAt: e.createdAt,
    }));

    const score = calculateMastery(userId, skillId, entries);

    await db
      .insert(skillMastery)
      .values({
        userId,
        skillId,
        mastery: score.mastery,
        confidence: score.confidence,
        totalEvidence: score.totalEvidence,
        varietyScore: score.varietyScore,
        productionScore: score.productionScore,
        lastEvidenceAt: score.lastEvidenceAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [skillMastery.userId, skillMastery.skillId],
        set: {
          mastery: score.mastery,
          confidence: score.confidence,
          totalEvidence: score.totalEvidence,
          varietyScore: score.varietyScore,
          productionScore: score.productionScore,
          lastEvidenceAt: score.lastEvidenceAt,
          updatedAt: new Date(),
        },
      });
  }

  return affectedSkillIds;
}
