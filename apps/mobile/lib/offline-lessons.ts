import { storage, KEYS } from "./storage";

const LESSON_PREFIX = "offline_lesson_";

export interface CachedLesson {
  id: string;
  unitId: string;
  sortOrder: number;
  grammarFocus: string | null;
  exercises: unknown[];
}

function readManifest(): string[] {
  const raw = storage.getString(KEYS.OFFLINE_LESSON_MANIFEST);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeManifest(ids: string[]): void {
  storage.set(KEYS.OFFLINE_LESSON_MANIFEST, JSON.stringify(ids));
}

export function cacheLessonsForUnit(
  _unitId: string,
  lessons: CachedLesson[],
): void {
  const manifest = new Set(readManifest());
  for (const lesson of lessons) {
    storage.set(LESSON_PREFIX + lesson.id, JSON.stringify(lesson));
    manifest.add(lesson.id);
  }
  writeManifest([...manifest]);
}

export function getCachedLesson(lessonId: string): CachedLesson | null {
  const raw = storage.getString(LESSON_PREFIX + lessonId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedLesson;
  } catch {
    return null;
  }
}

export function getCachedLessonIds(): string[] {
  return readManifest();
}

export function isCached(lessonId: string): boolean {
  return storage.getString(LESSON_PREFIX + lessonId) !== undefined;
}

export function removeCachedLesson(lessonId: string): void {
  storage.delete(LESSON_PREFIX + lessonId);
  const manifest = readManifest().filter((id) => id !== lessonId);
  writeManifest(manifest);
}

export function clearCachedLessons(): void {
  const manifest = readManifest();
  for (const id of manifest) {
    storage.delete(LESSON_PREFIX + id);
  }
  storage.delete(KEYS.OFFLINE_LESSON_MANIFEST);
}
