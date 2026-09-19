import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import type { Database } from "@fala-pt/db/client";
import type { Redis } from "ioredis";
import { verifyToken } from "@clerk/backend";
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
            const parsed = JSON.parse(cached) as UserContext;
            user = parsed;
          }
        }
      } catch {
        // Invalid token — user remains null (unauthenticated)
      }
    }

    return { db, redis, user };
  };
}
