import type { MasteryScore, Skill } from "./types.js";

export type PrerequisiteCheck = {
  available: boolean;
  satisfied: string[];
  missing: string[];
};

export function checkPrerequisitesSatisfied(
  skillId: string,
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
  masteryScores: MasteryScore[],
  masteryThreshold = 0.7,
): PrerequisiteCheck {
  const prereqIds = prerequisites
    .filter((p) => p.skillId === skillId)
    .map((p) => p.prerequisiteId);

  if (prereqIds.length === 0) {
    return { available: true, satisfied: [], missing: [] };
  }

  const masteryMap = new Map(masteryScores.map((m) => [m.skillId, m.mastery]));

  const satisfied: string[] = [];
  const missing: string[] = [];

  for (const prereqId of prereqIds) {
    const mastery = masteryMap.get(prereqId) ?? 0;
    if (mastery >= masteryThreshold) {
      satisfied.push(prereqId);
    } else {
      missing.push(prereqId);
    }
  }

  return {
    available: missing.length === 0,
    satisfied,
    missing,
  };
}

export function getAvailableSkills(
  skills: Skill[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
  masteryScores: MasteryScore[],
  masteryThreshold = 0.7,
): Skill[] {
  return skills.filter((s) => {
    const check = checkPrerequisitesSatisfied(
      s.id,
      prerequisites,
      masteryScores,
      masteryThreshold,
    );
    return check.available;
  });
}

export function getBlockingPrerequisites(
  skillId: string,
  skills: Skill[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
  masteryScores: MasteryScore[],
  masteryThreshold = 0.7,
): Skill[] {
  const check = checkPrerequisitesSatisfied(
    skillId,
    prerequisites,
    masteryScores,
    masteryThreshold,
  );
  const skillMap = new Map(skills.map((s) => [s.id, s]));
  return check.missing
    .map((id) => skillMap.get(id))
    .filter((s): s is Skill => s !== undefined);
}

export function getDependents(
  skillId: string,
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
): string[] {
  return prerequisites
    .filter((p) => p.prerequisiteId === skillId)
    .map((p) => p.skillId);
}

export function topologicalSort(
  skills: Skill[],
  prerequisites: Array<{ skillId: string; prerequisiteId: string }>,
): Skill[] {
  const adjList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const s of skills) {
    adjList.set(s.id, []);
    inDegree.set(s.id, 0);
  }

  for (const p of prerequisites) {
    if (!adjList.has(p.prerequisiteId)) continue;
    adjList.get(p.prerequisiteId)!.push(p.skillId);
    inDegree.set(p.skillId, (inDegree.get(p.skillId) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjList.get(current) ?? []) {
      const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  const skillMap = new Map(skills.map((s) => [s.id, s]));
  return sorted
    .map((id) => skillMap.get(id))
    .filter((s): s is Skill => s !== undefined);
}
