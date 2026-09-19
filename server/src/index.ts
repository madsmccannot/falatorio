import Fastify from "fastify";
import helmet from "@fastify/helmet";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createDb } from "@fala-pt/db/client";
import Redis from "ioredis";
import { env } from "./env.js";
import { appRouter } from "./trpc/router.js";
import { createContextFactory } from "./trpc/context.js";
import { registerRevenueCatWebhook } from "./services/revenuecat-webhook.js";
import { shutdownQueues, createWorker, QUEUE_NAMES } from "./jobs/queue.js";
import { processHeartRefill } from "./jobs/heart-refill.job.js";
import { processSubscriptionCheck } from "./jobs/subscription-check.job.js";
import { processQualityFlag } from "./jobs/quality-flag.job.js";
import { processStreakReminder } from "./jobs/streak-reminder.job.js";
import { processLeagueReset } from "./jobs/league-reset.job.js";
import { processGenerateExercises } from "./jobs/generate-exercises.job.js";

async function main() {
  const app = Fastify({
    maxParamLength: 5000,
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  await app.register(helmet, { contentSecurityPolicy: false });

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

  registerRevenueCatWebhook(app, db);

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  createWorker(QUEUE_NAMES.HEART_REFILL, (job) => processHeartRefill(job, db), redis);
  createWorker(QUEUE_NAMES.SUBSCRIPTION_CHECK, (job) => processSubscriptionCheck(job, db), redis);
  createWorker(QUEUE_NAMES.QUALITY_FLAG, (job) => processQualityFlag(job, db), redis);
  createWorker(QUEUE_NAMES.STREAK_REMINDER, (job) => processStreakReminder(job, db, redis), redis);
  createWorker(QUEUE_NAMES.LEAGUE_RESET, (job) => processLeagueReset(job, db), redis);
  createWorker(QUEUE_NAMES.EXERCISES, (job) => processGenerateExercises(job, db), redis);

  const host = env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  await app.listen({ port: env.PORT, host });
  console.log(`Server running on ${host}:${env.PORT}`);

  const shutdown = async () => {
    console.log("Shutting down...");
    await shutdownQueues();
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
