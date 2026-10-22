import { createDb } from "@falatorio/db/client";
import { eq, sql } from "drizzle-orm";
import { lessons, units, sections } from "@falatorio/db/schema";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

type NodeType = "lesson" | "application" | "practice" | "recap" | "chest";

const SECTION_MULTIPLIER = [1.0, 1.15, 1.3, 1.5];
const NODE_BASE_SESSIONS: Record<NodeType, number> = {
  lesson: 4,
  application: 3,
  practice: 2,
  recap: 1,
  chest: 0,
};

function computeSessions(nodeType: NodeType, sectionIdx: number): number {
  if (nodeType === "chest") return 0;
  if (nodeType === "recap") return 1;
  const base = NODE_BASE_SESSIONS[nodeType];
  const mult = SECTION_MULTIPLIER[sectionIdx] ?? 1.15;
  return Math.round(base * mult);
}

function assignNodeTypes(lessonCount: number, cumulativeUnitIdx: number): NodeType[] {
  if (lessonCount <= 1) return ["recap"];
  if (lessonCount === 2) return ["lesson", "recap"];

  const body = lessonCount - 1;
  const types: NodeType[] = [];

  if (cumulativeUnitIdx < 3) {
    for (let i = 0; i < body; i++) types.push("lesson");
  } else if (cumulativeUnitIdx < 6) {
    const contentEnd = Math.ceil(body * 0.6);
    for (let i = 0; i < body; i++) {
      types.push(i < contentEnd ? "lesson" : "application");
    }
  } else {
    const contentEnd = Math.ceil(body * 0.4);
    const appEnd = contentEnd + Math.ceil(body * 0.3);
    for (let i = 0; i < body; i++) {
      if (i < contentEnd) types.push("lesson");
      else if (i < appEnd) types.push("application");
      else types.push("practice");
    }
  }

  types.push("recap");
  return types;
}

async function main() {
  const db = createDb(DATABASE_URL!);

  const allSections = await db
    .select({ id: sections.id, sortOrder: sections.sortOrder })
    .from(sections)
    .orderBy(sections.sortOrder);
  const sectionOrder = new Map(allSections.map((s) => [s.id, s.sortOrder]));

  const allUnits = await db
    .select({ id: units.id, sectionId: units.sectionId, sortOrder: units.sortOrder })
    .from(units)
    .orderBy(units.sortOrder);

  // Sort units by section then sortOrder to get cumulative index
  const sortedUnits = [...allUnits].sort((a, b) => {
    const sA = sectionOrder.get(a.sectionId) ?? 0;
    const sB = sectionOrder.get(b.sectionId) ?? 0;
    if (sA !== sB) return sA - sB;
    return a.sortOrder - b.sortOrder;
  });

  let updated = 0;
  let skipped = 0;

  for (let cumIdx = 0; cumIdx < sortedUnits.length; cumIdx++) {
    const unit = sortedUnits[cumIdx]!;
    const sIdx = sectionOrder.get(unit.sectionId) ?? 0;
    const unitLessons = await db
      .select({ id: lessons.id, sortOrder: lessons.sortOrder, nodeType: lessons.nodeType })
      .from(lessons)
      .where(eq(lessons.unitId, unit.id))
      .orderBy(lessons.sortOrder);

    const nonChest = unitLessons.filter((l) => l.nodeType !== "chest");
    const nodeTypes = assignNodeTypes(nonChest.length, cumIdx);

    let ncIdx = 0;
    for (const lesson of unitLessons) {
      if (lesson.nodeType === "chest") {
        await db
          .update(lessons)
          .set({ sessionsRequired: 0, updatedAt: new Date() })
          .where(eq(lessons.id, lesson.id));
        updated++;
        continue;
      }

      const newType = nodeTypes[ncIdx] ?? "lesson";
      const newSessions = computeSessions(newType, sIdx);
      ncIdx++;

      if (lesson.nodeType !== newType) {
        await db
          .update(lessons)
          .set({
            nodeType: newType,
            sessionsRequired: newSessions,
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, lesson.id));
        updated++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`Updated ${updated} lessons, skipped ${skipped}`);

  const counts = await db
    .select({
      nodeType: lessons.nodeType,
      count: sql<number>`count(*)::int`,
      avgSessions: sql<number>`round(avg(${lessons.sessionsRequired})::numeric, 1)`,
    })
    .from(lessons)
    .groupBy(lessons.nodeType);

  console.log("\n-- Node Type Distribution --");
  for (const row of counts) {
    console.log(`  ${row.nodeType}: ${row.count} nodes, avg ${row.avgSessions} sessions`);
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
