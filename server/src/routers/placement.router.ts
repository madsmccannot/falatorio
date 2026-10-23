import { z } from "zod";
import { eq, and, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/trpc.js";
import { protectedProcedure, rateLimiter } from "../trpc/middleware.js";
import {
  users,
  exercises,
  knowledgeItems,
  exerciseKnowledge,
  sections,
  lessonCompletions,
  lessons,
  units,
} from "@falatorio/db/schema";
import {
  CEFR_LEVELS,
  type CEFRLevel,
  type L1Code,
  getProfile,
} from "@falatorio/core";

const CEFR_INDEX: Record<CEFRLevel, number> = {
  A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5,
};

const ITEMS_PER_LEVEL = 3;
const MAX_PLACEMENT_ITEMS = 20;
const MIN_PLACEMENT_ITEMS = 8;
const CONSECUTIVE_WRONG_TO_STOP = 3;
const CONSECUTIVE_RIGHT_TO_ADVANCE = 2;

interface PlacementSession {
  userId: string;
  currentLevel: CEFRLevel;
  startingLevel: CEFRLevel;
  exerciseIds: string[];
  currentIndex: number;
  responses: Array<{ exerciseId: string; cefrLevel: CEFRLevel; correct: boolean }>;
  levelCorrect: Map<string, number>;
  levelTotal: Map<string, number>;
  consecutiveWrong: number;
  consecutiveRight: number;
  highestPassed: CEFRLevel;
  finished: boolean;
}

const sessions = new Map<string, PlacementSession>();

function cefrUp(level: CEFRLevel): CEFRLevel | null {
  const idx = CEFR_INDEX[level];
  return idx < 5 ? CEFR_LEVELS[idx + 1]! : null;
}

function cefrDown(level: CEFRLevel): CEFRLevel | null {
  const idx = CEFR_INDEX[level];
  return idx > 0 ? CEFR_LEVELS[idx - 1]! : null;
}

export const placementRouter = t.router({
  startPlacement: protectedProcedure
    .use(rateLimiter(5, 60_000, "placement:start"))
    .mutation(async ({ ctx }) => {
      const [user] = await ctx.db
        .select({ l1: users.l1, cefrLevel: users.cefrLevel })
        .from(users)
        .where(eq(users.id, ctx.user.userId))
        .limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const profile = getProfile(user.l1 as L1Code);
      const startingLevel = profile.transfer.startingCEFR;

      const allExercises = await ctx.db
        .select({
          id: exercises.id,
          type: exercises.type,
          prompt: exercises.prompt,
          difficulty: exercises.difficulty,
          cefrLevel: knowledgeItems.cefrLevel,
        })
        .from(exercises)
        .innerJoin(exerciseKnowledge, eq(exerciseKnowledge.exerciseId, exercises.id))
        .innerJoin(knowledgeItems, eq(knowledgeItems.id, exerciseKnowledge.knowledgeItemId))
        .where(eq(exercises.status, "live"))
        .orderBy(sql`RANDOM()`);

      const byLevel = new Map<CEFRLevel, typeof allExercises>();
      for (const level of CEFR_LEVELS) byLevel.set(level, []);
      for (const e of allExercises) {
        byLevel.get(e.cefrLevel as CEFRLevel)?.push(e);
      }

      const startIdx = CEFR_INDEX[startingLevel];
      const selected: typeof allExercises = [];
      for (let i = startIdx; i < CEFR_LEVELS.length && selected.length < MAX_PLACEMENT_ITEMS; i++) {
        const level = CEFR_LEVELS[i]!;
        const pool = byLevel.get(level) ?? [];
        selected.push(...pool.slice(0, ITEMS_PER_LEVEL));
      }
      for (let i = startIdx - 1; i >= 0 && selected.length < MAX_PLACEMENT_ITEMS; i--) {
        const level = CEFR_LEVELS[i]!;
        const pool = byLevel.get(level) ?? [];
        selected.push(...pool.slice(0, ITEMS_PER_LEVEL));
      }

      if (selected.length === 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No exercises available for placement test",
        });
      }

      const session: PlacementSession = {
        userId: ctx.user.userId,
        currentLevel: startingLevel,
        startingLevel,
        exerciseIds: selected.map((e) => e.id),
        currentIndex: 0,
        responses: [],
        levelCorrect: new Map(),
        levelTotal: new Map(),
        consecutiveWrong: 0,
        consecutiveRight: 0,
        highestPassed: startingLevel === "A1" ? "A1" : (cefrDown(startingLevel) ?? "A1"),
        finished: false,
      };

      sessions.set(ctx.user.userId, session);

      const firstBatch = selected
        .filter((e) => e.cefrLevel === startingLevel)
        .slice(0, ITEMS_PER_LEVEL);

      return {
        startingLevel,
        totalItems: selected.length,
        exercises: firstBatch.map((e) => ({
          id: e.id,
          type: e.type,
          prompt: e.prompt,
          difficulty: e.difficulty,
          cefrLevel: e.cefrLevel,
        })),
      };
    }),

  submitPlacementAnswer: protectedProcedure
    .use(rateLimiter(60, 60_000, "placement:answer"))
    .input(
      z.object({
        exerciseId: z.string().uuid(),
        correct: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = sessions.get(ctx.user.userId);
      if (!session || session.finished) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active placement session" });
      }

      const exerciseLevel = await ctx.db
        .select({ cefrLevel: knowledgeItems.cefrLevel })
        .from(exerciseKnowledge)
        .innerJoin(knowledgeItems, eq(knowledgeItems.id, exerciseKnowledge.knowledgeItemId))
        .where(eq(exerciseKnowledge.exerciseId, input.exerciseId))
        .limit(1);

      const cefrLevel = (exerciseLevel[0]?.cefrLevel ?? session.currentLevel) as CEFRLevel;

      session.responses.push({
        exerciseId: input.exerciseId,
        cefrLevel,
        correct: input.correct,
      });

      session.levelCorrect.set(cefrLevel, (session.levelCorrect.get(cefrLevel) ?? 0) + (input.correct ? 1 : 0));
      session.levelTotal.set(cefrLevel, (session.levelTotal.get(cefrLevel) ?? 0) + 1);

      if (input.correct) {
        session.consecutiveRight++;
        session.consecutiveWrong = 0;
        if (CEFR_INDEX[cefrLevel] >= CEFR_INDEX[session.highestPassed]) {
          session.highestPassed = cefrLevel;
        }
      } else {
        session.consecutiveWrong++;
        session.consecutiveRight = 0;
      }

      session.currentIndex++;

      let shouldFinish = false;
      let nextLevel = session.currentLevel;

      if (session.consecutiveWrong >= CONSECUTIVE_WRONG_TO_STOP) {
        shouldFinish = true;
      } else if (session.currentIndex >= MAX_PLACEMENT_ITEMS) {
        shouldFinish = true;
      } else if (session.consecutiveRight >= CONSECUTIVE_RIGHT_TO_ADVANCE) {
        const up = cefrUp(session.currentLevel);
        if (up) {
          nextLevel = up;
          session.currentLevel = up;
          session.consecutiveRight = 0;
        } else {
          shouldFinish = true;
        }
      } else if (session.consecutiveWrong >= 2 && session.currentIndex >= MIN_PLACEMENT_ITEMS) {
        shouldFinish = true;
      }

      if (shouldFinish) {
        session.finished = true;
        return {
          finished: true,
          nextExercises: [],
          currentLevel: session.currentLevel,
          progress: session.currentIndex,
          total: session.exerciseIds.length,
        };
      }

      const remaining = await ctx.db
        .select({
          id: exercises.id,
          type: exercises.type,
          prompt: exercises.prompt,
          difficulty: exercises.difficulty,
          cefrLevel: knowledgeItems.cefrLevel,
        })
        .from(exercises)
        .innerJoin(exerciseKnowledge, eq(exerciseKnowledge.exerciseId, exercises.id))
        .innerJoin(knowledgeItems, eq(knowledgeItems.id, exerciseKnowledge.knowledgeItemId))
        .where(
          and(
            eq(exercises.status, "live"),
            eq(knowledgeItems.cefrLevel, nextLevel),
            sql`${exercises.id} NOT IN (${sql.join(
              session.responses.map((r) => sql`${r.exerciseId}`),
              sql`, `,
            )})`,
          ),
        )
        .orderBy(sql`RANDOM()`)
        .limit(ITEMS_PER_LEVEL);

      return {
        finished: false,
        nextExercises: remaining.map((e) => ({
          id: e.id,
          type: e.type,
          prompt: e.prompt,
          difficulty: e.difficulty,
          cefrLevel: e.cefrLevel,
        })),
        currentLevel: nextLevel,
        progress: session.currentIndex,
        total: session.exerciseIds.length,
      };
    }),

  completePlacement: protectedProcedure
    .use(rateLimiter(5, 60_000, "placement:complete"))
    .mutation(async ({ ctx }) => {
      const session = sessions.get(ctx.user.userId);
      if (!session) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No placement session" });
      }

      let estimatedLevel: CEFRLevel = session.highestPassed;

      for (const level of [...CEFR_LEVELS].reverse()) {
        const correct = session.levelCorrect.get(level) ?? 0;
        const total = session.levelTotal.get(level) ?? 0;
        if (total >= 2 && correct / total >= 0.6) {
          estimatedLevel = level;
          break;
        }
      }

      await ctx.db
        .update(users)
        .set({ cefrLevel: estimatedLevel, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.userId));

      const levelIdx = CEFR_INDEX[estimatedLevel];
      let skippedSections = 0;

      if (levelIdx > 0) {
        const sectionsToSkip = await ctx.db
          .select({ id: sections.id, cefrMax: sections.cefrMax })
          .from(sections)
          .where(sql`${sections.active} = true`);

        for (const sec of sectionsToSkip) {
          const secMaxIdx = CEFR_INDEX[sec.cefrMax as CEFRLevel] ?? 0;
          if (secMaxIdx < levelIdx) {
            const unitRows = await ctx.db
              .select({ id: units.id })
              .from(units)
              .where(eq(units.sectionId, sec.id));

            const unitIds = unitRows.map((u) => u.id);
            if (unitIds.length === 0) continue;

            const allLessons = await ctx.db
              .select({ id: lessons.id })
              .from(lessons)
              .where(inArray(lessons.unitId, unitIds));

            if (allLessons.length === 0) continue;

            const now = new Date();
            const values = allLessons.map((l) => ({
              userId: ctx.user.userId,
              lessonId: l.id,
              bestAccuracy: 1.0,
              attempts: 1,
              firstCompletedAt: now,
              lastCompletedAt: now,
            }));

            await ctx.db
              .insert(lessonCompletions)
              .values(values)
              .onConflictDoNothing();

            skippedSections++;
          }
        }
      }

      const levelBreakdown: Record<string, { correct: number; total: number }> = {};
      for (const level of CEFR_LEVELS) {
        const correct = session.levelCorrect.get(level) ?? 0;
        const total = session.levelTotal.get(level) ?? 0;
        if (total > 0) {
          levelBreakdown[level] = { correct, total };
        }
      }

      sessions.delete(ctx.user.userId);

      return {
        estimatedLevel,
        confidence: session.responses.length >= MIN_PLACEMENT_ITEMS ? "high" : "medium",
        totalQuestions: session.responses.length,
        skippedSections,
        levelBreakdown,
      };
    }),
});
