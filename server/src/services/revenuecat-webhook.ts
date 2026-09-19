import { eq } from "drizzle-orm";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { users } from "@fala-pt/db/schema";
import { env } from "../env.js";
import type { createDb } from "@fala-pt/db";

type RevenueCatEvent =
  | { type: "INITIAL_PURCHASE"; app_user_id: string; product_id: string; expiration_at_ms: number }
  | { type: "RENEWAL"; app_user_id: string; product_id: string; expiration_at_ms: number }
  | { type: "CANCELLATION"; app_user_id: string; product_id: string }
  | { type: "EXPIRATION"; app_user_id: string; product_id: string }
  | { type: string; app_user_id: string; product_id?: string; expiration_at_ms?: number };

interface WebhookBody {
  api_version: string;
  event: RevenueCatEvent;
}

export function registerRevenueCatWebhook(
  app: FastifyInstance,
  db: ReturnType<typeof createDb>,
): void {
  app.post(
    "/webhooks/revenuecat",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      if (!env.REVENUECAT_WEBHOOK_SECRET) {
        return reply.status(501).send({ error: "Webhook not configured" });
      }
      if (authHeader !== `Bearer ${env.REVENUECAT_WEBHOOK_SECRET}`) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const body = request.body as WebhookBody;
      const event = body.event;

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, event.app_user_id))
        .limit(1);

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      switch (event.type) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
          await db
            .update(users)
            .set({
              tier: "super",
              tierExpiresAt: new Date(event.expiration_at_ms),
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
          break;

        case "CANCELLATION":
          break;

        case "EXPIRATION":
          await db
            .update(users)
            .set({
              tier: "free",
              tierExpiresAt: null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));
          break;
      }

      return reply.status(200).send({ received: true });
    },
  );
}
