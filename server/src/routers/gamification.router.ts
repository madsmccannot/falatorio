import { eq, and, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  users,
  streaks,
  leagueEntries,
  achievements,
  transactions,
} from "@falatorio/db/schema";
import { LEAGUE, OURO } from "@falatorio/core";
import { checkStreak, recordActivity, ACHIEVEMENTS } from "@falatorio/core/gamification";
import { computeBalance, type Transaction } from "@falatorio/core/economy";
import { checkAndUnlockAchievements } from "../services/achievement-checker.service.js";
import * as lb from "../services/leaderboard.service.js";

export const gamificationRouter = t.router({
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const [streak] = await ctx.db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, ctx.user.userId))
      .limit(1);

    if (!streak) {
      return {
        currentDays: 0,
        longestDays: 0,
        freezeAvailable: false,
        isActive: false,
      };
    }

    const now = new Date();
    const timezone = "Europe/Lisbon";
    const result = checkStreak({
      currentDays: streak.currentDays,
      longestDays: streak.longestDays,
      lastActivityDate: streak.lastActivityDate,
      freezeAvailable: streak.freezeAvailable,
      freezeUsedToday: streak.freezeUsedToday,
    }, now, timezone);

    return {
      currentDays: result.streakDays,
      longestDays: result.longestDays,
      freezeAvailable: streak.freezeAvailable,
      isActive: !result.streakBroken,
    };
  }),

  recordDailyActivity: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date();
    const timezone = "Europe/Lisbon";
    const today = now.toLocaleDateString("en-CA", { timeZone: timezone });
    const [streak] = await ctx.db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, ctx.user.userId))
      .limit(1);

    if (!streak) {
      await ctx.db.insert(streaks).values({
        userId: ctx.user.userId,
        currentDays: 1,
        longestDays: 1,
        lastActivityDate: today,
      });

      await ctx.db
        .update(users)
        .set({ streakDays: 1, lastActivityAt: now, updatedAt: now })
        .where(eq(users.id, ctx.user.userId));

      return { currentDays: 1, isNew: true };
    }

    const updated = recordActivity(
      {
        currentDays: streak.currentDays,
        longestDays: streak.longestDays,
        lastActivityDate: streak.lastActivityDate,
        freezeAvailable: streak.freezeAvailable,
        freezeUsedToday: streak.freezeUsedToday,
      },
      now,
      timezone,
    );

    await ctx.db
      .update(streaks)
      .set({
        currentDays: updated.currentDays,
        longestDays: updated.longestDays,
        lastActivityDate: today,
        freezeUsedToday: false,
        updatedAt: now,
      })
      .where(eq(streaks.userId, ctx.user.userId));

    await ctx.db
      .update(users)
      .set({
        streakDays: updated.currentDays,
        longestStreak: updated.longestDays,
        lastActivityAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, ctx.user.userId));

    return { currentDays: updated.currentDays, isNew: false };
  }),

  purchaseStreakFreeze: protectedProcedure.mutation(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ type: transactions.type, amount: transactions.amount })
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.userId));

    const txs = rows.map((r) => ({
      type: r.type as Transaction["type"],
      amount: r.amount,
    }));

    const balance = computeBalance(txs);
    if (balance < OURO.COST_STREAK_FREEZE) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "insufficient_ouro",
      });
    }

    await ctx.db.insert(transactions).values({
      userId: ctx.user.userId,
      type: "spend",
      amount: -OURO.COST_STREAK_FREEZE,
      reason: "streak_freeze",
    });

    await ctx.db
      .update(streaks)
      .set({ freezeAvailable: true, updatedAt: new Date() })
      .where(eq(streaks.userId, ctx.user.userId));

    return { purchased: true, ouroSpent: OURO.COST_STREAK_FREEZE };
  }),

  getLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    const [myEntry] = await ctx.db
      .select()
      .from(leagueEntries)
      .where(eq(leagueEntries.userId, ctx.user.userId))
      .limit(1);

    if (!myEntry) {
      return { entries: [], myRank: null, tier: null };
    }

    const redisEntries = await lb.getTopN(
      ctx.redis,
      myEntry.leagueTier,
      myEntry.seasonWeek,
      LEAGUE.USERS_PER_LEAGUE,
    );

    if (redisEntries.length > 0) {
      const userIds = redisEntries.map((e) => e.userId);
      const userRows = await ctx.db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, userIds));
      const nameMap = new Map(userRows.map((u) => [u.id, u.name]));

      const myRank = await lb.getRank(
        ctx.redis,
        ctx.user.userId,
        myEntry.leagueTier,
        myEntry.seasonWeek,
      );

      return {
        entries: redisEntries.map((e, i) => ({
          rank: i + 1,
          userId: e.userId,
          name: nameMap.get(e.userId) ?? null,
          weeklyXp: e.xp,
        })),
        myRank,
        tier: myEntry.leagueTier,
      };
    }

    const entries = await ctx.db
      .select({
        userId: leagueEntries.userId,
        weeklyXp: leagueEntries.weeklyXp,
        userName: users.name,
      })
      .from(leagueEntries)
      .innerJoin(users, eq(leagueEntries.userId, users.id))
      .where(
        and(
          eq(leagueEntries.leagueTier, myEntry.leagueTier),
          eq(leagueEntries.seasonWeek, myEntry.seasonWeek),
        ),
      )
      .orderBy(desc(leagueEntries.weeklyXp))
      .limit(LEAGUE.USERS_PER_LEAGUE);

    await lb.syncFromDB(
      ctx.redis,
      entries.map((e) => ({
        userId: e.userId,
        weeklyXp: e.weeklyXp,
        leagueTier: myEntry.leagueTier,
        seasonWeek: myEntry.seasonWeek,
      })),
    );

    const myRank = entries.findIndex((e) => e.userId === ctx.user.userId) + 1;

    return {
      entries: entries.map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        name: e.userName,
        weeklyXp: e.weeklyXp,
      })),
      myRank: myRank > 0 ? myRank : null,
      tier: myEntry.leagueTier,
    };
  }),

  getAchievements: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, ctx.user.userId));

    const unlockedIds = new Set(rows.map((r) => r.badgeId));

    return {
      unlocked: rows.map((r) => ({
        badgeId: r.badgeId,
        unlockedAt: r.unlockedAt,
      })),
      all: ACHIEVEMENTS.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        isUnlocked: unlockedIds.has(a.id),
      })),
    };
  }),

  checkAchievements: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await checkAndUnlockAchievements(ctx.db, ctx.user.userId);
    return {
      newlyUnlocked: result.newlyUnlocked,
      achievements: result.newlyUnlocked.map((id) => {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        return def
          ? { id: def.id, name: def.name, description: def.description, icon: def.icon }
          : { id, name: id, description: "", icon: "star" };
      }),
    };
  }),
});
