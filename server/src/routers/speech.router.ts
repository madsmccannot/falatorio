import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { exercises, exerciseKnowledge, skillEvidence } from "@falatorio/db/schema";
import { scoreSpeechAnswer } from "@falatorio/core/scoring";
import { EXERCISE_COGNITIVE_MAP } from "@falatorio/core";
import type { L1Code, ExerciseType } from "@falatorio/core";

export const speechRouter = t.router({
  transcribe: protectedProcedure
    .input(
      z.object({
        audioBase64: z.string().min(1).max(5_000_000),
        exerciseId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { transcribeAudio } = await import("../services/whisper.service.js");
      const transcription = await transcribeAudio(input.audioBase64);

      const [exercise] = await ctx.db
        .select({
          type: exercises.type,
          acceptedAnswers: exercises.acceptedAnswers,
          l1Tip: exercises.l1Tip,
        })
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) throw new TRPCError({ code: "NOT_FOUND" });

      const cognitiveLevel = EXERCISE_COGNITIVE_MAP[exercise.type as ExerciseType] ?? "recognition";

      const result = scoreSpeechAnswer(
        transcription,
        exercise.acceptedAnswers[0] ?? "",
        ctx.user.l1 as L1Code,
        cognitiveLevel,
      );

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
      }

      const l1Tip = exercise.l1Tip
        ? (exercise.l1Tip as Record<string, string>)[ctx.user.l1] ?? null
        : null;

      return {
        transcription,
        correct: result.correct,
        score: result.score,
        feedback: result.feedback,
        l1Tip: result.l1Tip ?? l1Tip,
        cognitiveLevel,
      };
    }),

  synthesize: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        speed: z.enum(["slow", "normal"]).default("normal"),
      }),
    )
    .mutation(async ({ input }) => {
      const { synthesizeSpeech } = await import("../services/tts.service.js");
      const audioUrl = await synthesizeSpeech(input.text, input.speed);
      return { audioUrl };
    }),
});
