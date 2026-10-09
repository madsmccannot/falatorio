import { z } from "zod";
import { eq, and, sql, gt, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  users,
  exercises,
  userProgress,
  exerciseKnowledge,
  skillEvidence,
  knowledgeItems,
  skills,
  skillMastery,
  skillPrerequisites,
  lessons,
  lessonSkills,
  lessonCompletions,
  transactions,
} from "@falatorio/db/schema";
import { LESSON, EXERCISE_COGNITIVE_MAP, PRACTICE, DAILY_REFRESH } from "@falatorio/core";
import { runAdaptiveEngine, type AdaptiveEngineInput } from "@falatorio/core/lesson";
import { scoreTextAnswer } from "@falatorio/core/scoring";
import { scoreToRating } from "@falatorio/core/fsrs";
import { schedule, createNewCard, type FSRSCard } from "@falatorio/core/fsrs";
import { calculateXP } from "@falatorio/core/gamification";
import { getLessonReward } from "@falatorio/core/economy";
import type { ExerciseType, CognitiveLevel, CEFRLevel, MasteryScore, Skill } from "@falatorio/core";
import { explainExerciseError } from "../services/llm.service.js";
import { checkAndUnlockAchievements } from "../services/achievement-checker.service.js";
import { recalculateMasteryForKnowledgeItems } from "../services/mastery-recalculator.service.js";
import { buildDailyRefreshSession } from "../services/daily-refresh.service.js";
import { updateQuestProgress } from "../services/daily-quests.service.js";
import { EXPLAINS } from "@falatorio/core";

function exerciseToCognitiveLevel(exerciseType: string): CognitiveLevel {
  return EXERCISE_COGNITIVE_MAP[exerciseType as ExerciseType] ?? "recognition";
}

function highestCognitiveLevel(levels: CognitiveLevel[]): CognitiveLevel {
  const order: CognitiveLevel[] = [
    "recognition",
    "comprehension",
    "controlled_production",
    "transformation",
    "translation",
    "free_production",
    "communication",
  ];
  let maxIdx = 0;
  for (const level of levels) {
    const idx = order.indexOf(level);
    if (idx > maxIdx) maxIdx = idx;
  }
  return order[maxIdx]!;
}

type SessionType = "lesson" | "review" | "mistakes" | "daily_refresh";

