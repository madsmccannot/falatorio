import { eq, and, sql, lte, desc, inArray } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import {
  userProgress,
  exercises,
  exerciseKnowledge,
  knowledgeItems,
  skillMastery,
  skillEvidence,
} from "@falatorio/db/schema";
import { DAILY_REFRESH } from "@falatorio/core";

interface RefreshCandidate {
  exerciseId: string;
  score: number;
  source: "fsrs_due" | "low_mastery" | "recent_error";
}

export interface DailyRefreshResult {
  exerciseIds: string[];
  breakdown: {
    fsrsDue: number;
    lowMastery: number;
    recentErrors: number;
  };
  totalPool: number;
}

function getTimeCap(hour: number): number {
  if (hour < DAILY_REFRESH.MORNING_HOUR_END) {
    return DAILY_REFRESH.MORNING_CAP;
  }
  return DAILY_REFRESH.MAX_EXERCISES;
}

export async function buildDailyRefreshSession(
  db: Database,
  userId: string,
  timezoneOffsetMinutes: number = 0,
): Promise<DailyRefreshResult> {
  const now = new Date();
  const localHour = (now.getUTCHours() - Math.round(timezoneOffsetMinutes / 60) + 24) % 24;
  const cap = getTimeCap(localHour);

  const candidates: RefreshCandidate[] = [];
  const seen = new Set<string>();

  const fsrsDueRows = await db
    .select({
      exerciseId: userProgress.exerciseId,
      nextReview: userProgress.nextReview,
      stability: userProgress.stability,
    })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        lte(userProgress.nextReview, now),
      ),
    )
    .orderBy(userProgress.nextReview)
    .limit(cap * 3);

  for (const row of fsrsDueRows) {
    if (seen.has(row.exerciseId)) continue;
    const overdueMs = now.getTime() - new Date(row.nextReview).getTime();
    const overdueDays = overdueMs / (1000 * 60 * 60 * 24);
    const urgency = Math.min(1, overdueDays / DAILY_REFRESH.RECENCY_DECAY_DAYS);
    const stabilityPenalty = row.stability > 0 ? 1 / (1 + row.stability * 0.1) : 1;
    candidates.push({
      exerciseId: row.exerciseId,
      score: DAILY_REFRESH.FSRS_DUE_WEIGHT * (0.5 + urgency * 0.5) * stabilityPenalty,
      source: "fsrs_due",
    });
    seen.add(row.exerciseId);
  }

  const lowMasterySkills = await db
    .select({
      skillId: skillMastery.skillId,
      mastery: skillMastery.mastery,
      confidence: skillMastery.confidence,
    })
    .from(skillMastery)
    .where(
      and(
        eq(skillMastery.userId, userId),
        sql`${skillMastery.mastery} < ${DAILY_REFRESH.LOW_MASTERY_THRESHOLD}`,
      ),
    )
    .orderBy(skillMastery.mastery)
    .limit(20);

  if (lowMasterySkills.length > 0) {
    const skillIds = lowMasterySkills.map((s) => s.skillId);
    const skillKIs = await db
      .select({ id: knowledgeItems.id })
      .from(knowledgeItems)
      .where(inArray(knowledgeItems.skillId, skillIds));

    if (skillKIs.length > 0) {
      const kiIds = skillKIs.map((ki) => ki.id);
      const linkedExercises = await db
        .select({ exerciseId: exerciseKnowledge.exerciseId })
        .from(exerciseKnowledge)
        .where(inArray(exerciseKnowledge.knowledgeItemId, kiIds))
        .limit(cap * 3);

      const liveExercises = linkedExercises.length > 0
        ? await db
            .select({ id: exercises.id })
            .from(exercises)
            .where(
              and(
                inArray(exercises.id, linkedExercises.map((e) => e.exerciseId)),
                eq(exercises.status, "live"),
              ),
            )
        : [];

      const masteryMap = new Map(lowMasterySkills.map((s) => [s.skillId, s.mastery]));

      for (const ex of liveExercises) {
        if (seen.has(ex.id)) continue;
        const deficit = DAILY_REFRESH.LOW_MASTERY_THRESHOLD - (masteryMap.values().next().value ?? 0);
        candidates.push({
          exerciseId: ex.id,
          score: DAILY_REFRESH.LOW_MASTERY_WEIGHT * Math.max(0.3, deficit),
          source: "low_mastery",
        });
        seen.add(ex.id);
      }
    }
  }

  const recentErrors = await db
    .select({
      exerciseId: skillEvidence.exerciseId,
      errorScore: sql<number>`avg(${skillEvidence.score})`.as("error_score"),
      lastAt: sql<Date>`max(${skillEvidence.createdAt})`.as("last_at"),
    })
    .from(skillEvidence)
    .where(
      and(
        eq(skillEvidence.userId, userId),
        sql`${skillEvidence.score} < 0.5`,
        sql`${skillEvidence.exerciseId} IS NOT NULL`,
      ),
    )
    .groupBy(skillEvidence.exerciseId)
    .orderBy(desc(sql`max(${skillEvidence.createdAt})`))
    .limit(cap * 2);

  for (const row of recentErrors) {
    if (!row.exerciseId || seen.has(row.exerciseId)) continue;
    const daysSince = (now.getTime() - new Date(row.lastAt).getTime()) / (1000 * 60 * 60 * 24);
    const recency = Math.max(0, 1 - daysSince / DAILY_REFRESH.RECENCY_DECAY_DAYS);
    const severity = 1 - Number(row.errorScore);
    candidates.push({
      exerciseId: row.exerciseId,
      score: DAILY_REFRESH.RECENT_ERRORS_WEIGHT * recency * severity,
      source: "recent_error",
    });
    seen.add(row.exerciseId);
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = candidates.slice(0, cap);

  const breakdown = { fsrsDue: 0, lowMastery: 0, recentErrors: 0 };
  for (const c of selected) {
    if (c.source === "fsrs_due") breakdown.fsrsDue++;
    else if (c.source === "low_mastery") breakdown.lowMastery++;
    else breakdown.recentErrors++;
  }

  const exerciseIds = shuffleMixed(selected);

  return {
    exerciseIds,
    breakdown,
    totalPool: candidates.length,
  };
}

function shuffleMixed(candidates: RefreshCandidate[]): string[] {
  const bySource = new Map<string, RefreshCandidate[]>();
  for (const c of candidates) {
    const arr = bySource.get(c.source) ?? [];
    arr.push(c);
    bySource.set(c.source, arr);
  }

  const result: string[] = [];
  const sources = [...bySource.keys()];
  let idx = 0;

  while (result.length < candidates.length) {
    const source = sources[idx % sources.length]!;
    const arr = bySource.get(source)!;
    if (arr.length > 0) {
      result.push(arr.shift()!.exerciseId);
    }
    idx++;
    if ([...bySource.values()].every((a) => a.length === 0)) break;
  }

  return result;
}
