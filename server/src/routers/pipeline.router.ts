import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import {
  exercises,
  exerciseKnowledge,
  knowledgeItems,
} from "@falatorio/db/schema";
import {
  CEFR_LEVELS,
  L1_CODES,
} from "@falatorio/core";
import {
  findCoverageGaps,
  runBatchGeneration,
  getExerciseBankStats,
} from "../services/batch-exercise-pipeline.service.js";
import { synthesizeSpeech } from "../services/tts.service.js";

function extractPtText(type: string, prompt: Record<string, unknown>): string | null {
  switch (type) {
    case "translate_pt_to_l1":
      return (prompt["sentence"] as string) ?? null;
    case "fill_blank": {
      const sentence = prompt["sentence"] as string | undefined;
      const options = prompt["options"] as string[] | undefined;
      const idx = prompt["correctIndex"] as number | undefined;
      if (!sentence || !options || idx == null) return null;
      return sentence.replace(/___/, options[idx] ?? "");
    }
    case "reorder_words":
      return (prompt["correctOrder"] as string) ?? null;
    case "listen_and_type":
      return (prompt["text"] as string) ?? null;
    case "speak_and_score":
      return (prompt["targetText"] as string) ?? null;
    default:
      return null;
  }
}

async function generateTtsForExercise(db: Database, exerciseId: string): Promise<void> {
  const [ex] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);

  if (!ex) return;

  const text = extractPtText(ex.type, ex.prompt as Record<string, unknown>);
  if (!text || text.length > 500) return;

  try {
    const [normalUrl, slowUrl] = await Promise.all([
      synthesizeSpeech(text, "normal"),
      synthesizeSpeech(text, "slow"),
    ]);

    await db
      .update(exercises)
      .set({ audioUrl: normalUrl, audioNativeUrl: slowUrl, updatedAt: new Date() })
      .where(eq(exercises.id, exerciseId));
  } catch {
    // TTS failure should not block approval
  }
}

export const pipelineRouter = t.router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getExerciseBankStats(ctx.db);
  }),

  getCoverageGaps: protectedProcedure
    .input(
      z.object({
        targetPerKI: z.number().int().min(1).max(50).default(10),
        cefrLevels: z.array(z.enum(CEFR_LEVELS)).optional(),
        domains: z.array(z.string()).optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const gaps = await findCoverageGaps(ctx.db, {
        targetExercisesPerKI: input?.targetPerKI ?? 10,
        cefrLevels: input?.cefrLevels,
        domains: input?.domains,
      });

      return {
        totalGaps: gaps.length,
        gaps: gaps.slice(0, 100).map((g) => ({
          knowledgeItemCode: g.knowledgeItemCode,
          skillCode: g.skillCode,
          cefrLevel: g.cefrLevel,
          currentCount: g.currentCount,
          targetCount: g.targetCount,
          missingTypes: g.missingTypes,
        })),
      };
    }),

  runBatch: protectedProcedure
    .input(
      z.object({
        targetPerKI: z.number().int().min(1).max(50).default(10),
        cefrLevels: z.array(z.enum(CEFR_LEVELS)).optional(),
        domains: z.array(z.string()).optional(),
        l1s: z.array(z.enum(L1_CODES)).optional(),
        dryRun: z.boolean().default(true),
        concurrency: z.number().int().min(1).max(10).default(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await runBatchGeneration(ctx.db, {
        targetExercisesPerKI: input.targetPerKI,
        cefrLevels: input.cefrLevels,
        domains: input.domains,
        l1s: input.l1s,
        dryRun: input.dryRun,
        concurrency: input.concurrency,
      });

      return result;
    }),

  reviewExercise: protectedProcedure
    .input(
      z.object({
        exerciseId: z.string().uuid(),
        action: z.enum(["approve", "reject", "edit"]),
        editedPrompt: z.record(z.unknown()).optional(),
        editedAnswers: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.action === "approve") {
        await ctx.db
          .update(exercises)
          .set({ status: "live", updatedAt: new Date() })
          .where(eq(exercises.id, input.exerciseId));

        generateTtsForExercise(ctx.db, input.exerciseId).catch(() => {});
      } else if (input.action === "reject") {
        await ctx.db
          .delete(exerciseKnowledge)
          .where(eq(exerciseKnowledge.exerciseId, input.exerciseId));
        await ctx.db
          .delete(exercises)
          .where(eq(exercises.id, input.exerciseId));
      } else if (input.action === "edit") {
        const updates: Record<string, unknown> = { updatedAt: new Date() };
        if (input.editedPrompt) updates["prompt"] = input.editedPrompt;
        if (input.editedAnswers) updates["acceptedAnswers"] = input.editedAnswers;
        await ctx.db
          .update(exercises)
          .set(updates as any)
          .where(eq(exercises.id, input.exerciseId));
      }

      return { success: true };
    }),

  getReviewQueue: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cefrLevel: z.enum(CEFR_LEVELS).optional(),
        domain: z.string().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const reviewExercises = await ctx.db
        .select()
        .from(exercises)
        .where(eq(exercises.status, "review"))
        .limit(input?.limit ?? 20);

      const exerciseIds = reviewExercises.map((e) => e.id);
      const links = exerciseIds.length > 0
        ? await ctx.db
            .select()
            .from(exerciseKnowledge)
            .where(sql`${exerciseKnowledge.exerciseId} = ANY(${exerciseIds})`)
        : [];

      const kiIds = [...new Set(links.map((l) => l.knowledgeItemId))];
      const kis = kiIds.length > 0
        ? await ctx.db
            .select()
            .from(knowledgeItems)
            .where(sql`${knowledgeItems.id} = ANY(${kiIds})`)
        : [];

      const kiMap = new Map(kis.map((ki) => [ki.id, ki]));
      const linkMap = new Map<string, string[]>();
      for (const l of links) {
        const arr = linkMap.get(l.exerciseId) ?? [];
        arr.push(l.knowledgeItemId);
        linkMap.set(l.exerciseId, arr);
      }

      return reviewExercises.map((e) => {
        const linkedKiIds = linkMap.get(e.id) ?? [];
        const linkedKis = linkedKiIds.map((id) => kiMap.get(id)).filter(Boolean);

        return {
          id: e.id,
          type: e.type,
          prompt: e.prompt,
          acceptedAnswers: e.acceptedAnswers,
          difficulty: e.difficulty,
          l1Tip: e.l1Tip,
          createdAt: e.createdAt,
          knowledgeItems: linkedKis.map((ki) => ({
            code: ki!.code,
            rule: ki!.rule,
            cefrLevel: ki!.cefrLevel,
          })),
        };
      });
    }),

  bulkApprove: protectedProcedure
    .input(
      z.object({
        exerciseIds: z.array(z.string().uuid()).min(1).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(exercises)
        .set({ status: "live", updatedAt: new Date() })
        .where(sql`${exercises.id} = ANY(${input.exerciseIds})`);

      Promise.allSettled(
        input.exerciseIds.map((id) => generateTtsForExercise(ctx.db, id)),
      ).catch(() => {});

      return { approved: input.exerciseIds.length };
    }),
});
