import { createDb } from "@falatorio/db/client";
import { seedAllCourses } from "../services/seed-content.service.js";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function main() {
  console.log("Connecting to database...");
  const db = createDb(DATABASE_URL!);

  console.log("Seeding course structure for all L1s...\n");
  const results = await seedAllCourses(db);

  for (const [l1, result] of Object.entries(results)) {
    console.log(
      `  ${l1}: ${result.sectionCount} sections, ${result.unitCount} units, ` +
      `${result.lessonCount} lessons, ${result.chestCount} chests`,
    );
  }

  console.log("\nCourse structure seeded.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
