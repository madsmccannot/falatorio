import type { Job } from "bullmq";
import type { Database } from "@falatorio/db/client";
import { eq } from "drizzle-orm";
import {
  courses,
  units,
  lessons,
  exercises,
  audioClips,
  l1CulturalContent,
} from "@falatorio/db/schema";

export interface ContentSyncData {
  collection: string;
  operation: "create" | "update" | "delete";
  documentId: string;
  data?: Record<string, unknown>;
}

const COLLECTION_MAP = {
  courses,
  units,
  lessons,
  exercises,
  audio_clips: audioClips,
  l1_cultural_content: l1CulturalContent,
} as const;

type SyncableCollection = keyof typeof COLLECTION_MAP;

function isSyncableCollection(name: string): name is SyncableCollection {
  return name in COLLECTION_MAP;
}

export async function processContentSync(
  job: Job<ContentSyncData>,
  db: Database,
): Promise<void> {
  const { collection, operation, documentId, data } = job.data;

  if (!isSyncableCollection(collection)) {
    throw new Error(`Unknown collection: ${collection}`);
  }

  const table = COLLECTION_MAP[collection];

  if (operation === "delete") {
    await db.delete(table).where(eq((table as any).id, documentId));
    await job.updateProgress(100);
    return;
  }

  if (!data) {
    throw new Error(`Missing data for ${operation} on ${collection}/${documentId}`);
  }

  const values = { ...data, id: documentId } as any;

  await db
    .insert(table)
    .values(values)
    .onConflictDoUpdate({
      target: (table as any).id,
      set: data as any,
    });

  await job.updateProgress(100);
}
