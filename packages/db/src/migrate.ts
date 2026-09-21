import { migrate as neonMigrate } from "drizzle-orm/neon-http/migrator";
import { migrate as pgMigrate } from "drizzle-orm/postgres-js/migrator";

const MIGRATIONS_FOLDER = "./drizzle/migrations";

async function main() {
  const databaseUrl = process.env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  console.log("Running migrations...");

  const isNeon = databaseUrl.includes("neon.tech");

  if (isNeon) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    const sql = neon(databaseUrl);
    const db = drizzle(sql);
    await neonMigrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  } else {
    const postgres = (await import("postgres")).default;
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const sql = postgres(databaseUrl, { max: 1 });
    const db = drizzle(sql);
    await pgMigrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    await sql.end();
  }

  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
