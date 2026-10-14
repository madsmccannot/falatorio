import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { Database } from "@falatorio/db/client";
import type Redis from "ioredis";

const GOOGLE_KEYS_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";
const KEYS_CACHE_TTL = 86_400_000;

interface GoogleKey {
  keyId: number;
  pem: string;
  base64: string;
}

let cachedKeys: Map<number, GoogleKey> | null = null;
let keysCachedAt = 0;

async function fetchGoogleKeys(): Promise<Map<number, GoogleKey>> {
  if (cachedKeys && Date.now() - keysCachedAt < KEYS_CACHE_TTL) {
    return cachedKeys;
  }

  const res = await fetch(GOOGLE_KEYS_URL);
  if (!res.ok) throw new Error(`Failed to fetch AdMob keys: ${res.status}`);

  const data = (await res.json()) as { keys: Array<{ keyId: number; pem: string; base64: string }> };
  const map = new Map<number, GoogleKey>();
  for (const k of data.keys) {
    map.set(k.keyId, k);
  }

  cachedKeys = map;
  keysCachedAt = Date.now();
  return map;
}

function verifySignature(
  queryString: string,
  signature: string,
  keyId: number,
  keys: Map<number, GoogleKey>,
): boolean {
  const key = keys.get(keyId);
  if (!key) return false;

  const parts = queryString.split("&").filter(
    (p) => !p.startsWith("signature=") && !p.startsWith("key_id="),
  );
  const message = parts.join("&");

  const signatureBuffer = Buffer.from(signature, "base64");
  const verifier = crypto.createVerify("SHA256");
  verifier.update(message);

  return verifier.verify(key.pem, signatureBuffer);
}

export function registerAdMobSSV(
  app: FastifyInstance,
  _db: Database,
  redis: Redis,
) {
  app.get("/callbacks/admob-ssv", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const {
      signature,
      key_id: keyIdStr,
      ad_network: _adNetwork,
      ad_unit: _adUnit,
      custom_data: customData,
      reward_amount: _rewardAmount,
      reward_item: rewardItem,
      transaction_id: transactionId,
    } = query;

    if (!signature || !keyIdStr || !customData || !transactionId) {
      return reply.status(400).send({ error: "Missing required parameters" });
    }

    const keyId = parseInt(keyIdStr, 10);
    if (isNaN(keyId)) {
      return reply.status(400).send({ error: "Invalid key_id" });
    }

    try {
      const keys = await fetchGoogleKeys();
      const rawQuery = (request.url.split("?")[1] ?? "");
      const valid = verifySignature(rawQuery, signature, keyId, keys);

      if (!valid) {
        return reply.status(403).send({ error: "Invalid signature" });
      }
    } catch {
      return reply.status(500).send({ error: "Key verification failed" });
    }

    const dedupeKey = `admob:txn:${transactionId}`;
    const already = await redis.get(dedupeKey);
    if (already) {
      return reply.status(200).send({ status: "already_processed" });
    }

    await redis.set(dedupeKey, "1", "EX", 86_400);

    let userId: string;
    try {
      const parsed = JSON.parse(customData) as { userId?: string };
      userId = parsed.userId ?? "";
    } catch {
      userId = customData;
    }

    if (!userId) {
      return reply.status(400).send({ error: "Missing userId in custom_data" });
    }

    const verifiedKey = `admob:verified:${userId}:${transactionId}`;
    await redis.set(verifiedKey, rewardItem ?? "reward", "EX", 300);

    return reply.status(200).send({ status: "ok" });
  });
}
