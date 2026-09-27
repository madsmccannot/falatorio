import { eq, sql, and, desc, isNotNull, count, countDistinct } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import {
  users,
  achievements,
  skillMastery,
  skillEvidence,
  skills,
  conversationSessions,
  leagueEntries,
  userProgress,
} from "@falatorio/db/schema";
import { checkAchievements, type UserStats } from "@falatorio/core/gamification";
import type { SkillDomain } from "@falatorio/core";

const MASTERY_THRESHOLD = 0.8;
const VARIETY_THRESHOLD = 0.5;
const MIN_EVIDENCE = 5;

export interface AchievementCheckResult {
  newlyUnlocked: string[];
}

export async function checkAndUnlockAchievements(
  db: Database,
  userId: string,
): Promise<AchievementCheckResult> {
  const [stats, alreadyUnlocked] = await Promise.all([
    gatherUserStats(db, userId),
    getUnlockedBadges(db, userId),
  ]);

  const newlyUnlocked = checkAchievements(stats, alreadyUnlocked);

  if (newlyUnlocked.length > 0) {
    await db.insert(achievements).values(
      newlyUnlocked.map((badgeId) => ({
        userId,
        badgeId,
      })),
    ).onConflictDoNothing();
  }

  return { newlyUnlocked };
}

async function getUnlockedBadges(
  db: Database,
  userId: string,
): Promise<Set<string>> {
  const rows = await db
    .select({ badgeId: achievements.badgeId })
    .from(achievements)
    .where(eq(achievements.userId, userId));
  return new Set(rows.map((r) => r.badgeId));
}

