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
import bcrypt from "bcryptjs";
import { getClient } from "../src/lib/db";

async function seedAuth() {
  const email = (process.env.SUPERUSER_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SUPERUSER_PASSWORD ?? "";

  if (!email || !password) {
    console.error("Set SUPERUSER_EMAIL and SUPERUSER_PASSWORD in .env and run again.");
    process.exit(1);
  }

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
