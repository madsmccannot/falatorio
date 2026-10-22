import { z } from "zod";
import { t } from "../trpc/trpc.js";
import { protectedProcedure, rateLimiter, dailyCap } from "../trpc/middleware.js";
import { AI_BUDGET } from "@falatorio/core";

export const speechRouter = t.router({
  synthesize: protectedProcedure
    .use(dailyCap(AI_BUDGET.SPEECH_DAILY_FREE, AI_BUDGET.SPEECH_DAILY_SUPER, "speech"))
    .use(rateLimiter(20, 60_000, "speech:synthesize"))
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
