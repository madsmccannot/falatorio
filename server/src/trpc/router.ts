import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => shape,
});

export const appRouter = t.router({
  // Routers are merged here as they're implemented
  health: t.procedure.query(() => ({
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  })),
});

export type AppRouter = typeof appRouter;
