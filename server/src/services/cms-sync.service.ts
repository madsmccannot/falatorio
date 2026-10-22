import type { FastifyInstance } from "fastify";
import type { Database } from "@falatorio/db/client";
import { eq } from "drizzle-orm";
import { exercises, knowledgeItems, exerciseKnowledge } from "@falatorio/db/schema";

const CMS_SYNC_SECRET = process.env["CMS_SYNC_SECRET"] ?? "";

export function registerCmsSyncRoutes(app: FastifyInstance, db: Database) {
  app.addHook("onRequest", async (req, reply) => {
    if (!req.url.startsWith("/api/cms-sync/")) return;
    if (!CMS_SYNC_SECRET) {
      reply.code(503).send({ error: "CMS sync not configured" });
      return;
    }
    const secret = req.headers["x-cms-sync-secret"];
    if (secret !== CMS_SYNC_SECRET) {
      reply.code(401).send({ error: "Invalid sync secret" });
      return;
    }
  });

  app.post<{ Body: {
    id: string;
    lessonId: string;
    type: string;
    prompt: unknown;
    acceptedAnswers: unknown;
    difficulty: number;
    l1Tip?: unknown;
    glossary?: unknown;
    genderPairs?: unknown;
    audioUrl?: string;
    knowledgeItemIds?: string[];
    version?: number;
  } }>("/api/cms-sync/exercise", async (req, reply) => {
    const body = req.body;

    const [existing] = await db
      .select({ id: exercises.id })
      .from(exercises)
      .where(eq(exercises.id, body.id))
      .limit(1);

    const prompt = typeof body.prompt === "object" && body.prompt !== null
      ? { ...body.prompt as Record<string, unknown>, glossary: body.glossary, genderPairs: body.genderPairs }
      : body.prompt;

    if (existing) {
      await db
        .update(exercises)
        .set({
          type: body.type as any,
          prompt,
          acceptedAnswers: body.acceptedAnswers as any,
          difficulty: body.difficulty,
          l1Tip: body.l1Tip as any,
          audioUrl: body.audioUrl ?? null,
          status: "live",
        })
        .where(eq(exercises.id, body.id));
    } else {
      await db.insert(exercises).values({
        lessonId: body.lessonId,
        type: body.type as any,
        prompt,
        acceptedAnswers: body.acceptedAnswers as any,
        difficulty: body.difficulty,
        l1Tip: body.l1Tip as any,
        audioUrl: body.audioUrl ?? null,
        status: "live",
      });
    }

    if (body.knowledgeItemIds?.length) {
      for (const kiId of body.knowledgeItemIds) {
        await db
          .insert(exerciseKnowledge)
          .values({ exerciseId: body.id, knowledgeItemId: kiId })
          .onConflictDoNothing();
      }
    }

    reply.send({ synced: true, id: body.id });
  });

  app.post<{ Body: {
    id: string;
    skillId: string;
    code: string;
    cefrLevel: string;
    rule: string;
    examples?: unknown;
    counterexamples?: unknown;
    commonErrors?: unknown;
    shortExplanation?: unknown;
    l1Notes?: unknown;
    exerciseTypes?: string[];
    masteryCriteria?: unknown;
    version?: number;
  } }>("/api/cms-sync/knowledge-item", async (req, reply) => {
    const body = req.body;

    const [existing] = await db
      .select({ id: knowledgeItems.id })
      .from(knowledgeItems)
      .where(eq(knowledgeItems.code, body.code))
      .limit(1);

    const data = {
      skillId: body.skillId,
      code: body.code,
      cefrLevel: body.cefrLevel as any,
      rule: body.rule,
      examples: body.examples as any,
      counterexamples: body.counterexamples as any,
      commonErrors: body.commonErrors as any,
      l1Notes: body.l1Notes as any,
    };

    if (existing) {
      await db.update(knowledgeItems).set(data).where(eq(knowledgeItems.code, body.code));
    } else {
      await db.insert(knowledgeItems).values(data);
    }

    reply.send({ synced: true, code: body.code });
  });
}
