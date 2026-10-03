import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { Database } from "@falatorio/db/client";
import type { Redis } from "ioredis";
import { eq } from "drizzle-orm";
import { verifyToken } from "@clerk/backend";
import { users } from "@falatorio/db/schema";
import { env } from "../env.js";

export interface UserContext {
  userId: string;
  clerkId: string;
  tier: "free" | "super";
  l1: string;
}

export interface Context {
  db: Database;
  redis: Redis;
  user: UserContext | null;
}

const DEV_CLERK_ID = "dev_local_user";

async function getOrCreateDevUser(db: Database, redis: Redis): Promise<UserContext> {
  const cached = await redis.get(`user:${DEV_CLERK_ID}`);
  if (cached) return JSON.parse(cached) as UserContext;

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, DEV_CLERK_ID))
    .limit(1);

  if (existing) {
    const ctx: UserContext = {
      userId: existing.id,
      clerkId: DEV_CLERK_ID,
      tier: (existing.tier ?? "free") as "free" | "super",
      l1: existing.l1,
    };
    await redis.set(`user:${DEV_CLERK_ID}`, JSON.stringify(ctx), "EX", 86400);
    return ctx;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: DEV_CLERK_ID,
      email: "dev@falatorio.local",
      name: "Dev User",
      username: "devuser",
      l1: "hi",
    })
    .returning();

  const ctx: UserContext = {
    userId: created!.id,
    clerkId: DEV_CLERK_ID,
    tier: "free",
    l1: "hi",
  };
  await redis.set(`user:${DEV_CLERK_ID}`, JSON.stringify(ctx), "EX", 86400);
  return ctx;
}

export function createContextFactory(db: Database, redis: Redis) {
  return async function createContext({ req }: CreateFastifyContextOptions): Promise<Context> {
    let user: UserContext | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const payload = await verifyToken(token, {
          secretKey: env.CLERK_SECRET_KEY,
        });

        if (payload.sub) {
          const cached = await redis.get(`user:${payload.sub}`);
          if (cached) {
            user = JSON.parse(cached) as UserContext;
          } else {
            const [row] = await db
              .select()
              .from(users)
              .where(eq(users.clerkId, payload.sub))
              .limit(1);
            if (row) {
              user = {
                userId: row.id,
                clerkId: row.clerkId,
                tier: (row.tier ?? "free") as "free" | "super",
                l1: row.l1,
              };
              await redis.set(`user:${payload.sub}`, JSON.stringify(user), "EX", 86400);
            }
          }
        }
      } catch {
        // Invalid token — user remains null (unauthenticated)
      }
    }

    if (!user && env.NODE_ENV !== "production") {
      user = await getOrCreateDevUser(db, redis);
    }

    return { db, redis, user };
  };
}
