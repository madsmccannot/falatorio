import { z } from "zod";
import { eq, and, lte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { users, exercises, userProgress, lessons } from "@fala-pt/db/schema";
import {
  HEARTS,
  CRYSTALS,
  LESSON,
  type Tier,
} from "@fala-pt/core";
import { scoreTextAnswer } from "@fala-pt/core/scoring";
import { scoreToRating } from "@fala-pt/core/fsrs";
import { schedule, createNewCard, type FSRSCard } from "@fala-pt/core/fsrs";
import { calculateXP } from "@fala-pt/core/gamification";
import { getLessonReward } from "@fala-pt/core/economy";

export const lessonRouter = t.router({
  startLesson: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({ hearts: users.hearts, tier: users.tier })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (user.tier === "free" && user.hearts !== null && user.hearts <= 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "out_of_hearts",
        });
      }

      const lessonExercises = await ctx.db
        .select()
        .from(exercises)
        .where(
          and(
            eq(exercises.lessonId, input.lessonId),
            eq(exercises.status, "live"),
          ),
        )
        .limit(LESSON.EXERCISES_PER_LESSON);

      if (lessonExercises.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No exercises found for this lesson",
        });
      }

      const sessionId = crypto.randomUUID();
      await ctx.redis.set(
        `session:${sessionId}`,
        JSON.stringify({
          userId: ctx.user.userId,
          lessonId: input.lessonId,
          exerciseIds: lessonExercises.map((e) => e.id),
          currentIndex: 0,
          correctCount: 0,
          incorrectCount: 0,
          xpEarned: 0,
          startedAt: new Date().toISOString(),
        }),
        "EX",
        3600,
      );

      return {
        sessionId,
        exercises: lessonExercises.map((e) => ({
          id: e.id,
          type: e.type,
          prompt: e.prompt,
          audioUrl: e.audioUrl,
          audioNativeUrl: e.audioNativeUrl,
          difficulty: e.difficulty,
        })),
        hearts: user.hearts,
      };
    }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        exerciseId: z.string().uuid(),
        answer: z.string().max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sessionRaw = await ctx.redis.get(`session:${input.sessionId}`);
      if (!sessionRaw) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session expired" });
      }
      const session = JSON.parse(sessionRaw) as {
        userId: string;
        lessonId: string;
        exerciseIds: string[];
        currentIndex: number;
        correctCount: number;
        incorrectCount: number;
        xpEarned: number;
        startedAt: string;
      };

      if (session.userId !== ctx.user.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [exercise] = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) throw new TRPCError({ code: "NOT_FOUND" });

      const result = scoreTextAnswer(input.answer, exercise.acceptedAnswers);

      const [user] = await ctx.db
        .select({ hearts: users.hearts, tier: users.tier, streakDays: users.streakDays })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      let heartsRemaining = user.hearts;
      let outOfHearts = false;

      if (!result.correct && user.tier === "free" && heartsRemaining !== null) {
        heartsRemaining = Math.max(0, heartsRemaining - 1);
        await ctx.db
          .update(users)
          .set({ hearts: heartsRemaining, updatedAt: new Date() })
          .where(eq(users.id, ctx.user.userId));

        if (heartsRemaining === 0) outOfHearts = true;
      }

      const rating = scoreToRating(result.score);
      const [existing] = await ctx.db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            eq(userProgress.exerciseId, input.exerciseId),
          ),
        )
        .limit(1);

      const card: FSRSCard = existing
        ? {
            stability: existing.stability,
            difficulty: existing.difficulty,
            lastReview: existing.lastReviewedAt ?? new Date(),
            nextReview: existing.nextReview,
            reps: existing.reps,
            lapses: existing.lapses,
          }
        : createNewCard();

      const scheduled = schedule(card, rating);

      if (existing) {
        await ctx.db
          .update(userProgress)
          .set({
            stability: scheduled.card.stability,
            difficulty: scheduled.card.difficulty,
            nextReview: scheduled.card.nextReview,
            reps: scheduled.card.reps,
            lapses: scheduled.card.lapses,
            lastScore: result.score,
            lastReviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userProgress.userId, ctx.user.userId),
              eq(userProgress.exerciseId, input.exerciseId),
            ),
          );
      } else {
        await ctx.db.insert(userProgress).values({
          userId: ctx.user.userId,
          exerciseId: input.exerciseId,
          stability: scheduled.card.stability,
          difficulty: scheduled.card.difficulty,
          nextReview: scheduled.card.nextReview,
          reps: scheduled.card.reps,
          lapses: scheduled.card.lapses,
          lastScore: result.score,
          lastReviewedAt: new Date(),
        });
      }

      session.currentIndex += 1;
      if (result.correct) session.correctCount += 1;
      else session.incorrectCount += 1;

      await ctx.redis.set(
        `session:${input.sessionId}`,
        JSON.stringify(session),
        "EX",
        3600,
      );

      const l1Tip = exercise.l1Tip
        ? (exercise.l1Tip as Record<string, string>)[ctx.user.l1] ?? null
        : null;

      return {
        correct: result.correct,
        score: result.score,
        feedback: result.feedback,
        matchedAnswer: result.matchedAnswer,
        heartsRemaining,
        outOfHearts,
        l1Tip,
      };
    }),

  completeLesson: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const sessionRaw = await ctx.redis.get(`session:${input.sessionId}`);
      if (!sessionRaw) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session expired" });
      }
      const session = JSON.parse(sessionRaw) as {
        userId: string;
        correctCount: number;
        incorrectCount: number;
        startedAt: string;
      };

      if (session.userId !== ctx.user.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const total = session.correctCount + session.incorrectCount;
      const accuracy = total > 0 ? session.correctCount / total : 0;
      const isPerfect = accuracy === 1;

      const [user] = await ctx.db
        .select({ streakDays: users.streakDays, totalXp: users.totalXp })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const xpResult = calculateXP({
        accuracy,
        streakDays: user.streakDays,
        isPerfect,
        isFirstOfDay: false,
        hasXPBoost: false,
      });

      const crystalReward = getLessonReward(isPerfect);

      await ctx.db
        .update(users)
        .set({
          totalXp: user.totalXp + xpResult.total,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.userId));

      await ctx.redis.del(`session:${input.sessionId}`);

      const passed = accuracy >= LESSON.PASS_THRESHOLD;

      return {
        passed,
        accuracy,
        xpEarned: xpResult.total,
        crystalsEarned: crystalReward.amount,
        isPerfect,
        xpBreakdown: xpResult,
      };
    }),
});
