import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { exercises } from "@fala-pt/db/schema";
import { scoreSpeechAnswer } from "@fala-pt/core/scoring";
import type { L1Code } from "@fala-pt/core";

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
          acceptedAnswers: exercises.acceptedAnswers,
          l1Tip: exercises.l1Tip,
        })
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (!exercise) throw new TRPCError({ code: "NOT_FOUND" });

      const result = scoreSpeechAnswer(
        transcription,
        exercise.acceptedAnswers[0] ?? "",
        ctx.user.l1 as L1Code,
      );

      const l1Tip = exercise.l1Tip
        ? (exercise.l1Tip as Record<string, string>)[ctx.user.l1] ?? null
        : null;

      return {
        transcription,
        correct: result.correct,
        score: result.score,
        feedback: result.feedback,
        l1Tip: result.l1Tip ?? l1Tip,
      };
    }),

  synthesize: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        speed: z.enum(["slow", "normal"]).default("normal"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { synthesizeSpeech } = await import("../services/tts.service.js");
      const audioUrl = await synthesizeSpeech(input.text, input.speed);
      return { audioUrl };
    }),
});
