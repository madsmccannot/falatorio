import { eq, count } from "drizzle-orm";
import type { Database } from "@falatorio/db/client";
import {
  skills,
  knowledgeItems,
  exercises,
  exerciseKnowledge,
} from "@falatorio/db/schema";
import {
  EXERCISE_TYPES,
  COGNITIVE_LEVELS,
  type ExerciseType,
  type CognitiveLevel,
  type CEFRLevel,
  type L1Code,
  L1_PHASE_1,
} from "@falatorio/core";
import { generateFromKnowledgeItem } from "./content-generator.service.js";

export interface BatchJobConfig {
  targetExercisesPerKI: number;
  cefrLevels?: CEFRLevel[];
  domains?: string[];
  l1s?: L1Code[];
  dryRun?: boolean;
  concurrency?: number;
}

export interface BatchJobResult {
  totalKIs: number;
  processedKIs: number;
  exercisesGenerated: number;
  exercisesSkipped: number;
  errors: Array<{ kiCode: string; error: string }>;
  coverage: { before: number; after: number };
}

export interface CoverageGap {
  knowledgeItemId: string;
  knowledgeItemCode: string;
  skillCode: string;
  cefrLevel: CEFRLevel;
  currentCount: number;
  targetCount: number;
  missingTypes: ExerciseType[];
  missingCognitiveLevels: CognitiveLevel[];
}

const EXERCISE_TO_COGNITIVE: Record<ExerciseType, CognitiveLevel> = {
  pick_correct: "recognition",
  match_pairs: "recognition",
  listen_and_type: "comprehension",
  fill_blank: "controlled_production",
  reorder_words: "controlled_production",
  translate_l1_to_pt: "translation",
  translate_pt_to_l1: "translation",
  speak_and_score: "free_production",
};

export async function findCoverageGaps(
  db: Database,
  config: BatchJobConfig,
): Promise<CoverageGap[]> {
  const allKIs = await db.select().from(knowledgeItems);
  const allSkills = await db.select().from(skills);
  const allLinks = await db.select().from(exerciseKnowledge);
  const allExercises = await db.select().from(exercises);

  const skillMap = new Map(allSkills.map((s) => [s.id, s]));
  const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

  const kiExerciseCounts = new Map<string, { count: number; types: Set<string> }>();
  for (const link of allLinks) {
    const entry = kiExerciseCounts.get(link.knowledgeItemId) ?? { count: 0, types: new Set() };
    entry.count++;
    const ex = exerciseMap.get(link.exerciseId);
    if (ex) entry.types.add(ex.type);
    kiExerciseCounts.set(link.knowledgeItemId, entry);
  }

  const gaps: CoverageGap[] = [];

  for (const ki of allKIs) {
    const skill = skillMap.get(ki.skillId);
    if (!skill) continue;

    if (config.cefrLevels && !config.cefrLevels.includes(ki.cefrLevel as CEFRLevel)) continue;
    if (config.domains && !config.domains.includes(skill.domain)) continue;

    const entry = kiExerciseCounts.get(ki.id) ?? { count: 0, types: new Set<string>() };

    if (entry.count >= config.targetExercisesPerKI) continue;

    const allowedTypes = (ki.exerciseTypes as string[] ?? EXERCISE_TYPES) as ExerciseType[];
    const missingTypes = allowedTypes.filter((t) => !entry.types.has(t));

    const coveredCognitive = new Set<CognitiveLevel>();
    for (const t of entry.types) {
      const cog = EXERCISE_TO_COGNITIVE[t as ExerciseType];
      if (cog) coveredCognitive.add(cog);
    }
    const missingCognitiveLevels = (COGNITIVE_LEVELS as readonly CognitiveLevel[])
      .filter((c) => !coveredCognitive.has(c));

    gaps.push({
      knowledgeItemId: ki.id,
      knowledgeItemCode: ki.code,
      skillCode: skill.code,
      cefrLevel: ki.cefrLevel as CEFRLevel,
      currentCount: entry.count,
      targetCount: config.targetExercisesPerKI,
      missingTypes,
      missingCognitiveLevels,
    });
  }

  return gaps.sort((a, b) => a.currentCount - b.currentCount);
}

export async function runBatchGeneration(
  db: Database,
  config: BatchJobConfig,
): Promise<BatchJobResult> {
  const gaps = await findCoverageGaps(db, config);

  const totalKIs = gaps.length;
  const beforeCoverage = await computeCoveragePercent(db, config.targetExercisesPerKI);

  const result: BatchJobResult = {
    totalKIs,
    processedKIs: 0,
    exercisesGenerated: 0,
    exercisesSkipped: 0,
    errors: [],
    coverage: { before: beforeCoverage, after: beforeCoverage },
  };

  if (config.dryRun) {
    return result;
  }

  const l1s = config.l1s ?? [...L1_PHASE_1];
  const concurrency = config.concurrency ?? 3;

  for (let i = 0; i < gaps.length; i += concurrency) {
    const batch = gaps.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map((gap) => generateForGap(db, gap, l1s)),
    );

    for (let j = 0; j < batchResults.length; j++) {
      const batchResult = batchResults[j]!;
      const gap = batch[j]!;
      result.processedKIs++;

      if (batchResult.status === "fulfilled") {
        result.exercisesGenerated += batchResult.value;
      } else {
        result.errors.push({
          kiCode: gap.knowledgeItemCode,
          error: String(batchResult.reason),
        });
      }
    }
  }

  result.coverage.after = await computeCoveragePercent(db, config.targetExercisesPerKI);

  return result;
}

