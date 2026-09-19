import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/router.js";
import { protectedProcedure } from "../trpc/middleware.js";
import { conversationSessions } from "@fala-pt/db/schema";
import { EXPLAINS } from "@fala-pt/core";
import { isSuperActive } from "@fala-pt/core/entitlements";

export const conversationRouter = t.router({
  startSession: protectedProcedure
    .input(
      z.object({
        scenarioId: z.string().min(1).max(64),
        systemPrompt: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .insert(conversationSessions)
        .values({
          userId: ctx.user.userId,
          scenarioId: input.scenarioId,
          messages: [],
        })
        .returning({ id: conversationSessions.id });

      return { sessionId: session!.id };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        message: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, input.sessionId))
        .limit(1);

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.userId !== ctx.user.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { chatWithTutor } = await import("../services/llm.service.js");

      const messages = session.messages as Array<{
        role: string;
        content: string;
        timestamp: string;
      }>;

      messages.push({
        role: "user",
        content: input.message,
        timestamp: new Date().toISOString(),
      });

      const reply = await chatWithTutor(
        session.scenarioId,
        messages,
        ctx.user.l1,
      );

      messages.push({
        role: "assistant",
        content: reply.content,
        timestamp: new Date().toISOString(),
      });

      await ctx.db
        .update(conversationSessions)
        .set({
          messages,
          errorsExtracted: reply.errors.length > 0
            ? [...(session.errorsExtracted ?? []), ...reply.errors]
            : session.errorsExtracted,
        })
        .where(eq(conversationSessions.id, input.sessionId));

      return {
        reply: reply.content,
        errors: reply.errors,
      };
    }),

  completeSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .select()
        .from(conversationSessions)
        .where(eq(conversationSessions.id, input.sessionId))
        .limit(1);

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.userId !== ctx.user.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db
        .update(conversationSessions)
        .set({ completedAt: new Date() })
        .where(eq(conversationSessions.id, input.sessionId));

      return {
        totalMessages: (session.messages as unknown[]).length,
        errorsFound: session.errorsExtracted?.length ?? 0,
      };
    }),

  explainError: protectedProcedure
    .input(
      z.object({
        errorText: z.string().min(1).max(500),
        context: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dailyKey = `explains:${ctx.user.userId}:${new Date().toISOString().slice(0, 10)}`;
      const current = await ctx.redis.incr(dailyKey);

      if (current === 1) {
        await ctx.redis.expire(dailyKey, 86400);
      }

      const isSuper = ctx.user.tier === "super";
      const limit = isSuper ? EXPLAINS.SUPER_LIMIT : EXPLAINS.FREE_DAILY_LIMIT;

      if (current > limit) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "daily_explain_limit_reached",
        });
      }

      const { explainGrammarError } = await import("../services/llm.service.js");
      const explanation = await explainGrammarError(
        input.errorText,
        ctx.user.l1,
        input.context,
      );

      return {
        explanation,
        remaining: Math.max(0, limit - current),
      };
    }),
});
