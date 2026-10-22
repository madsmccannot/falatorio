import { createDb } from "@falatorio/db/client";
import { eq, inArray } from "drizzle-orm";
import {
  lessons,
  skills,
  lessonSkills,
  exercises,
  knowledgeItems,
  exerciseKnowledge,
} from "@falatorio/db/schema";
import { GRAMMAR_TO_SKILLS } from "../services/seed-content.service.js";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function main() {
  const db = createDb(DATABASE_URL!);

  const allSkills = await db.select({ id: skills.id, code: skills.code }).from(skills);
  if (allSkills.length === 0) {
    console.error("No skills in DB. Run the taxonomy seed first:");
    console.error("  cd packages/db && npx tsx src/seed/run.ts");
    process.exit(1);
  }
  console.log(`Found ${allSkills.length} skills in DB.`);

  const codeToId = new Map(allSkills.map((s) => [s.code, s.id]));

  // ── Step 1: Backfill lessonSkills ──

  const allLessons = await db
    .select({ id: lessons.id, grammarFocus: lessons.grammarFocus })
    .from(lessons);

  console.log(`\nBackfilling lessonSkills for ${allLessons.length} lessons...`);

  let lsInserted = 0;
  let lsSkipped = 0;

  for (const lesson of allLessons) {
    const grammarFocus = lesson.grammarFocus as string[];
    if (!grammarFocus || grammarFocus.length === 0) continue;

    const skillCodes = new Set<string>();
    for (const gf of grammarFocus) {
      const mapped = GRAMMAR_TO_SKILLS[gf];
      if (mapped) mapped.forEach((c) => skillCodes.add(c));
    }

    if (skillCodes.size === 0) continue;

    const primaryCodes = new Set(GRAMMAR_TO_SKILLS[grammarFocus[0]!] ?? []);

    for (const code of skillCodes) {
      const skillId = codeToId.get(code);
      if (!skillId) continue;

      try {
        await db
          .insert(lessonSkills)
          .values({
            lessonId: lesson.id,
            skillId,
            isPrimary: primaryCodes.has(code),
          })
          .onConflictDoNothing();
        lsInserted++;
      } catch {
        lsSkipped++;
      }
    }
  }

  console.log(`  lessonSkills: ${lsInserted} inserted, ${lsSkipped} skipped`);

  // ── Step 2: Backfill exerciseKnowledge ──

  const allExercises = await db
    .select({ id: exercises.id, lessonId: exercises.lessonId })
    .from(exercises);

  console.log(`\nBackfilling exerciseKnowledge for ${allExercises.length} exercises...`);

  const existingLinks = await db
    .select({ exerciseId: exerciseKnowledge.exerciseId })
    .from(exerciseKnowledge);
  const linkedExercises = new Set(existingLinks.map((r) => r.exerciseId));

  let ekInserted = 0;
  let ekSkipped = 0;

  const lessonSkillCache = new Map<string, string[]>();

  for (const ex of allExercises) {
    if (!ex.lessonId || linkedExercises.has(ex.id)) {
      ekSkipped++;
      continue;
    }

    let skillIds = lessonSkillCache.get(ex.lessonId);
    if (!skillIds) {
      const rows = await db
        .select({ skillId: lessonSkills.skillId })
        .from(lessonSkills)
        .where(eq(lessonSkills.lessonId, ex.lessonId));
      skillIds = rows.map((r) => r.skillId);
      lessonSkillCache.set(ex.lessonId, skillIds);
    }

    if (skillIds.length === 0) continue;

    const kiRows = await db
      .select({ id: knowledgeItems.id })
      .from(knowledgeItems)
      .where(inArray(knowledgeItems.skillId, skillIds));

    if (kiRows.length === 0) continue;

    const primaryKI = kiRows[0]!;
    await db
      .insert(exerciseKnowledge)
      .values({ exerciseId: ex.id, knowledgeItemId: primaryKI.id, isPrimary: true })
      .onConflictDoNothing();
    ekInserted++;

    for (const ki of kiRows.slice(1)) {
      await db
        .insert(exerciseKnowledge)
        .values({ exerciseId: ex.id, knowledgeItemId: ki.id, isPrimary: false })
        .onConflictDoNothing();
      ekInserted++;
    }
  }

  console.log(`  exerciseKnowledge: ${ekInserted} inserted, ${ekSkipped} skipped`);

  // ── Summary ──

  const kiCount = await db.select({ id: knowledgeItems.id }).from(knowledgeItems);
  const lsCount = await db.select({ lessonId: lessonSkills.lessonId }).from(lessonSkills);
  const ekCount = await db.select({ exerciseId: exerciseKnowledge.exerciseId }).from(exerciseKnowledge);

  console.log("\n── Knowledge Graph Status ──");
  console.log(`  Skills:             ${allSkills.length}`);
  console.log(`  Knowledge Items:    ${kiCount.length}`);
  console.log(`  Lesson-Skill links: ${lsCount.length}`);
  console.log(`  Exercise-KI links:  ${ekCount.length}`);
  console.log("\nDone. Evidence writing and mastery recalculation are now active.");
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