interface LessonSession {
  userId: string;
  lessonId: string;
  exerciseIds: string[];
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  xpEarned: number;
  startedAt: string;
  cognitiveLevels: CognitiveLevel[];
  sessionType?: SessionType;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function formatExerciseForClient(
  e: typeof exercises.$inferSelect,
  knownWords: Set<string>,
) {
  const p = e.prompt as Record<string, unknown> | string;
  const text = typeof p === "string" ? p : (p["text"] as string ?? "");

  const glossary = typeof p === "object"
    ? (p["glossary"] as Record<string, string[]> | undefined) ?? undefined
    : undefined;

  const genderPairs = typeof p === "object"
    ? (p["genderPairs"] as Record<string, { g: "m" | "f"; alt: string }> | undefined) ?? undefined
    : undefined;

  const promptWords = text.match(/[\p{L}'-]+/gu) ?? [];
  const newWords = promptWords.filter(
    (w) => w.length > 2 && !knownWords.has(w.toLowerCase()),
  );
  const uniqueNew = [...new Set(newWords.map((w) => w.toLowerCase()))];

  return {
    id: e.id,
    type: e.type,
    prompt: text,
    options: typeof p === "object" ? (p["options"] as string[] | undefined) : undefined,
    pairs: typeof p === "object" ? (p["pairs"] as Array<{ left: string; right: string }> | undefined) : undefined,
    words: typeof p === "object" ? (p["words"] as string[] | undefined) : undefined,
    sentence: typeof p === "object" ? (p["sentence"] as string | undefined) : undefined,
    audioUrl: e.audioUrl,
    audioNativeUrl: e.audioNativeUrl,
    difficulty: e.difficulty,
    newWords: uniqueNew.length > 0 ? uniqueNew : undefined,
    glossary,
    genderPairs,
  };
}

async function buildKnownWords(
  db: any,
  userId: string,
) {
  const seenExerciseIds = await db
    .select({ exerciseId: userProgress.exerciseId })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const seenIds = new Set<string>(seenExerciseIds.map((r: { exerciseId: string }) => r.exerciseId));
  const knownWords = new Set<string>();

  if (seenIds.size > 0) {
    const seenExercises = await db
      .select({ prompt: exercises.prompt })
      .from(exercises)
      .where(inArray(exercises.id, [...seenIds]));

    for (const ex of seenExercises) {
      const p = ex.prompt as Record<string, unknown> | string;
      const raw = typeof p === "string" ? p : (p as Record<string, unknown>)["text"] as string ?? "";
      for (const w of raw.match(/[\p{L}'-]+/gu) ?? []) {
        knownWords.add(w.toLowerCase());
      }
    }
  }

  return knownWords;
}

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

      const [userData] = await ctx.db
        .select({ cefrLevel: users.cefrLevel })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      const allSkills = await ctx.db.select().from(skills);
      const prereqs = await ctx.db.select().from(skillPrerequisites);
      const userMasteryRows = await ctx.db
        .select()
        .from(skillMastery)
        .where(eq(skillMastery.userId, ctx.user.userId));

      const masteryScores: MasteryScore[] = userMasteryRows.map((m) => ({
        userId: m.userId,
        skillId: m.skillId,
        mastery: m.mastery,
        confidence: m.confidence,
        totalEvidence: m.totalEvidence,
        varietyScore: m.varietyScore,
        productionScore: m.productionScore,
        lastEvidenceAt: m.lastEvidenceAt,
      }));

      const fsrsDue = await ctx.db
        .select({ knowledgeItemId: exerciseKnowledge.knowledgeItemId })
        .from(userProgress)
        .innerJoin(exercises, eq(userProgress.exerciseId, exercises.id))
        .innerJoin(exerciseKnowledge, eq(exercises.id, exerciseKnowledge.exerciseId))
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            sql`${userProgress.nextReview} <= now()`,
          ),
        );

      const fsrsDueKIIds = fsrsDue.map((r) => r.knowledgeItemId);
      const fsrsDueSkillIds: string[] = [];
      if (fsrsDueKIIds.length > 0) {
        const kiSkills = await ctx.db
          .select({ skillId: knowledgeItems.skillId })
          .from(knowledgeItems)
          .where(inArray(knowledgeItems.id, fsrsDueKIIds));
        fsrsDueSkillIds.push(...new Set(kiSkills.map((r) => r.skillId)));
      }

      const recentErrors = await ctx.db
        .select({
          knowledgeItemId: skillEvidence.knowledgeItemId,
          errorCount: sql<number>`count(*) filter (where ${skillEvidence.score} < 0.5)`.as("error_count"),
          lastErrorAt: sql<Date>`max(${skillEvidence.createdAt})`.as("last_error"),
        })
        .from(skillEvidence)
        .where(eq(skillEvidence.userId, ctx.user.userId))
        .groupBy(skillEvidence.knowledgeItemId)
        .having(sql`count(*) filter (where ${skillEvidence.score} < 0.5) > 0`);

      const skillsTyped: Skill[] = allSkills.map((s) => ({
        id: s.id,
        code: s.code,
        domain: s.domain as Skill["domain"],
        name: s.name as Record<string, string>,
        description: s.description as Record<string, string> | null,
        cefrLevel: s.cefrLevel as CEFRLevel,
        sortOrder: s.sortOrder,
      }));

      const engineInput: AdaptiveEngineInput = {
        context: {
          userId: ctx.user.userId,
          l1: ctx.user.l1 as any,
          currentCEFR: (userData?.cefrLevel ?? "A1") as CEFRLevel,
          skillMastery: masteryScores,
          recentErrors: recentErrors.map((e) => ({
            knowledgeItemId: e.knowledgeItemId,
            errorCount: Number(e.errorCount),
            lastErrorAt: new Date(e.lastErrorAt),
          })),
          completedLessonIds: [],
        },
        allSkills: skillsTyped,
        prerequisites: prereqs.map((p) => ({
          skillId: p.skillId,
          prerequisiteId: p.prerequisiteId,
        })),
        fsrsReviewDueSkillIds: fsrsDueSkillIds,
      };

      const engineOutput = runAdaptiveEngine(engineInput);

      const recommendedSkillIds = new Set(
        engineOutput.recommendations
          .slice(0, LESSON.EXERCISES_PER_LESSON * 2)
          .map((r) => r.skillId),
      );

      let allLessonExercises = await ctx.db
        .select()
        .from(exercises)
        .where(
          and(
            eq(exercises.lessonId, input.lessonId),
            eq(exercises.status, "live"),
          ),
        );

      if (allLessonExercises.length === 0) {
        const lsRows = await ctx.db
          .select({ skillId: lessonSkills.skillId })
          .from(lessonSkills)
          .where(eq(lessonSkills.lessonId, input.lessonId));

        const lessonSkillIds = lsRows.map((r) => r.skillId);

        if (lessonSkillIds.length > 0) {
          const kiRows = await ctx.db
            .select({ id: knowledgeItems.id })
            .from(knowledgeItems)
            .where(inArray(knowledgeItems.skillId, lessonSkillIds));

          const kiIds = kiRows.map((r) => r.id);

          if (kiIds.length > 0) {
            const exLinks = await ctx.db
              .selectDistinct({ exerciseId: exerciseKnowledge.exerciseId })
              .from(exerciseKnowledge)
              .where(inArray(exerciseKnowledge.knowledgeItemId, kiIds));

            const bankIds = exLinks.map((r) => r.exerciseId);

            if (bankIds.length > 0) {
              allLessonExercises = await ctx.db
                .select()
                .from(exercises)
                .where(
                  and(
                    inArray(exercises.id, bankIds),
                    eq(exercises.status, "live"),
                  ),
                );
            }
          }
        }
      }

      if (allLessonExercises.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No exercises found for this lesson",
        });
      }

