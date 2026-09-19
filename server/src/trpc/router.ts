import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => shape,
});

import { authRouter } from "../routers/auth.router.js";
import { userRouter } from "../routers/user.router.js";
import { lessonRouter } from "../routers/lesson.router.js";
import { progressRouter } from "../routers/progress.router.js";
import { speechRouter } from "../routers/speech.router.js";
import { conversationRouter } from "../routers/conversation.router.js";
import { gamificationRouter } from "../routers/gamification.router.js";
import { contentRouter } from "../routers/content.router.js";
import { economyRouter } from "../routers/economy.router.js";
import { shopRouter } from "../routers/shop.router.js";
import { heartsRouter } from "../routers/hearts.router.js";
import { adsRouter } from "../routers/ads.router.js";

export const appRouter = t.router({
  health: t.procedure.query(() => ({
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  })),
  auth: authRouter,
  user: userRouter,
  lesson: lessonRouter,
  progress: progressRouter,
  speech: speechRouter,
  conversation: conversationRouter,
  gamification: gamificationRouter,
  content: contentRouter,
  economy: economyRouter,
  shop: shopRouter,
  hearts: heartsRouter,
  ads: adsRouter,
});

export type AppRouter = typeof appRouter;
