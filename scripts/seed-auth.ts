/**
 * Seed the superuser for Trinity House dashboard login.
 * Run after db:migrate. Requires app_users table (002_app_users.sql).
 *
 * Set in .env (do not commit .env):
 *   SUPERUSER_EMAIL=chuksa@gmail.com
 *   SUPERUSER_PASSWORD=your-secure-password
 *
 * Usage: npm run db:seed-auth
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";

function loadEnv(): void {
  // Load .env from project root: same folder as this script's parent
  const envPath = resolve(__dirname, "..", ".env");
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  } catch (e) {
    console.error("Could not load .env from", envPath, e instanceof Error ? e.message : "");
  }
}

loadEnv();
// If still missing, try cwd (e.g. when tsx runs from a different context)
if (!process.env.SUPERUSER_EMAIL || !process.env.SUPERUSER_PASSWORD) {
  const cwdPath = resolve(process.cwd(), ".env");
  const dirPath = resolve(__dirname, "..", ".env");
  if (cwdPath !== dirPath) {
    try {
      const content = readFileSync(cwdPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    } catch {
      // ignore
    }
  }
}

async function seedAuth() {
  const email = (process.env.SUPERUSER_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SUPERUSER_PASSWORD ?? "";

  if (!email || !password) {
    console.error("Set SUPERUSER_EMAIL and SUPERUSER_PASSWORD in .env and run again.");
    process.exit(1);
  }

  const { getClient } = await import("../src/lib/db");
  const client = await getClient();
  try {
    await client.query("SET search_path TO trinityhouse, public");
    const hash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO app_users (email, password_hash, role)
       VALUES ($1, $2, 'superuser')
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = 'superuser',
         updated_at = NOW()`,
      [email, hash]
    );
    console.log(`Superuser ${email} created or updated.`);
  } finally {
    client.release();
  }
}

seedAuth().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
