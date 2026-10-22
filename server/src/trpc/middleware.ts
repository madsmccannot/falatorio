import { TRPCError } from "@trpc/server";
import { t } from "./trpc.js";

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

export const clerkIdGuard = t.middleware(async ({ ctx, next }) => {
  if (!ctx.clerkId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Valid Clerk token required" });
  }
  return next({ ctx: { ...ctx, clerkId: ctx.clerkId } });
});

export const clerkTokenProcedure = t.procedure.use(clerkIdGuard);

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

export const rateLimiter = (maxRequests: number, windowMs: number, scope?: string) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) return next();

    const key = scope
      ? `ratelimit:${scope}:${ctx.user.userId}`
      : `ratelimit:${ctx.user.userId}`;
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

export const ipRateLimiter = (maxRequests: number, windowMs: number, scope: string) =>
  t.middleware(async ({ ctx, next }) => {
    const ip = ctx.clientIp ?? "unknown";
    const key = `ratelimit:ip:${scope}:${ip}`;
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

export const spendLock = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) return next();
  const key = `lock:spend:${ctx.user.userId}`;
  const acquired = await ctx.redis.set(key, "1", "EX", 10, "NX");
  if (!acquired) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Transaction in progress" });
  }
  try {
    return await next();
  } finally {
    await ctx.redis.del(key);
  }
});

export const dailyCap = (freeLimit: number, superLimit: number, scope: string) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) return next();

    const limit = ctx.user.tier === "super" ? superLimit : freeLimit;
    if (!Number.isFinite(limit)) return next();

    const today = new Date().toISOString().slice(0, 10);
    const key = `dailycap:${scope}:${ctx.user.userId}:${today}`;
    const current = await ctx.redis.incr(key);
    if (current === 1) {
      await ctx.redis.expire(key, 86400);
    }
    if (current > limit) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Daily ${scope} limit reached (${limit})`,
      });
    }
    return next();
  });

export const protectedProcedure = t.procedure.use(authGuard);
export const superProcedure = t.procedure.use(authGuard).use(requireSuper);
