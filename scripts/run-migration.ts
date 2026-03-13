/**
 * Run TrinityHouse SQL migrations against the database.
 * Requires DATABASE_URL in .env (same server as Viggil: viggil-db.postgres.database.azure.com).
 * Usage: npm run db:migrate
 */
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { getClient } from "../src/lib/db";

const migrationsDir = join(__dirname, "migrations");

async function run() {
  const client = await getClient();
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS trinityhouse");
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf-8");
      await client.query(sql);
      console.log(`Migration ${file} completed.`);
    }
  } finally {
    client.release();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