async function generateForGap(
  db: Database,
  gap: CoverageGap,
  l1s: readonly L1Code[],
): Promise<number> {
  const [ki] = await db
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.id, gap.knowledgeItemId))
    .limit(1);

  if (!ki) return 0;

  const needed = gap.targetCount - gap.currentCount;
  const typesToGenerate = gap.missingTypes.slice(0, needed);
  if (typesToGenerate.length === 0) {
    const allTypes = (ki.exerciseTypes as string[] ?? EXERCISE_TYPES) as ExerciseType[];
    for (let i = 0; i < needed; i++) {
      typesToGenerate.push(allTypes[i % allTypes.length]!);
    }
  }

  let generated = 0;

  for (const exerciseType of typesToGenerate) {
    const l1 = l1s[Math.floor(Math.random() * l1s.length)]!;
    const cognitiveLevel = EXERCISE_TO_COGNITIVE[exerciseType] ?? "recognition";

    const l1NotesStr = ki.l1Notes
      ? (ki.l1Notes as Record<string, any>)[l1]?.reason ?? null
      : null;

    try {
      const result = await generateFromKnowledgeItem({
        request: {
          skillCode: gap.skillCode,
          knowledgeItemCode: gap.knowledgeItemCode,
          l1,
          cefrLevel: gap.cefrLevel,
          exerciseType,
          cognitiveLevel,
          difficulty: cefrToDifficulty(gap.cefrLevel),
        },
        rule: ki.rule,
        examples: (ki.examples as string[]) ?? [],
        commonErrors: (ki.commonErrors as string[]) ?? [],
        l1Notes: l1NotesStr,
      });

      const promptObj = result.prompt;
      const [inserted] = await db
        .insert(exercises)
        .values({
          lessonId: null,
          type: result.type,
          prompt: promptObj,
          acceptedAnswers: result.acceptedAnswers,
          difficulty: result.difficulty,
          l1Tip: result.l1Tip,
          status: "review",
        })
        .returning({ id: exercises.id });

      if (inserted) {
        await db.insert(exerciseKnowledge).values({
          exerciseId: inserted.id,
          knowledgeItemId: gap.knowledgeItemId,
          isPrimary: true,
        });
        generated++;
      }
    } catch {
      continue;
    }
  }

  return generated;
}

async function computeCoveragePercent(
  db: Database,
  target: number,
): Promise<number> {
  const allKIs = await db.select({ id: knowledgeItems.id }).from(knowledgeItems);
  if (allKIs.length === 0) return 100;

  const linked = await db
    .select({
      kiId: exerciseKnowledge.knowledgeItemId,
      cnt: count().as("cnt"),
    })
    .from(exerciseKnowledge)
    .groupBy(exerciseKnowledge.knowledgeItemId);

  const covered = linked.filter((l) => Number(l.cnt) >= target).length;
  return Math.round((covered / allKIs.length) * 100);
}

function cefrToDifficulty(level: CEFRLevel): number {
  const map: Record<CEFRLevel, number> = {
    A1: 2, A2: 3, B1: 5, B2: 7, C1: 8, C2: 9,
  };
  return map[level] ?? 5;
}

export async function getExerciseBankStats(db: Database) {
  const totalExercises = await db.select({ count: count() }).from(exercises);
  const totalKIs = await db.select({ count: count() }).from(knowledgeItems);
  const linkedKIs = await db
    .selectDistinct({ kiId: exerciseKnowledge.knowledgeItemId })
    .from(exerciseKnowledge);
  const totalLinks = await db.select({ count: count() }).from(exerciseKnowledge);

  const byType = await db
    .select({
      type: exercises.type,
      count: count().as("count"),
    })
    .from(exercises)
    .groupBy(exercises.type);

  const byStatus = await db
    .select({
      status: exercises.status,
      count: count().as("count"),
    })
    .from(exercises)
    .groupBy(exercises.status);

  return {
    totalExercises: Number(totalExercises[0]?.count ?? 0),
    totalKnowledgeItems: Number(totalKIs[0]?.count ?? 0),
    linkedKnowledgeItems: linkedKIs.length,
    totalLinks: Number(totalLinks[0]?.count ?? 0),
    coveragePercent: Number(totalKIs[0]?.count ?? 0) > 0
      ? Math.round((linkedKIs.length / Number(totalKIs[0]?.count ?? 1)) * 100)
      : 0,
    byType: byType.map((r) => ({ type: r.type, count: Number(r.count) })),
    byStatus: byStatus.map((r) => ({ status: String(r.status), count: Number(r.count) })),
  };
}