      const exerciseIds = allLessonExercises.map((e) => e.id);
      const exKnowledgeLinks = exerciseIds.length > 0
        ? await ctx.db
            .select()
            .from(exerciseKnowledge)
            .where(inArray(exerciseKnowledge.exerciseId, exerciseIds))
        : [];

      const exerciseSkillMap = new Map<string, Set<string>>();
      for (const link of exKnowledgeLinks) {
        const kiRow = await ctx.db
          .select({ skillId: knowledgeItems.skillId })
          .from(knowledgeItems)
          .where(eq(knowledgeItems.id, link.knowledgeItemId))
          .limit(1);
        if (kiRow[0]) {
          const existing = exerciseSkillMap.get(link.exerciseId) ?? new Set();
          existing.add(kiRow[0].skillId);
          exerciseSkillMap.set(link.exerciseId, existing);
        }
      }

      const prioritized: typeof allLessonExercises = [];
      const rest: typeof allLessonExercises = [];

      for (const ex of allLessonExercises) {
        const exSkills = exerciseSkillMap.get(ex.id);
        if (exSkills && [...exSkills].some((sid) => recommendedSkillIds.has(sid))) {
          prioritized.push(ex);
        } else {
          rest.push(ex);
        }
      }

      const lessonExercises = [
        ...prioritized,
        ...rest,
      ].slice(0, LESSON.EXERCISES_PER_LESSON);

      const cognitiveLevels = lessonExercises.map((e) =>
        exerciseToCognitiveLevel(e.type),
      );

      const sessionId = crypto.randomUUID();
      const session: LessonSession = {
        userId: ctx.user.userId,
        lessonId: input.lessonId,
        exerciseIds: lessonExercises.map((e) => e.id),
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels,
      };

