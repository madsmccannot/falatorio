import { Queue, Worker, type Job, type Processor } from "bullmq";
import type Redis from "ioredis";

export const QUEUE_NAMES = {
  EXERCISES: "generate-exercises",
  LEAGUE_RESET: "league-reset",
  STREAK_REMINDER: "streak-reminder",
  QUALITY_FLAG: "quality-flag",
  HEART_REFILL: "heart-refill",
  SUBSCRIPTION_CHECK: "subscription-check",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();

export function getQueue(name: QueueName, connection: Redis): Queue {
  const existing = queues.get(name);
  if (existing) return existing;

  const queue = new Queue(name, { connection });
  queues.set(name, queue);
  return queue;
}

export function createWorker<T>(
  name: QueueName,
  processor: Processor<T>,
  connection: Redis,
  concurrency = 1,
): Worker<T> {
  const worker = new Worker<T>(name, processor, {
    connection,
    concurrency,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  });

  worker.on("failed", (job: Job<T> | undefined, err: Error) => {
    console.error(`Job ${job?.id} in ${name} failed:`, err.message);
  });

  workers.set(name, worker);
  return worker;
}

export async function shutdownQueues(): Promise<void> {
  const closes: Promise<void>[] = [];
  for (const worker of workers.values()) {
    closes.push(worker.close());
  }
  for (const queue of queues.values()) {
    closes.push(queue.close());
  }
  await Promise.all(closes);
}
