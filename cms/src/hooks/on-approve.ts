import type { CollectionAfterChangeHook } from "payload";

const API_URL = process.env["APP_URL"] ?? "http://localhost:3001";
const SYNC_SECRET = process.env["CMS_SYNC_SECRET"] ?? "";

async function syncToApi(path: string, data: Record<string, unknown>): Promise<boolean> {
  if (!SYNC_SECRET) return false;
  try {
    const res = await fetch(`${API_URL}/api/cms-sync/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CMS-Sync-Secret": SYNC_SECRET,
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const onApproveExercise: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;

  const wasNotLive = previousDoc?.status !== "live";
  const isNowLive = doc.status === "live";

  if (wasNotLive && isNowLive) {
    const synced = await syncToApi("exercise", {
      id: doc.id,
      lessonId: doc.lesson,
      type: doc.type,
      prompt: doc.prompt,
      acceptedAnswers: doc.acceptedAnswers,
      difficulty: doc.difficulty,
      l1Tip: doc.l1Tip,
      glossary: doc.glossary,
      genderPairs: doc.genderPairs,
      audioUrl: doc.audioUrl,
      knowledgeItemIds: doc.knowledgeItems,
      version: doc.version,
    });

    if (synced) {
      req.payload.logger.info(`Exercise ${doc.id} synced to API`);
    } else {
      req.payload.logger.warn(`Exercise ${doc.id} published but sync failed (API unreachable or no secret)`);
    }
  }

  return doc;
};

export const onApproveKnowledgeItem: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;

  const wasNotLive = previousDoc?.status !== "live";
  const isNowLive = doc.status === "live";

  if (wasNotLive && isNowLive) {
    const synced = await syncToApi("knowledge-item", {
      id: doc.id,
      skillId: doc.skill,
      code: doc.code,
      cefrLevel: doc.cefrLevel,
      rule: doc.rule,
      examples: doc.examples,
      counterexamples: doc.counterexamples,
      commonErrors: doc.commonErrors,
      shortExplanation: doc.shortExplanation,
      l1Notes: doc.l1Notes,
      exerciseTypes: doc.exerciseTypes,
      masteryCriteria: doc.masteryCriteria,
      version: doc.version,
    });

    if (synced) {
      req.payload.logger.info(`KnowledgeItem ${doc.code} synced to API`);
    } else {
      req.payload.logger.warn(`KnowledgeItem ${doc.code} published but sync failed`);
    }
  }

  return doc;
};
