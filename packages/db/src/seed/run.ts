import { SKILLS, KNOWLEDGE_ITEMS, validateTaxonomy } from "./taxonomy.js";
import { skills, knowledgeItems, skillPrerequisites } from "../schema/index.js";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const isNeon = DATABASE_URL.includes("neon.tech");

async function getDb() {
  if (isNeon) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle(neon(DATABASE_URL!));
  }
  const postgres = (await import("postgres")).default;
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const client = postgres(DATABASE_URL!, { max: 1 });
  return Object.assign(drizzle(client), { _client: client });
}

async function seedTaxonomy(db: any) {
  const errors = validateTaxonomy();
  if (errors.length) {
    console.error("Taxonomy validation failed:");
    errors.forEach((e: string) => console.error("  -", e));
    process.exit(1);
  }

  console.log(`Seeding ${SKILLS.length} skills...`);

  const codeToId = new Map<string, string>();

  for (const s of SKILLS) {
    const [row] = await db
      .insert(skills)
      .values({
        code: s.code,
        domain: s.domain,
        name: s.name,
        description: s.description ?? null,
        cefrLevel: s.cefrLevel,
        sortOrder: SKILLS.indexOf(s),
      })
      .onConflictDoUpdate({
        target: skills.code,
        set: {
          domain: s.domain,
          name: s.name,
          description: s.description ?? null,
          cefrLevel: s.cefrLevel,
          sortOrder: SKILLS.indexOf(s),
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: skills.id });
    codeToId.set(s.code, row!.id);
  }

  console.log(`Seeding prerequisites...`);
  for (const s of SKILLS) {
    for (const prereqCode of s.prerequisites) {
      const skillId = codeToId.get(s.code);
      const prereqId = codeToId.get(prereqCode);
      if (skillId && prereqId) {
        await db
          .insert(skillPrerequisites)
          .values({ skillId, prerequisiteId: prereqId })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`Seeding ${KNOWLEDGE_ITEMS.length} knowledge items...`);
  for (const ki of KNOWLEDGE_ITEMS) {
    const skillId = codeToId.get(ki.skillCode);
    if (!skillId) {
      console.warn(`  Skill not found for KI ${ki.code} (${ki.skillCode})`);
      continue;
    }

    await db
      .insert(knowledgeItems)
      .values({
        skillId,
        code: ki.code,
        cefrLevel: ki.cefrLevel,
        rule: ki.rule,
        examples: ki.examples,
        counterexamples: ki.counterexamples ?? [],
        commonErrors: ki.commonErrors ?? [],
        shortExplanation: ki.shortExplanation ? { en: ki.shortExplanation } : null,
        exerciseTypes: ki.exerciseTypes ?? [],
        masteryCriteria: ki.masteryCriteria ?? null,
        l1Notes: ki.l1Difficulty ?? null,
        status: "live",
      })
      .onConflictDoUpdate({
        target: knowledgeItems.code,
        set: {
          rule: ki.rule,
          examples: ki.examples,
          counterexamples: ki.counterexamples ?? [],
          commonErrors: ki.commonErrors ?? [],
          exerciseTypes: ki.exerciseTypes ?? [],
          masteryCriteria: ki.masteryCriteria ?? null,
          l1Notes: ki.l1Difficulty ?? null,
          status: "live",
          updatedAt: sql`now()`,
        },
      });
  }

  console.log("Taxonomy seeded.");
  return codeToId;
}

async function main() {
  const db = await getDb();

  await seedTaxonomy(db);

  console.log("\nDone. Run the server seed-content service to create course structures.");

  if ("_client" in db) {
    await (db as any)._client.end();
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
