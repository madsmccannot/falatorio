import { storage, KEYS } from "./storage";

export type OfflineMutationType =
  | "lessonComplete"
  | "exerciseResult"
  | "evidenceRecord";

export interface OfflineMutation {
  id: string;
  type: OfflineMutationType;
  payload: unknown;
  createdAt: number;
}

function readQueue(): OfflineMutation[] {
  const raw = storage.getString(KEYS.OFFLINE_SYNC_QUEUE);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineMutation[];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineMutation[]): void {
  storage.set(KEYS.OFFLINE_SYNC_QUEUE, JSON.stringify(queue));
}

let counter = 0;

function generateId(): string {
  counter += 1;
  return `${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`;
}

export function enqueue(
  type: OfflineMutationType,
  payload: unknown,
): OfflineMutation {
  const mutation: OfflineMutation = {
    id: generateId(),
    type,
    payload,
    createdAt: Date.now(),
  };
  const queue = readQueue();
  queue.push(mutation);
  writeQueue(queue);
  return mutation;
}

export function getPendingCount(): number {
  return readQueue().length;
}

export function getPendingMutations(): OfflineMutation[] {
  return readQueue();
}

export function removeMutation(id: string): void {
  const queue = readQueue().filter((m) => m.id !== id);
  writeQueue(queue);
}

export function clearQueue(): void {
  storage.delete(KEYS.OFFLINE_SYNC_QUEUE);
}

export interface FlushResult {
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export async function flush(
  sender: (mutation: OfflineMutation) => Promise<void>,
): Promise<FlushResult> {
  const queue = readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0, errors: [] };

  const result: FlushResult = { synced: 0, failed: 0, errors: [] };
  const remaining: OfflineMutation[] = [];

  for (const mutation of queue) {
    try {
      await sender(mutation);
      result.synced += 1;
    } catch (err) {
      result.failed += 1;
      result.errors.push({
        id: mutation.id,
        error: err instanceof Error ? err.message : String(err),
      });
      remaining.push(mutation);
    }
  }

  writeQueue(remaining);
  return result;
}
