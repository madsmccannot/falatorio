import { LESSON } from "../constants.js";

export function exerciseCountForNode(
  nodeType: string,
  sectionIdx: number,
): number {
  const base = LESSON.EXERCISES_BY_NODE_TYPE[nodeType] ?? LESSON.EXERCISES_PER_LESSON;
  const bonus = LESSON.SECTION_EXERCISE_BONUS[sectionIdx] ?? 0;
  return base + bonus;
}

export function diversifyExerciseOrder<T extends { type: string }>(
  exercises: T[],
): T[] {
  if (exercises.length <= 2) return exercises;

  const result: T[] = [];
  const remaining = [...exercises];
  const maxConsec = LESSON.MAX_SAME_TYPE_CONSECUTIVE;

  while (remaining.length > 0) {
    const lastTypes: string[] = [];
    for (let i = result.length - 1; i >= Math.max(0, result.length - maxConsec); i--) {
      lastTypes.push(result[i]!.type);
    }

    const allSameType = lastTypes.length >= maxConsec && lastTypes.every((t) => t === lastTypes[0]);

    if (allSameType) {
      const differentIdx = remaining.findIndex((e) => e.type !== lastTypes[0]);
      if (differentIdx >= 0) {
        result.push(remaining.splice(differentIdx, 1)[0]!);
        continue;
      }
    }

    result.push(remaining.shift()!);
  }

  return result;
}
