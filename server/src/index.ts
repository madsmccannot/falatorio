import Fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createDb } from "@fala-pt/db/client";
import Redis from "ioredis";
import { env } from "./env.js";
import { appRouter } from "./trpc/router.js";
import { createContextFactory } from "./trpc/context.js";

async function main() {
  const app = Fastify({
    maxParamLength: 5000,
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  const db = createDb(env.DATABASE_URL);
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  await redis.connect();

  const createContext = createContextFactory(db, redis);

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  const host = env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  await app.listen({ port: env.PORT, host });
  console.log(`Server running on ${host}:${env.PORT}`);

  const shutdown = async () => {
    console.log("Shutting down...");
    await app.close();
    await redis.quit();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
