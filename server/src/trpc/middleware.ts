import { TRPCError } from "@trpc/server";
import { t } from "./router.js";

export const authGuard = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({
    ctx: { ...ctx, user: ctx.user },
  });
});

export const requireSuper = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.user.tier !== "super") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Super subscription required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const rateLimiter = (maxRequests: number, windowMs: number) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) return next();

    const key = `ratelimit:${ctx.user.userId}`;
    const current = await ctx.redis.incr(key);
    if (current === 1) {
      await ctx.redis.pexpire(key, windowMs);
    }
    if (current > maxRequests) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
      });
    }
    return next();
  });

export const protectedProcedure = t.procedure.use(authGuard);
export const superProcedure = t.procedure.use(authGuard).use(requireSuper);