async function gatherUserStats(
  db: Database,
  userId: string,
): Promise<UserStats> {
  const [
    userRow,
    masteryRows,
    evidenceStats,
    exerciseTypeStats,
    conversationStats,
    leagueRow,
    lessonStats,
    productionStats,
    accuracyRows,
  ] = await Promise.all([
    db.select({
      cefrLevel: users.cefrLevel,
      streakDays: users.streakDays,
      longestStreak: users.longestStreak,
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((r) => r[0]),

    db.select({
      skillId: skillMastery.skillId,
      mastery: skillMastery.mastery,
      totalEvidence: skillMastery.totalEvidence,
      varietyScore: skillMastery.varietyScore,
      domain: skills.domain,
    })
      .from(skillMastery)
      .innerJoin(skills, eq(skillMastery.skillId, skills.id))
      .where(eq(skillMastery.userId, userId)),

    db.select({
      totalEvidence: count(),
      distinctKIs: countDistinct(skillEvidence.knowledgeItemId),
    })
      .from(skillEvidence)
      .where(eq(skillEvidence.userId, userId))
      .then((r) => r[0]),

    db.select({
      exerciseType: skillEvidence.exerciseType,
      cnt: count(),
    })
      .from(skillEvidence)
      .where(eq(skillEvidence.userId, userId))
      .groupBy(skillEvidence.exerciseType),

    db.select({
      total: count(),
      scenarios: sql<string[]>`array_agg(distinct ${conversationSessions.scenarioId})`.as("scenarios"),
    })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.userId, userId),
          isNotNull(conversationSessions.completedAt),
        ),
      )
      .then((r) => r[0]),

    db.select({ leagueTier: leagueEntries.leagueTier })
      .from(leagueEntries)
      .where(eq(leagueEntries.userId, userId))
      .orderBy(desc(leagueEntries.seasonWeek))
      .limit(1)
      .then((r) => r[0]),

    db.select({
      totalLessons: count(),
      perfectLessons: sql<number>`count(*) filter (where ${userProgress.lastScore} = 1)`.as("perfect"),
    })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .then((r) => r[0]),

    db.select({
      cnt: count(),
    })
      .from(skillEvidence)
      .where(
        and(
          eq(skillEvidence.userId, userId),
          sql`${skillEvidence.exerciseType} in ('fill_blank', 'translate_l1_to_pt', 'translate_pt_to_l1', 'speak_and_score')`,
        ),
      )
      .then((r) => r[0]),

    db.select({
      score: userProgress.lastScore,
    })
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastReviewedAt))
      .limit(20),
  ]);

  const skillsMastered = masteryRows.filter(
    (r) =>
      r.mastery >= MASTERY_THRESHOLD &&
      r.varietyScore >= VARIETY_THRESHOLD &&
      r.totalEvidence >= MIN_EVIDENCE,
  ).length;

  const domainSet = new Set(masteryRows.filter((r) => r.totalEvidence > 0).map((r) => r.domain));

  const masteredByDomain = new Map<string, { mastered: number; total: number }>();
  for (const row of masteryRows) {
    const entry = masteredByDomain.get(row.domain) ?? { mastered: 0, total: 0 };
    entry.total += 1;
    if (
      row.mastery >= MASTERY_THRESHOLD &&
      row.varietyScore >= VARIETY_THRESHOLD &&
      row.totalEvidence >= MIN_EVIDENCE
    ) {
      entry.mastered += 1;
    }
    masteredByDomain.set(row.domain, entry);
  }

  const masteredDomains: SkillDomain[] = [];
  for (const [domain, { mastered, total }] of masteredByDomain) {
    if (total > 0 && mastered === total) {
      masteredDomains.push(domain as SkillDomain);
    }
  }

  const withEvidence = masteryRows.filter((r) => r.totalEvidence > 0);
  const averageMastery =
    withEvidence.length > 0
      ? withEvidence.reduce((sum, r) => sum + r.mastery, 0) / withEvidence.length
      : 0;

  const exerciseTypeMap = new Map(exerciseTypeStats.map((r) => [r.exerciseType, Number(r.cnt)]));
  const freeProductionCount =
    (exerciseTypeMap.get("translate_l1_to_pt") ?? 0) +
    (exerciseTypeMap.get("translate_pt_to_l1") ?? 0);

  const accuracyLast20 =
    accuracyRows.length > 0
      ? accuracyRows.reduce((sum, r) => sum + (r.score ?? 0), 0) / accuracyRows.length
      : 0;

  const scenarios = conversationStats?.scenarios ?? [];
  const filteredScenarios = Array.isArray(scenarios)
    ? scenarios.filter((s): s is string => typeof s === "string" && s !== null)
    : [];

  return {
    lessonsCompleted: Number(lessonStats?.totalLessons ?? 0),
    perfectLessons: Number(lessonStats?.perfectLessons ?? 0),
    streakDays: userRow?.streakDays ?? 0,
    longestStreak: userRow?.longestStreak ?? 0,
    wordsLearned: Number(evidenceStats?.distinctKIs ?? 0),
    hoursSpent: 0,
    conversationsCompleted: Number(conversationStats?.total ?? 0),
    leagueTier: leagueRow?.leagueTier ?? "bronze",
    cefrLevel: userRow?.cefrLevel ?? "A1",
    scenariosCompleted: filteredScenarios,
    skillsMastered,
    knowledgeItemsLearned: Number(evidenceStats?.distinctKIs ?? 0),
    productionExercisesCompleted: Number(productionStats?.cnt ?? 0),
    domainsCovered: domainSet.size,
    masteredDomains,
    averageMastery,
    evidenceCount: Number(evidenceStats?.totalEvidence ?? 0),
    distinctExerciseTypes: exerciseTypeStats.length,
    highestCognitiveLevel: deriveHighestCognitive(exerciseTypeStats.map((r) => r.exerciseType)),
    accuracyLast20,
    freeProductionPassed: freeProductionCount,
    communicationPassed: Number(conversationStats?.total ?? 0),
  };
}

const COGNITIVE_ORDER = [
  "recognition",
  "comprehension",
  "controlled_production",
  "transformation",
  "translation",
  "free_production",
  "communication",
];

const EXERCISE_TO_COGNITIVE: Record<string, string> = {
  match_pairs: "recognition",
  pick_correct: "recognition",
  listen_and_type: "comprehension",
  fill_blank: "controlled_production",
  reorder_words: "transformation",
  translate_l1_to_pt: "translation",
  translate_pt_to_l1: "translation",
  speak_and_score: "controlled_production",
};

function deriveHighestCognitive(exerciseTypes: string[]): string {
  let highest = "recognition";
  for (const et of exerciseTypes) {
    const cog = EXERCISE_TO_COGNITIVE[et] ?? "recognition";
    if (COGNITIVE_ORDER.indexOf(cog) > COGNITIVE_ORDER.indexOf(highest)) {
      highest = cog;
    }
  }
  return highest;
}
