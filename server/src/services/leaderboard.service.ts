import type Redis from "ioredis";

function leaderboardKey(tier: string, seasonWeek: string): string {
  return `leaderboard:${tier}:${seasonWeek}`;
}

export async function recordXP(
  redis: Redis,
  userId: string,
  tier: string,
  seasonWeek: string,
  xpDelta: number,
): Promise<number> {
  const key = leaderboardKey(tier, seasonWeek);
  const newScore = await redis.zincrby(key, xpDelta, userId);
  await redis.expire(key, 8 * 24 * 60 * 60);
  return Number(newScore);
}

export async function setXP(
  redis: Redis,
  userId: string,
  tier: string,
  seasonWeek: string,
  totalXp: number,
): Promise<void> {
  const key = leaderboardKey(tier, seasonWeek);
  await redis.zadd(key, totalXp, userId);
  await redis.expire(key, 8 * 24 * 60 * 60);
}

export async function getTopN(
  redis: Redis,
  tier: string,
  seasonWeek: string,
  n: number,
): Promise<{ userId: string; xp: number }[]> {
  const key = leaderboardKey(tier, seasonWeek);
  const results = await redis.zrevrange(key, 0, n - 1, "WITHSCORES");

  const entries: { userId: string; xp: number }[] = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      userId: results[i]!,
      xp: Number(results[i + 1]!),
    });
  }
  return entries;
}

export async function getRank(
  redis: Redis,
  userId: string,
  tier: string,
  seasonWeek: string,
): Promise<number | null> {
  const key = leaderboardKey(tier, seasonWeek);
  const rank = await redis.zrevrank(key, userId);
  return rank !== null ? rank + 1 : null;
}

export async function getScore(
  redis: Redis,
  userId: string,
  tier: string,
  seasonWeek: string,
): Promise<number | null> {
  const key = leaderboardKey(tier, seasonWeek);
  const score = await redis.zscore(key, userId);
  return score !== null ? Number(score) : null;
}

export async function removeUser(
  redis: Redis,
  userId: string,
  tier: string,
  seasonWeek: string,
): Promise<void> {
  const key = leaderboardKey(tier, seasonWeek);
  await redis.zrem(key, userId);
}

export async function getLeaderboardSize(
  redis: Redis,
  tier: string,
  seasonWeek: string,
): Promise<number> {
  const key = leaderboardKey(tier, seasonWeek);
  return redis.zcard(key);
}

export async function syncFromDB(
  redis: Redis,
  entries: { userId: string; weeklyXp: number; leagueTier: string; seasonWeek: string }[],
): Promise<void> {
  const pipeline = redis.pipeline();
  for (const entry of entries) {
    const key = leaderboardKey(entry.leagueTier, entry.seasonWeek);
    pipeline.zadd(key, entry.weeklyXp, entry.userId);
    pipeline.expire(key, 8 * 24 * 60 * 60);
  }
  await pipeline.exec();
}
