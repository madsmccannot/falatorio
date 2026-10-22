import { createDb } from "@falatorio/db/client";
import { sql } from "drizzle-orm";
import { skills } from "@falatorio/db/schema";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const DOMAIN_BY_PREFIX: Array<[string, string]> = [
  ["PT.DISCOURSE.", "discourse"],
  ["PT.SEM.", "semantics"],
  ["PT.RHETORIC.", "rhetoric"],
];

async function main() {
  const db = createDb(DATABASE_URL!);

  for (const [prefix, domain] of DOMAIN_BY_PREFIX) {
    const result = await db
      .update(skills)
      .set({ domain: domain as any, updatedAt: new Date() })
      .where(sql`${skills.code} LIKE ${prefix + "%"} AND ${skills.domain} != ${domain}`)
      .returning({ code: skills.code });

    console.log(`${domain}: reassigned ${result.length} skills`);
    for (const row of result) {
      console.log(`  ${row.code}`);
    }
  }

  const counts = await db
    .select({
      domain: skills.domain,
      count: sql<number>`count(*)::int`,
    })
    .from(skills)
    .groupBy(skills.domain)
    .orderBy(sql`count(*) DESC`);

  console.log("\n-- Domain distribution --");
  for (const row of counts) {
    console.log(`  ${row.domain}: ${row.count}`);
  }
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
