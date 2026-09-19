import type { Job } from "bullmq";
import type { createDb } from "@fala-pt/db";
import { eq, and } from "drizzle-orm";
import { leagueEntries } from "@fala-pt/db/schema";
import { LEAGUE_TIERS, type LeagueTier } from "@fala-pt/core";
import { calculatePromotions, type LeagueEntry } from "@fala-pt/core/gamification";

export interface LeagueResetData {
  seasonWeek: string;
}

export async function processLeagueReset(
  job: Job<LeagueResetData>,
  db: ReturnType<typeof createDb>,
): Promise<void> {
  const { seasonWeek } = job.data;

  for (const tier of LEAGUE_TIERS) {
    const entries = await db
      .select({
        id: leagueEntries.id,
        userId: leagueEntries.userId,
        weeklyXp: leagueEntries.weeklyXp,
        leagueTier: leagueEntries.leagueTier,
      })
      .from(leagueEntries)
      .where(
        and(
          eq(leagueEntries.leagueTier, tier),
          eq(leagueEntries.seasonWeek, seasonWeek),
        ),
      );

    if (entries.length === 0) continue;

    const leagueEntryList: LeagueEntry[] = entries.map((e) => ({
      userId: e.userId,
      weeklyXP: e.weeklyXp,
      tier,
    }));

    const results = calculatePromotions(leagueEntryList);
    const tierIndex = LEAGUE_TIERS.indexOf(tier);
    const nextWeek = getNextWeek(seasonWeek);

    for (const result of results) {
      let newTier: LeagueTier = tier;

      if (result.action === "promote" && tierIndex < LEAGUE_TIERS.length - 1) {
        newTier = LEAGUE_TIERS[tierIndex + 1]!;
      } else if (result.action === "demote" && tierIndex > 0) {
        newTier = LEAGUE_TIERS[tierIndex - 1]!;
      }

      await db.insert(leagueEntries).values({
        userId: result.userId,
        leagueTier: newTier,
        weeklyXp: 0,
        seasonWeek: nextWeek,
      });
    }
  }

  await job.updateProgress(100);
}

function getNextWeek(seasonWeek: string): string {
  const [year, week] = seasonWeek.split("-W").map(Number);
  if (!year || !week) return seasonWeek;
  const nextWeek = week + 1;
  if (nextWeek > 52) return `${year + 1}-W01`;
  return `${year}-W${String(nextWeek).padStart(2, "0")}`;
}
