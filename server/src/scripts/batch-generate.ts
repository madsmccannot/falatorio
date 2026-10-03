import { sql } from "drizzle-orm";
import { createDb } from "@falatorio/db/client";
import { exercises } from "@falatorio/db/schema";
import { runBatchGeneration, getExerciseBankStats } from "../services/batch-exercise-pipeline.service.js";
import type { CEFRLevel, L1Code } from "@falatorio/core";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    targetPerKI: 10,
    cefrLevels: undefined as CEFRLevel[] | undefined,
    l1s: undefined as L1Code[] | undefined,
    dryRun: false,
    autoApprove: false,
    concurrency: 2,
    statsOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    const next = args[i + 1];
    switch (arg) {
      case "--target":
        config.targetPerKI = parseInt(next!, 10);
        i++;
        break;
      case "--cefr":
        config.cefrLevels = next!.split(",") as CEFRLevel[];
        i++;
        break;
      case "--l1":
        config.l1s = next!.split(",") as L1Code[];
        i++;
        break;
      case "--dry-run":
        config.dryRun = true;
        break;
      case "--auto-approve":
        config.autoApprove = true;
        break;
      case "--concurrency":
        config.concurrency = parseInt(next!, 10);
        i++;
        break;
      case "--stats":
        config.statsOnly = true;
        break;
      case "--help":
        console.log(`Usage: batch-generate [options]
  --target N        Exercises per knowledge item (default: 10)
  --cefr A1,A2      Filter by CEFR levels (comma-separated)
  --l1 hi,ur        Filter by L1 codes (comma-separated)
  --dry-run         Show what would be generated without generating
  --auto-approve    Set generated exercises to "live" status
  --concurrency N   Parallel generation requests (default: 2)
  --stats           Show exercise bank stats and exit`);
        process.exit(0);
    }
  }
  return config;
}

async function main() {
  const config = parseArgs();
  const db = createDb(DATABASE_URL!);

  if (config.statsOnly) {
    const stats = await getExerciseBankStats(db);
    console.log("Exercise Bank Stats:");
    console.log(`  Total exercises: ${stats.totalExercises}`);
    console.log(`  Knowledge items: ${stats.totalKnowledgeItems}`);
    console.log(`  KIs with exercises: ${stats.linkedKnowledgeItems}`);
    console.log(`  Coverage: ${stats.coveragePercent}%`);
    console.log(`  By type:`, stats.byType);
    console.log(`  By status:`, stats.byStatus);
    return;
  }

  if (!process.env["ANTHROPIC_API_KEY"]) {
    console.error("ANTHROPIC_API_KEY is required for batch generation");
    process.exit(1);
  }

  console.log("Running batch exercise generation...");
  console.log(`  Target per KI: ${config.targetPerKI}`);
  console.log(`  CEFR: ${config.cefrLevels?.join(", ") ?? "all"}`);
  console.log(`  L1s: ${config.l1s?.join(", ") ?? "all Phase 1"}`);
  console.log(`  Dry run: ${config.dryRun}`);
  console.log(`  Auto-approve: ${config.autoApprove}`);
  console.log(`  Concurrency: ${config.concurrency}\n`);

  const result = await runBatchGeneration(db, {
    targetExercisesPerKI: config.targetPerKI,
    cefrLevels: config.cefrLevels,
    l1s: config.l1s,
    dryRun: config.dryRun,
    concurrency: config.concurrency,
  });

  console.log("\nResults:");
  console.log(`  KIs with gaps: ${result.totalKIs}`);
  console.log(`  Processed: ${result.processedKIs}`);
  console.log(`  Exercises generated: ${result.exercisesGenerated}`);
  console.log(`  Skipped: ${result.exercisesSkipped}`);
  console.log(`  Errors: ${result.errors.length}`);
  console.log(`  Coverage: ${result.coverage.before}% -> ${result.coverage.after}%`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    for (const err of result.errors.slice(0, 10)) {
      console.log(`  ${err.kiCode}: ${err.error}`);
    }
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more`);
    }
  }

  if (config.autoApprove && result.exercisesGenerated > 0) {
    console.log("\nAuto-approving generated exercises...");
    await db
      .update(exercises)
      .set({ status: "live", updatedAt: new Date() })
      .where(sql`${exercises.status} = 'review'`);
    console.log("Exercises approved to live status.");
  }
}

main().catch((err) => {
  console.error("Batch generation failed:", err);
  process.exit(1);
});
