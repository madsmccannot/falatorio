import type { Job } from "bullmq";
import type { createDb } from "@fala-pt/db";
import type Redis from "ioredis";
import { and, isNotNull, sql } from "drizzle-orm";
import { streaks } from "@fala-pt/db/schema";
import { sendPushNotification } from "../services/push.service.js";

export interface StreakReminderData {
  batchSize: number;
}

export async function processStreakReminder(
  job: Job<StreakReminderData>,
  db: ReturnType<typeof createDb>,
  redis: Redis,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const batchSize = job.data.batchSize || 100;

  const atRiskUsers = await db
    .select({
      userId: streaks.userId,
      currentDays: streaks.currentDays,
      lastActivityDate: streaks.lastActivityDate,
      freezeAvailable: streaks.freezeAvailable,
    })
    .from(streaks)
    .where(
      and(
        isNotNull(streaks.lastActivityDate),
        sql`${streaks.lastActivityDate} < ${today}`,
        sql`${streaks.currentDays} > 0`,
      ),
    )
    .limit(batchSize);

  let sent = 0;
  for (const streak of atRiskUsers) {
    const alreadySent = await redis.get(`streak_reminder:${streak.userId}:${today}`);
    if (alreadySent) continue;

    const fcmToken = await redis.get(`fcm_token:${streak.userId}`);
    if (!fcmToken) continue;

    const message = streak.currentDays >= 7
      ? `Don't lose your ${streak.currentDays}-day streak! Complete a lesson to keep it going.`
      : "Complete a quick lesson today to keep your streak alive!";

    const success = await sendPushNotification(fcmToken, {
      title: "Your streak is at risk! 🔥",
      body: message,
      data: { action: "open_lesson" },
    });

    if (success) {
      await redis.set(`streak_reminder:${streak.userId}:${today}`, "1", "EX", 86400);
      sent++;
    }
  }

  await job.updateProgress(100);
  await job.log(`Sent ${sent} streak reminders`);
}