      await ctx.redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        "EX",
        3600,
      );

      const knownWords = await buildKnownWords(ctx.db, ctx.user.userId);

      return {
        sessionId,
        exercises: lessonExercises.map((e) => formatExerciseForClient(e, knownWords)),
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
      const session = JSON.parse(sessionRaw) as LessonSession;

      if (session.userId !== ctx.user.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [exercise] = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) throw new TRPCError({ code: "NOT_FOUND" });

      const cognitiveLevel = exerciseToCognitiveLevel(exercise.type);
      const result = scoreTextAnswer(input.answer, exercise.acceptedAnswers, cognitiveLevel);

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

      const linkedKIs = await ctx.db
        .select({ knowledgeItemId: exerciseKnowledge.knowledgeItemId })
        .from(exerciseKnowledge)
        .where(eq(exerciseKnowledge.exerciseId, input.exerciseId));

      if (linkedKIs.length > 0) {
        await ctx.db.insert(skillEvidence).values(
          linkedKIs.map((ki) => ({
            userId: ctx.user.userId,
            knowledgeItemId: ki.knowledgeItemId,
            exerciseId: input.exerciseId,
            score: result.score,
            exerciseType: exercise.type,
          })),
        );

        await recalculateMasteryForKnowledgeItems(
          ctx.db,
          ctx.user.userId,
          linkedKIs.map((ki) => ki.knowledgeItemId),
        );
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
        warnings: result.warnings,
        heartsRemaining,
        outOfHearts,
        l1Tip,
        cognitiveLevel,
      };
    }),

  completeLesson: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const sessionRaw = await ctx.redis.get(`session:${input.sessionId}`);
      if (!sessionRaw) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session expired" });
      }
      const session = JSON.parse(sessionRaw) as LessonSession;

      if (session.userId !== ctx.user.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const total = session.correctCount + session.incorrectCount;
      const accuracy = total > 0 ? session.correctCount / total : 0;
      const isPerfect = accuracy === 1;

      const dominantLevel = session.cognitiveLevels.length > 0
        ? highestCognitiveLevel(session.cognitiveLevels)
        : undefined;

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
        cognitiveLevel: dominantLevel,
      });

      const isPractice = session.sessionType === "review" || session.sessionType === "mistakes" || session.sessionType === "daily_refresh";
      const passed = !isPractice || accuracy >= LESSON.PASS_THRESHOLD;
      const xpMultiplier = isPractice ? PRACTICE.REVIEW_XP_MULTIPLIER : 1;
      const finalXp = Math.round(xpResult.total * xpMultiplier);

      const ouroReward = isPractice ? { amount: 0 } : getLessonReward(isPerfect);

      let heartsEarned = 0;
      if (session.sessionType === "review" && passed) {
        const [userData] = await ctx.db
          .select({ hearts: users.hearts, tier: users.tier })
          .from(users)
          .where(eq(users.id, ctx.user.userId))
          .limit(1);

        if (userData && userData.tier === "free" && userData.hearts !== null && userData.hearts < 5) {
          heartsEarned = PRACTICE.HEART_REWARD_ON_REVIEW;
          await ctx.db
            .update(users)
            .set({
              hearts: Math.min(5, userData.hearts + heartsEarned),
              updatedAt: new Date(),
            })
            .where(eq(users.id, ctx.user.userId));
        }
      }

      await ctx.db
        .update(users)
        .set({
          totalXp: user.totalXp + finalXp,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.userId));

      if (passed && !isPractice) {
        const [existing] = await ctx.db
          .select()
          .from(lessonCompletions)
          .where(
            and(
              eq(lessonCompletions.userId, ctx.user.userId),
              eq(lessonCompletions.lessonId, session.lessonId),
            ),
          )
          .limit(1);

        if (existing) {
          await ctx.db
            .update(lessonCompletions)
            .set({
              bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
              attempts: existing.attempts + 1,
              lastCompletedAt: new Date(),
            })
            .where(
              and(
                eq(lessonCompletions.userId, ctx.user.userId),
                eq(lessonCompletions.lessonId, session.lessonId),
              ),
            );
        } else {
          await ctx.db.insert(lessonCompletions).values({
            userId: ctx.user.userId,
            lessonId: session.lessonId,
            bestAccuracy: accuracy,
            attempts: 1,
          });
        }
      }

      await ctx.redis.del(`session:${input.sessionId}`);

      const achievementResult = await checkAndUnlockAchievements(
        ctx.db,
        ctx.user.userId,
      );

      await updateQuestProgress(ctx.db, ctx.user.userId, "complete_lesson");
      await updateQuestProgress(ctx.db, ctx.user.userId, "earn_xp", finalXp);
      await updateQuestProgress(ctx.db, ctx.user.userId, "maintain_streak");
      if (isPerfect) {
        await updateQuestProgress(ctx.db, ctx.user.userId, "perfect_lesson");
      }
      if (session.sessionType === "review") {
        await updateQuestProgress(ctx.db, ctx.user.userId, "review_items", session.correctCount);
      }
      if (session.sessionType === "mistakes") {
        await updateQuestProgress(ctx.db, ctx.user.userId, "practice_mistakes", session.correctCount);
      }

      return {
        passed,
        accuracy,
        xpEarned: finalXp,
        ouroEarned: ouroReward.amount,
        isPerfect,
        xpBreakdown: xpResult,
        xpMultiplier,
        heartsEarned,
        sessionType: session.sessionType ?? "lesson",
        dominantCognitiveLevel: dominantLevel ?? null,
        newAchievements: achievementResult.newlyUnlocked,
      };
    }),

  startReviewSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const [user] = await ctx.db
        .select({ hearts: users.hearts, tier: users.tier })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const completedExercises = await ctx.db
        .select({
          exerciseId: userProgress.exerciseId,
        })
        .from(userProgress)
        .where(eq(userProgress.userId, ctx.user.userId));

      if (completedExercises.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "no_completed_exercises",
        });
      }

      const completedIds = completedExercises.map((r) => r.exerciseId);

      const reviewExercises = await ctx.db
        .select()
        .from(exercises)
        .where(
          and(
            inArray(exercises.id, completedIds),
            eq(exercises.status, "live"),
          ),
        );

      if (reviewExercises.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "no_review_exercises",
        });
      }

      const selected = shuffleArray(reviewExercises).slice(0, LESSON.EXERCISES_PER_LESSON);

      const cognitiveLevels = selected.map((e) =>
        exerciseToCognitiveLevel(e.type),
      );

      const sessionId = crypto.randomUUID();
      const session: LessonSession = {
        userId: ctx.user.userId,
        lessonId: "review",
        exerciseIds: selected.map((e) => e.id),
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels,
        sessionType: "review",
      };

      await ctx.redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        "EX",
        3600,
      );

      const knownWords = await buildKnownWords(ctx.db, ctx.user.userId);

      return {
        sessionId,
        exercises: selected.map((e) => formatExerciseForClient(e, knownWords)),
        hearts: user.hearts,
        xpMultiplier: PRACTICE.REVIEW_XP_MULTIPLIER,
      };
    }),

  startMistakesSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const [user] = await ctx.db
        .select({ hearts: users.hearts, tier: users.tier })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (user.tier === "free") {
        const dailyKey = `mistakes:${ctx.user.userId}:${new Date().toISOString().slice(0, 10)}`;
        const current = await ctx.redis.get(dailyKey);
        const count = current ? parseInt(current, 10) : 0;

        if (count >= PRACTICE.MISTAKES_DAILY_FREE) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "daily_mistakes_limit_reached",
          });
        }

        await ctx.redis.incr(dailyKey);
        if (count === 0) await ctx.redis.expire(dailyKey, 86400);
      }

      const mistakeExercises = await ctx.db
        .select({
          exerciseId: userProgress.exerciseId,
        })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            gt(userProgress.lapses, 0),
          ),
        );

      if (mistakeExercises.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "no_mistakes",
        });
      }

      const mistakeIds = mistakeExercises.map((r) => r.exerciseId);

      const exerciseRows = await ctx.db
        .select()
        .from(exercises)
        .where(
          and(
            inArray(exercises.id, mistakeIds),
            eq(exercises.status, "live"),
          ),
        );

      if (exerciseRows.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "no_mistakes",
        });
      }

      const selected = shuffleArray(exerciseRows).slice(0, LESSON.EXERCISES_PER_LESSON);

      const cognitiveLevels = selected.map((e) =>
        exerciseToCognitiveLevel(e.type),
      );

      const sessionId = crypto.randomUUID();
      const session: LessonSession = {
        userId: ctx.user.userId,
        lessonId: "mistakes",
        exerciseIds: selected.map((e) => e.id),
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels,
        sessionType: "mistakes",
      };

      await ctx.redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        "EX",
        3600,
      );

      const knownWords = await buildKnownWords(ctx.db, ctx.user.userId);

      const dailyKey = `mistakes:${ctx.user.userId}:${new Date().toISOString().slice(0, 10)}`;
      const usedRaw = await ctx.redis.get(dailyKey);
      const used = usedRaw ? parseInt(usedRaw, 10) : 0;

      return {
        sessionId,
        exercises: selected.map((e) => formatExerciseForClient(e, knownWords)),
        hearts: user.hearts,
        xpMultiplier: PRACTICE.REVIEW_XP_MULTIPLIER,
        dailyRemaining: user.tier === "super" ? -1 : Math.max(0, PRACTICE.MISTAKES_DAILY_FREE - used),
      };
    }),

  getMistakesCount: protectedProcedure
    .query(async ({ ctx }) => {
      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            gt(userProgress.lapses, 0),
          ),
        );

      const [user] = await ctx.db
        .select({ tier: users.tier })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      const dailyKey = `mistakes:${ctx.user.userId}:${new Date().toISOString().slice(0, 10)}`;
      const usedRaw = await ctx.redis.get(dailyKey);
      const used = usedRaw ? parseInt(usedRaw, 10) : 0;

      return {
        totalMistakes: Number(result?.count ?? 0),
        dailyUsed: used,
        dailyRemaining: user?.tier === "super" ? -1 : Math.max(0, PRACTICE.MISTAKES_DAILY_FREE - used),
      };
    }),

  hasCompletedLesson: protectedProcedure
    .query(async ({ ctx }) => {
      const [result] = await ctx.db
        .select({ count: sql<number>`count(*)`.as("count") })
        .from(userProgress)
        .where(eq(userProgress.userId, ctx.user.userId))
        .limit(1);

      return { hasCompleted: Number(result?.count ?? 0) > 0 };
    }),

  explainExercise: protectedProcedure
    .input(
      z.object({
        exerciseId: z.string().uuid(),
        userAnswer: z.string().max(2000),
        correctAnswer: z.string().max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dailyKey = `explains:${ctx.user.userId}:${new Date().toISOString().slice(0, 10)}`;
      const current = await ctx.redis.incr(dailyKey);
      if (current === 1) await ctx.redis.expire(dailyKey, 86400);

      const isSuper = ctx.user.tier === "super";
      const limit = isSuper ? EXPLAINS.SUPER_LIMIT : EXPLAINS.FREE_DAILY_LIMIT;

      if (current > limit) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "daily_explain_limit_reached",
        });
      }

      const [exercise] = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) throw new TRPCError({ code: "NOT_FOUND" });

      const linkedKIs = await ctx.db
        .select({
          code: knowledgeItems.code,
          rule: knowledgeItems.rule,
        })
        .from(exerciseKnowledge)
        .innerJoin(knowledgeItems, eq(exerciseKnowledge.knowledgeItemId, knowledgeItems.id))
        .where(eq(exerciseKnowledge.exerciseId, input.exerciseId))
        .limit(1);

      const ki = linkedKIs[0];

      const errorCountResult = await ctx.db
        .select({ lapses: userProgress.lapses })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, ctx.user.userId),
            eq(userProgress.exerciseId, input.exerciseId),
          ),
        )
        .limit(1);

      const errorCount = errorCountResult[0]?.lapses ?? 1;

      const explanation = await explainExerciseError(
        exercise.type,
        input.userAnswer,
        input.correctAnswer,
        ki?.rule ?? "",
        ctx.user.l1,
        ki?.code ?? exercise.id,
        errorCount,
      );

      return {
        explanation,
        remaining: Math.max(0, limit - current),
        knowledgeItemCode: ki?.code ?? null,
        errorCount,
      };
    }),

  startDailyRefresh: protectedProcedure
    .input(
      z.object({
        timezoneOffsetMinutes: z.number().int().min(-720).max(840).default(0),
      }).optional(),
    )
    .mutation(async ({ ctx, input }) => {
      const cooldownKey = `dailyrefresh:${ctx.user.userId}`;
      const lastRun = await ctx.redis.get(cooldownKey);
      if (lastRun) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "daily_refresh_cooldown",
        });
      }

      const [user] = await ctx.db
        .select({ hearts: users.hearts, tier: users.tier })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const refreshResult = await buildDailyRefreshSession(
        ctx.db,
        ctx.user.userId,
        input?.timezoneOffsetMinutes ?? 0,
      );

      if (refreshResult.exerciseIds.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "no_refresh_exercises",
        });
      }

      const exerciseRows = await ctx.db
        .select()
        .from(exercises)
        .where(
          and(
            inArray(exercises.id, refreshResult.exerciseIds),
            eq(exercises.status, "live"),
          ),
        );

      const exerciseMap = new Map(exerciseRows.map((e) => [e.id, e]));
      const ordered = refreshResult.exerciseIds
        .map((id) => exerciseMap.get(id))
        .filter((e): e is typeof exerciseRows[number] => !!e);

      if (ordered.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "no_refresh_exercises",
        });
      }

      const cognitiveLevels = ordered.map((e) =>
        exerciseToCognitiveLevel(e.type),
      );

      const sessionId = crypto.randomUUID();
      const session: LessonSession = {
        userId: ctx.user.userId,
        lessonId: "daily_refresh",
        exerciseIds: ordered.map((e) => e.id),
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        xpEarned: 0,
        startedAt: new Date().toISOString(),
        cognitiveLevels,
        sessionType: "daily_refresh",
      };

      await ctx.redis.set(
        `session:${sessionId}`,
        JSON.stringify(session),
        "EX",
        3600,
      );

      await ctx.redis.set(
        cooldownKey,
        "1",
        "EX",
        DAILY_REFRESH.COOLDOWN_HOURS * 3600,
      );

      const knownWords = await buildKnownWords(ctx.db, ctx.user.userId);

      return {
        sessionId,
        exercises: ordered.map((e) => formatExerciseForClient(e, knownWords)),
        hearts: user.hearts,
        xpMultiplier: PRACTICE.REVIEW_XP_MULTIPLIER,
        breakdown: refreshResult.breakdown,
        totalPool: refreshResult.totalPool,
      };
    }),

  openChest: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [node] = await ctx.db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.lessonId))
        .limit(1);

      if (!node || node.nodeType !== "chest") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "NOT_A_CHEST" });
      }

      const openedKey = `chest:${ctx.user.userId}:${input.lessonId}`;
      const alreadyOpened = await ctx.redis.get(openedKey);
      if (alreadyOpened) {
        return JSON.parse(alreadyOpened) as { type: string; amount: number; alreadyOpened: true };
      }

      const reward = node.rewardConfig as { type: string; amount: number } | null;
      if (!reward) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "CHEST_NO_REWARD" });
      }

      if (reward.type === "ouro") {
        await ctx.db.insert(transactions).values({
          userId: ctx.user.userId,
          type: "earn",
          amount: reward.amount,
          reason: "chest_reward",
        });
      } else if (reward.type === "xp_boost") {
        await ctx.redis.set(
          `xpboost:${ctx.user.userId}`,
          "1",
          "EX",
          reward.amount * 60,
        );
      } else if (reward.type === "streak_freeze") {
        await ctx.redis.set(
          `streakfreeze:${ctx.user.userId}`,
          String(reward.amount),
          "EX",
          86400,
        );
      }

      const result = { ...reward, alreadyOpened: false };
      await ctx.redis.set(openedKey, JSON.stringify(result), "EX", 86400 * 30);

      return result;
    }),
});
