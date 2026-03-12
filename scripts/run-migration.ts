/**
 * Run TrinityHouse SQL migrations against the database.
 * Requires DATABASE_URL in .env (same server as Viggil: viggil-db.postgres.database.azure.com).
 * Usage: npm run db:migrate
 */
import { readFileSync } from "fs";
import { join } from "path";
import { getClient } from "../src/lib/db";

const migrationsDir = join(__dirname, "migrations");

async function run() {
  const client = await getClient();
  try {
    // Ensure schema exists (we're already using search_path in getClient, but schema must exist)
    await client.query("CREATE SCHEMA IF NOT EXISTS trinityhouse");
    const sql = readFileSync(join(migrationsDir, "001_initial_schema.sql"), "utf-8");
    // Run the migration (statements are separated by semicolons; we run as one script)
    await client.query(sql);
    console.log("Migration 001_initial_schema.sql completed.");
  } finally {
    client.release();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
