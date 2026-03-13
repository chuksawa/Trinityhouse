import { Pool } from "pg";

/**
 * TrinityHouse shares the Viggil Azure PostgreSQL server (viggil-db.postgres.database.azure.com).
 * All tables live in schema `trinityhouse` so Viggil's `public` schema is untouched.
 * Set DATABASE_URL in .env to the same connection string as Viggil (see Credentials_And_Keys.md).
 */
const connStr = (process.env.DATABASE_URL ?? "").trim();
let url: URL | null = null;
if (connStr && (connStr.startsWith("postgresql://") || connStr.startsWith("postgres://"))) {
  try {
    url = new URL(connStr);
  } catch {
    url = null;
  }
}

const pool = url
  ? new Pool({
      host: url.hostname,
      port: parseInt(url.port || "5432", 10),
      database: url.pathname.slice(1) || "postgres",
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
  : null;

/** Run a query in the trinityhouse schema (search_path set so tables need no prefix). */
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number | null }> {
  if (!pool) {
    throw new Error("DATABASE_URL is not set. Add it to .env to use the database.");
  }
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO trinityhouse, public");
    const result = await client.query(text, params);
    return { rows: result.rows as T[], rowCount: result.rowCount };
  } finally {
    client.release();
  }
}

/** Get a client with search_path already set (for transactions). */
export async function getClient() {
  if (!pool) {
    throw new Error("DATABASE_URL is not set. Add it to .env to use the database.");
  }
  const client = await pool.connect();
  await client.query("SET search_path TO trinityhouse, public");
  return client;
}

export default pool;
