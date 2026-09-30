import { gte, count } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import {
  users,
  skillMastery,
  userProgress,
} from "@falatorio/db/schema";

export interface CohortRetention {
  cohortDate: string;
  signups: number;
  d1: number;
  d7: number;
  d30: number;
  d1Rate: number;
  d7Rate: number;
  d30Rate: number;
}

export interface MasteryMetrics {
  totalUsers: number;
  usersWithMastery: number;
  avgMastery: number;
  avgSkillsMastered: number;
  distributionByLevel: Array<{ level: string; count: number }>;
}

export interface RetentionSummary {
  cohorts: CohortRetention[];
  mastery: MasteryMetrics;
  engagement: EngagementMetrics;
}

export interface EngagementMetrics {
  dau: number;
  wau: number;
  mau: number;
  avgSessionsPerUser: number;
  avgExercisesPerSession: number;
}

export async function computeCohortRetention(
  db: Database,
  daysBack: number = 30,
): Promise<CohortRetention[]> {
  const since = new Date();
  since.setDate(since.getDate() - daysBack - 30);

  const allUsers = await db
    .select({
      createdAt: users.createdAt,
      lastActivityAt: users.lastActivityAt,
    })
    .from(users)
    .where(gte(users.createdAt, since));

  const cohortMap = new Map<string, { signups: number; d1: number; d7: number; d30: number }>();

  for (const u of allUsers) {
    const cohortDate = u.createdAt.toISOString().slice(0, 10);
    const entry = cohortMap.get(cohortDate) ?? { signups: 0, d1: 0, d7: 0, d30: 0 };
    entry.signups++;

    if (u.lastActivityAt) {
      const diffMs = u.lastActivityAt.getTime() - u.createdAt.getTime();
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      if (diffDays >= 1) entry.d1++;
      if (diffDays >= 7) entry.d7++;
      if (diffDays >= 30) entry.d30++;
    }

    cohortMap.set(cohortDate, entry);
  }

  const cohorts: CohortRetention[] = [];
  for (const [cohortDate, data] of cohortMap) {
    cohorts.push({
      cohortDate,
      signups: data.signups,
      d1: data.d1,
      d7: data.d7,
      d30: data.d30,
      d1Rate: data.signups > 0 ? Math.round((data.d1 / data.signups) * 100) : 0,
      d7Rate: data.signups > 0 ? Math.round((data.d7 / data.signups) * 100) : 0,
      d30Rate: data.signups > 0 ? Math.round((data.d30 / data.signups) * 100) : 0,
    });
  }

  return cohorts.sort((a, b) => b.cohortDate.localeCompare(a.cohortDate));
}

export async function computeMasteryMetrics(
  db: Database,
): Promise<MasteryMetrics> {
  const [totalUsersResult] = await db.select({ count: count() }).from(users);
  const totalUsers = Number(totalUsersResult?.count ?? 0);

  const allMastery = await db
    .select({
      userId: skillMastery.userId,
      mastery: skillMastery.mastery,
    })
    .from(skillMastery);

  const userMasteryMap = new Map<string, number[]>();
  for (const row of allMastery) {
    const list = userMasteryMap.get(row.userId) ?? [];
    list.push(row.mastery);
    userMasteryMap.set(row.userId, list);
  }

  const usersWithMastery = userMasteryMap.size;
  let totalMastery = 0;
  let totalMasteredSkills = 0;
  for (const [, scores] of userMasteryMap) {
    for (const s of scores) totalMastery += s;
    totalMasteredSkills += scores.filter((s) => s >= 0.8).length;
  }

  const avgMastery = allMastery.length > 0
    ? Math.round((totalMastery / allMastery.length) * 1000) / 1000
    : 0;
  const avgSkillsMastered = usersWithMastery > 0
    ? Math.round((totalMasteredSkills / usersWithMastery) * 10) / 10
    : 0;

  const distRows = await db
    .select({
      level: users.cefrLevel,
      count: count(),
    })
    .from(users)
    .groupBy(users.cefrLevel);

  return {
    totalUsers,
    usersWithMastery,
    avgMastery,
    avgSkillsMastered,
    distributionByLevel: distRows.map((r) => ({
      level: r.level,
      count: Number(r.count),
    })),
  };
}

export async function computeEngagementMetrics(
  db: Database,
): Promise<EngagementMetrics> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dauResult] = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastActivityAt, dayAgo));

  const [wauResult] = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastActivityAt, weekAgo));

  const [mauResult] = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastActivityAt, monthAgo));

  const recentProgress = await db
    .select({
      userId: userProgress.userId,
      reviewedAt: userProgress.lastReviewedAt,
    })
    .from(userProgress)
    .where(gte(userProgress.lastReviewedAt, weekAgo));

  const userSessionMap = new Map<string, Map<string, number>>();
  for (const row of recentProgress) {
    if (!row.reviewedAt) continue;
    const day = row.reviewedAt.toISOString().slice(0, 10);
    const userMap = userSessionMap.get(row.userId) ?? new Map<string, number>();
    userMap.set(day, (userMap.get(day) ?? 0) + 1);
    userSessionMap.set(row.userId, userMap);
  }

  let totalSessions = 0;
  let totalExercises = 0;
  for (const [, dayMap] of userSessionMap) {
    totalSessions += dayMap.size;
    for (const [, cnt] of dayMap) totalExercises += cnt;
  }

  const activeUsers = userSessionMap.size;

  return {
    dau: Number(dauResult?.count ?? 0),
    wau: Number(wauResult?.count ?? 0),
    mau: Number(mauResult?.count ?? 0),
    avgSessionsPerUser: activeUsers > 0
      ? Math.round((totalSessions / activeUsers) * 10) / 10
      : 0,
    avgExercisesPerSession: totalSessions > 0
      ? Math.round((totalExercises / totalSessions) * 10) / 10
      : 0,
  };
}

export async function getRetentionSummary(
  db: Database,
  daysBack: number = 30,
): Promise<RetentionSummary> {
  const [cohorts, mastery, engagement] = await Promise.all([
    computeCohortRetention(db, daysBack),
    computeMasteryMetrics(db),
    computeEngagementMetrics(db),
  ]);

  return { cohorts, mastery, engagement };
}
