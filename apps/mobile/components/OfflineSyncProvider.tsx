import React, { createContext, useContext } from "react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import type { OfflineMutationType } from "@/lib/offline";

interface OfflineSyncContextValue {
  isOffline: boolean;
  pendingCount: number;
  enqueue: (type: OfflineMutationType, payload: unknown) => void;
  flush: () => Promise<unknown>;
  markOffline: () => void;
  markOnline: () => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const sync = useOfflineSync();
  return (
    <OfflineSyncContext.Provider value={sync}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOffline(): OfflineSyncContextValue {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) {
    return {
      isOffline: false,
      pendingCount: 0,
      enqueue: () => {},
      flush: () => Promise.resolve(),
      markOffline: () => {},
      markOnline: () => {},
    };
  }
  return ctx;
}
