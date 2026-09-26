import { useCallback, useEffect, useRef, useState } from "react";
import {
  enqueue as enqueueMutation,
  flush,
  getPendingCount,
  type OfflineMutationType,
  type OfflineMutation,
} from "@/lib/offline";
import { trpc } from "@/lib/trpc";

export function useOfflineSync() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(getPendingCount);
  const utils = trpc.useUtils();
  const flushingRef = useRef(false);

  const sendMutation = useCallback(
    async (mutation: OfflineMutation) => {
      switch (mutation.type) {
        case "lessonComplete":
          await utils.client.lesson.completeLesson.mutate(mutation.payload as any);
          break;
        case "exerciseResult":
          await utils.client.lesson.submitAnswer.mutate(mutation.payload as any);
          break;
        case "evidenceRecord":
          await utils.client.mastery.recordEvidence.mutate(mutation.payload as any);
          break;
      }
    },
    [utils.client],
  );

  const doFlush = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      await flush(sendMutation);
      setPendingCount(getPendingCount());
    } finally {
      flushingRef.current = false;
    }
  }, [sendMutation]);

  useEffect(() => {
    if (!isOffline && getPendingCount() > 0) {
      doFlush();
    }
  }, [isOffline, doFlush]);

  const enqueue = useCallback(
    (type: OfflineMutationType, payload: unknown) => {
      enqueueMutation(type, payload);
      setPendingCount(getPendingCount());
    },
    [],
  );

  return { isOffline, setIsOffline, pendingCount, enqueue, flush: doFlush };
}
