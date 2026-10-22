import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  enqueue as enqueueMutation,
  flush,
  getPendingCount,
  type OfflineMutationType,
  type OfflineMutation,
} from "@/lib/offline";
import { trpc } from "@/lib/trpc";

function probeConnectivity(apiUrl: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  return fetch(`${apiUrl}/health`, { method: "HEAD", signal: ctrl.signal })
    .then((r) => { clearTimeout(timer); return r.ok; })
    .catch(() => { clearTimeout(timer); return false; });
}

export function useOfflineSync() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(getPendingCount);
  const utils = trpc.useUtils();
  const flushingRef = useRef(false);
  const probeIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
    if (flushingRef.current || getPendingCount() === 0) return;
    flushingRef.current = true;
    try {
      const result = await flush(sendMutation);
      setPendingCount(getPendingCount());
      return result;
    } finally {
      flushingRef.current = false;
    }
  }, [sendMutation]);

  const markOffline = useCallback(() => {
    setIsOffline(true);
  }, []);

  const markOnline = useCallback(() => {
    setIsOffline(false);
    doFlush();
  }, [doFlush]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !isOffline) {
        doFlush();
      }
    });
    return () => sub.remove();
  }, [isOffline, doFlush]);

  useEffect(() => {
    if (!isOffline) {
      clearInterval(probeIntervalRef.current);
      return;
    }
    probeIntervalRef.current = setInterval(async () => {
      const { getApiUrl } = await import("@/lib/storage");
      const ok = await probeConnectivity(getApiUrl());
      if (ok) markOnline();
    }, 15_000);

    return () => clearInterval(probeIntervalRef.current);
  }, [isOffline, markOnline]);

  const enqueue = useCallback(
    (type: OfflineMutationType, payload: unknown) => {
      enqueueMutation(type, payload);
      setPendingCount(getPendingCount());
    },
    [],
  );

  return { isOffline, pendingCount, enqueue, flush: doFlush, markOffline, markOnline };
}
