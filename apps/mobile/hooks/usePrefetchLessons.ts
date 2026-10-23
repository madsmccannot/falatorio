import { useEffect, useRef } from "react";
import { storage, KEYS, OFFLINE_DEFAULTS } from "@/lib/storage";
import { cacheLessonsForUnit, getCachedLessonIds, type CachedLesson } from "@/lib/offline-lessons";
import { trpc } from "@/lib/trpc";

export function getOfflinePrefetchDepth(): number {
  const val = storage.getNumber(KEYS.OFFLINE_PREFETCH_DEPTH);
  if (val == null || val < 0) return OFFLINE_DEFAULTS.PREFETCH_DEPTH;
  return Math.min(val, OFFLINE_DEFAULTS.MAX_PREFETCH_DEPTH);
}

export function setOfflinePrefetchDepth(depth: number): void {
  storage.set(
    KEYS.OFFLINE_PREFETCH_DEPTH,
    Math.max(0, Math.min(depth, OFFLINE_DEFAULTS.MAX_PREFETCH_DEPTH)),
  );
}

interface UnitWithLessons {
  unitId: string;
  lessons: Array<{
    id: string;
    sortOrder: number;
    nodeType: string;
    grammarFocus: string[] | null;
    completed: boolean;
  }>;
}

export function usePrefetchLessons(
  sectionMap: UnitWithLessons[] | undefined,
  enabled: boolean,
) {
  const utils = trpc.useUtils();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!enabled || !sectionMap || sectionMap.length === 0 || ranRef.current) return;

    const depth = getOfflinePrefetchDepth();
    if (depth === 0) return;

    const alreadyCached = new Set(getCachedLessonIds());

    const unitsToCache = sectionMap
      .filter((u) => u.lessons.some((l) => !l.completed))
      .slice(0, depth)
      .filter((u) => u.lessons.some((l) => !alreadyCached.has(l.id)));

    if (unitsToCache.length === 0) return;

    ranRef.current = true;

    for (const unit of unitsToCache) {
      utils.client.content.getLessons
        .query({ unitId: unit.unitId })
        .then((serverLessons) => {
          const toCache: CachedLesson[] = serverLessons.map((l) => ({
            id: l.id,
            unitId: unit.unitId,
            sortOrder: l.sortOrder,
            grammarFocus: Array.isArray(l.grammarFocus) ? l.grammarFocus.join(", ") : null,
            exercises: [],
          }));
          cacheLessonsForUnit(unit.unitId, toCache);
        })
        .catch(() => {});
    }
  }, [sectionMap, enabled, utils.client]);
}
