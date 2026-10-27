import { createDb } from "@falatorio/db/client";
import { exercises, exerciseKnowledge, knowledgeItems } from "@falatorio/db/schema";
import { eq, inArray, count, sql } from "drizzle-orm";
import * as readline from "readline";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set. Run: export DATABASE_URL=<your-neon-url>");
  process.exit(1);
}

const db = createDb(DATABASE_URL);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q: string): Promise<string> {
  return new Promise((r) => rl.question(q, r));
}

async function showStats() {
  const byStatus = await db
    .select({ status: exercises.status, cnt: count().as("cnt") })
    .from(exercises)
    .groupBy(exercises.status);

  const byType = await db
    .select({ type: exercises.type, status: exercises.status, cnt: count().as("cnt") })
    .from(exercises)
    .groupBy(exercises.type, exercises.status)
    .orderBy(exercises.type);

  console.log("\n=== Exercise Status ===");
  for (const r of byStatus) {
    console.log(`  ${r.status}: ${r.cnt}`);
  }

  console.log("\n=== By Type x Status ===");
  for (const r of byType) {
    console.log(`  ${r.type} [${r.status}]: ${r.cnt}`);
  }
}

async function reviewQueue(batchSize: number) {
  const queue = await db
    .select()
    .from(exercises)
    .where(eq(exercises.status, "review"))
    .limit(batchSize);

  if (queue.length === 0) {
    console.log("\nNada para rever.");
    return;
  }

  const ids = queue.map((e) => e.id);
  const links = await db
    .select({
      exerciseId: exerciseKnowledge.exerciseId,
      kiCode: knowledgeItems.code,
      cefrLevel: knowledgeItems.cefrLevel,
      rule: knowledgeItems.rule,
    })
    .from(exerciseKnowledge)
    .innerJoin(knowledgeItems, eq(exerciseKnowledge.knowledgeItemId, knowledgeItems.id))
    .where(inArray(exerciseKnowledge.exerciseId, ids));

  const kiMap = new Map<string, typeof links>();
  for (const l of links) {
    const arr = kiMap.get(l.exerciseId) ?? [];
    arr.push(l);
    kiMap.set(l.exerciseId, arr);
  }

  const toApprove: string[] = [];
  const toReject: string[] = [];

  for (let i = 0; i < queue.length; i++) {
    const ex = queue[i]!;
    const kis = kiMap.get(ex.id) ?? [];
    const prompt = ex.prompt as Record<string, unknown>;

    console.log(`\n--- Exercise ${i + 1}/${queue.length} ---`);
    console.log(`  ID:   ${ex.id}`);
    console.log(`  Type: ${ex.type}`);
    console.log(`  Diff: ${ex.difficulty}`);

    const question = prompt["question"] || prompt["sentence"] || prompt["text"] || prompt["targetText"];
    console.log(`  Prompt: ${typeof question === "string" ? question : JSON.stringify(prompt)}`);

    if (prompt["options"]) console.log(`  Options: ${JSON.stringify(prompt["options"])}`);
    if (prompt["pairs"]) console.log(`  Pairs: ${JSON.stringify(prompt["pairs"])}`);
    if (prompt["words"]) console.log(`  Words: ${JSON.stringify(prompt["words"])}`);

    console.log(`  Answers: ${JSON.stringify(ex.acceptedAnswers)}`);
    if (ex.l1Tip) console.log(`  L1 Tip: ${ex.l1Tip}`);

    for (const ki of kis) {
      console.log(`  KI: ${ki.kiCode} (${ki.cefrLevel}) - ${ki.rule?.slice(0, 80)}`);
    }

    const answer = await ask("  [a]pprove / [r]eject / [s]kip / [q]uit / [A]pprove-all-remaining? ");
    if (answer === "a") toApprove.push(ex.id);
    else if (answer === "r") toReject.push(ex.id);
    else if (answer === "A") {
      toApprove.push(ex.id);
      for (let j = i + 1; j < queue.length; j++) toApprove.push(queue[j]!.id);
      break;
    }
    else if (answer === "q") break;
  }

  if (toApprove.length > 0) {
    await db.update(exercises)
      .set({ status: "live", updatedAt: new Date() })
      .where(inArray(exercises.id, toApprove));
    console.log(`\nAprovados: ${toApprove.length}`);
  }
  if (toReject.length > 0) {
    await db.delete(exerciseKnowledge).where(inArray(exerciseKnowledge.exerciseId, toReject));
    await db.delete(exercises).where(inArray(exercises.id, toReject));
    console.log(`Rejeitados: ${toReject.length}`);
  }
}

async function bulkApproveAll() {
  const [result] = await db
    .update(exercises)
    .set({ status: "live", updatedAt: new Date() })
    .where(eq(exercises.status, "review"))
    .returning({ cnt: sql<number>`count(*) over ()` });
  console.log(`\nTodos os exercicios em review passaram a live.`);
}

async function main() {
  await showStats();
  console.log("\nComandos:");
  console.log("  1 - Rever exercicios um a um (20 de cada vez)");
  console.log("  2 - Aprovar TODOS os exercicios em review");
  console.log("  3 - Sair");

  const choice = await ask("\nEscolhe: ");
  if (choice === "1") await reviewQueue(20);
  else if (choice === "2") {
    const confirm = await ask("Tens a certeza? Todos passam a live. (s/n) ");
    if (confirm === "s") await bulkApproveAll();
  }

  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
