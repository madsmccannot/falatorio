import { z } from "zod";
import { eq, and, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  users,
  leagueEntries,
  achievements,
  lessonCompletions,
  userFollows,
} from "@falatorio/db/schema";
import { USER_GOALS, CEFR_LEVELS } from "@falatorio/core";

export const userRouter = t.router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) throw new Error("User not found");

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      email: user.email,
      l1: user.l1,
      cefrLevel: user.cefrLevel,
      goal: user.goal,
      timezone: user.timezone,
      dailyGoalMin: user.dailyGoalMin,
      tier: user.tier,
      tierExpiresAt: user.tierExpiresAt,
      hearts: user.hearts,
      heartsRefillAt: user.heartsRefillAt,
      streakDays: user.streakDays,
      longestStreak: user.longestStreak,
      totalXp: user.totalXp,
      adConsent: user.adConsent,
      createdAt: user.createdAt,
    };
  }),

  getPublicProfile: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatarUrl: users.avatarUrl,
          l1: users.l1,
          cefrLevel: users.cefrLevel,
          streakDays: users.streakDays,
          longestStreak: users.longestStreak,
          totalXp: users.totalXp,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const [leagueRow] = await ctx.db
        .select({ leagueTier: leagueEntries.leagueTier })
        .from(leagueEntries)
        .where(eq(leagueEntries.userId, input.userId))
        .orderBy(sql`${leagueEntries.createdAt} DESC`)
        .limit(1);

      const [completionCount] = await ctx.db
        .select({ count: count() })
        .from(lessonCompletions)
        .where(eq(lessonCompletions.userId, input.userId));

      const [achievementCount] = await ctx.db
        .select({ count: count() })
        .from(achievements)
        .where(eq(achievements.userId, input.userId));

      const [followingCount] = await ctx.db
        .select({ count: count() })
        .from(userFollows)
        .where(eq(userFollows.followerId, input.userId));

      const [followerCount] = await ctx.db
        .select({ count: count() })
        .from(userFollows)
        .where(eq(userFollows.followingId, input.userId));

      const [isFollowing] = await ctx.db
        .select({ followerId: userFollows.followerId })
        .from(userFollows)
        .where(
          and(
            eq(userFollows.followerId, ctx.user.userId),
            eq(userFollows.followingId, input.userId),
          ),
        )
        .limit(1);

      return {
        ...user,
        leagueTier: leagueRow?.leagueTier ?? "bronze",
        lessonsCompleted: completionCount?.count ?? 0,
        achievementCount: achievementCount?.count ?? 0,
        followingCount: followingCount?.count ?? 0,
        followerCount: followerCount?.count ?? 0,
        isFollowing: !!isFollowing,
      };
    }),

  follow: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_follow_self" });
      }

      const [target] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!target) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db
        .insert(userFollows)
        .values({
          followerId: ctx.user.userId,
          followingId: input.userId,
        })
        .onConflictDoNothing();

      return { followed: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userFollows)
        .where(
          and(
            eq(userFollows.followerId, ctx.user.userId),
            eq(userFollows.followingId, input.userId),
          ),
        );

      return { unfollowed: true };
    }),

  getFollowing: protectedProcedure
    .input(z.object({ userId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const targetId = input.userId ?? ctx.user.userId;
      const rows = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatarUrl: users.avatarUrl,
          l1: users.l1,
          totalXp: users.totalXp,
          streakDays: users.streakDays,
        })
        .from(userFollows)
        .innerJoin(users, eq(userFollows.followingId, users.id))
        .where(eq(userFollows.followerId, targetId));

      return rows;
    }),

  getFollowers: protectedProcedure
    .input(z.object({ userId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const targetId = input.userId ?? ctx.user.userId;
      const rows = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          avatarUrl: users.avatarUrl,
          l1: users.l1,
          totalXp: users.totalXp,
          streakDays: users.streakDays,
        })
        .from(userFollows)
        .innerJoin(users, eq(userFollows.followerId, users.id))
        .where(eq(userFollows.followingId, targetId));

      return rows;
    }),

  getGlobalStats: protectedProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers] = await ctx.db
      .select({ count: count() })
      .from(users);

    const [activeUsers] = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.lastActivityAt} >= ${sevenDaysAgo}`);

    const [totalLessonsCompleted] = await ctx.db
      .select({ count: count() })
      .from(lessonCompletions);

    const [totalXp] = await ctx.db
      .select({ total: sql<number>`COALESCE(SUM(${users.totalXp}), 0)::int` })
      .from(users);

    return {
      totalUsers: totalUsers?.count ?? 0,
      activeUsersLast7d: activeUsers?.count ?? 0,
      totalLessonsCompleted: totalLessonsCompleted?.count ?? 0,
      totalXpEarned: totalXp?.total ?? 0,
    };
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        avatarUrl: z.string().url().max(2048).optional().nullable(),
        timezone: z.string().max(64).optional(),
        dailyGoalMin: z.number().int().min(5).max(60).optional(),
        goal: z.enum(USER_GOALS).optional(),
        adConsent: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.name !== undefined) updates["name"] = input.name;
      if (input.avatarUrl !== undefined) updates["avatarUrl"] = input.avatarUrl;
      if (input.timezone !== undefined) updates["timezone"] = input.timezone;
      if (input.dailyGoalMin !== undefined) updates["dailyGoalMin"] = input.dailyGoalMin;
      if (input.goal !== undefined) updates["goal"] = input.goal;
      if (input.adConsent !== undefined) updates["adConsent"] = input.adConsent;

      await ctx.db
        .update(users)
        .set(updates)
        .where(eq(users.id, ctx.user.userId));

      return { updated: true };
    }),

  updateCEFR: protectedProcedure
    .input(z.object({ level: z.enum(CEFR_LEVELS) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ cefrLevel: input.level, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));

      return { level: input.level };
    }),
});
