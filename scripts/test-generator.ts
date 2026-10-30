import { createDb } from "@falatorio/db/client";
import { knowledgeItems, skills } from "@falatorio/db/schema";
import { eq } from "drizzle-orm";
import { generateFromKnowledgeItem, validateGeneratedExercise } from "../server/src/services/content-generator.service.js";
import type { ExerciseType, CognitiveLevel, CEFRLevel, L1Code } from "@falatorio/core";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const db = createDb(DATABASE_URL);

const EXERCISE_TO_COGNITIVE: Record<string, CognitiveLevel> = {
  pick_correct: "recognition",
  match_pairs: "recognition",
  listen_and_type: "comprehension",
  fill_blank: "controlled_production",
  reorder_words: "controlled_production",
  translate_l1_to_pt: "translation",
  translate_pt_to_l1: "translation",
  speak_and_score: "free_production",
};

const TYPES_TO_TEST: ExerciseType[] = [
  "pick_correct",
  "fill_blank",
  "translate_l1_to_pt",
  "translate_pt_to_l1",
  "match_pairs",
  "reorder_words",
  "listen_and_type",
  "speak_and_score",
];

async function main() {
  const l1: L1Code = "en";
  const cefrLevel: CEFRLevel = "A1";

  const [ki] = await db
    .select({
      id: knowledgeItems.id,
      code: knowledgeItems.code,
      rule: knowledgeItems.rule,
      examples: knowledgeItems.examples,
      commonErrors: knowledgeItems.commonErrors,
      l1Notes: knowledgeItems.l1Notes,
      skillId: knowledgeItems.skillId,
      cefrLevel: knowledgeItems.cefrLevel,
    })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.cefrLevel, cefrLevel))
    .limit(1);

  if (!ki) {
    console.error("No A1 knowledge items found");
    process.exit(1);
  }

  const [skill] = await db
    .select({ code: skills.code })
    .from(skills)
    .where(eq(skills.id, ki.skillId))
    .limit(1);

  console.log(`\nTesting with KI: ${ki.code}`);
  console.log(`Rule: ${ki.rule}`);
  console.log(`Skill: ${skill?.code}\n`);

  let passed = 0;
  let failed = 0;

  for (const exerciseType of TYPES_TO_TEST) {
    const cognitive = EXERCISE_TO_COGNITIVE[exerciseType] ?? "recognition";
    console.log(`--- ${exerciseType} (${cognitive}) ---`);

    try {
      const result = await generateFromKnowledgeItem({
        request: {
          skillCode: skill?.code ?? "unknown",
          knowledgeItemCode: ki.code,
          l1,
          cefrLevel: ki.cefrLevel as CEFRLevel,
          exerciseType,
          cognitiveLevel: cognitive,
          difficulty: 2,
        },
        rule: ki.rule,
        examples: (ki.examples as string[]) ?? [],
        commonErrors: (ki.commonErrors as string[]) ?? [],
        l1Notes: ki.l1Notes
          ? (ki.l1Notes as Record<string, any>)[l1]?.reason ?? null
          : null,
      });

      const validation = validateGeneratedExercise(result, l1);

      console.log(`  Type: ${result.type}`);
      console.log(`  Prompt: ${JSON.stringify(result.prompt, null, 2).split("\n").map((l, i) => i === 0 ? l : "  " + l).join("\n")}`);
      console.log(`  Answers: ${JSON.stringify(result.acceptedAnswers)}`);
      console.log(`  Difficulty: ${result.difficulty}`);
      console.log(`  L1 Tip: ${JSON.stringify(result.l1Tip)}`);
      console.log(`  Valid: ${validation.valid}`);
      if (validation.errors.length > 0) console.log(`  ERRORS: ${validation.errors.join("; ")}`);
      if (validation.warnings.length > 0) console.log(`  WARNINGS: ${validation.warnings.join("; ")}`);

      if (validation.valid) passed++;
      else failed++;
    } catch (err) {
      console.log(`  FAILED: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
    console.log();
  }

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed out of ${TYPES_TO_TEST.length} ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
