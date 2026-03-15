import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return payload;
}

/** PATCH: Update a prayer request (status, prayer count). */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  try {
    const body = await req.json();

    if (body.status) {
      await query("UPDATE prayer_requests SET status = $1 WHERE id = $2", [body.status, id]);
    }
    if (body.incrementPrayer) {
      const userEmail = (auth.email ?? "").toString().trim().toLowerCase();
      let inserted = false;
      try {
        const insertResult = await query(
          `INSERT INTO prayer_prayed (prayer_request_id, user_email) VALUES ($1, $2)
           ON CONFLICT (prayer_request_id, user_email) DO NOTHING`,
          [id, userEmail]
        );
        inserted = (insertResult.rowCount ?? 0) > 0;
      } catch {
        try {
          await query(`
            CREATE TABLE IF NOT EXISTS prayer_prayed (
              prayer_request_id TEXT NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
              user_email TEXT NOT NULL,
              prayed_at TIMESTAMPTZ DEFAULT NOW(),
              PRIMARY KEY (prayer_request_id, user_email)
            )
          `);
          const retry = await query(
            `INSERT INTO prayer_prayed (prayer_request_id, user_email) VALUES ($1, $2)
             ON CONFLICT (prayer_request_id, user_email) DO NOTHING`,
            [id, userEmail]
          );
          inserted = (retry.rowCount ?? 0) > 0;
        } catch (e2) {
          console.error("[prayer-requests PATCH prayer_prayed]", e2);
        }
      }
      if (inserted) {
        await query("UPDATE prayer_requests SET prayer_count = prayer_count + 1 WHERE id = $1", [id]);
      }
      return NextResponse.json({ ok: true, incremented: inserted, alreadyPrayed: !inserted });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[prayer-requests PATCH]", e);
    return NextResponse.json({ error: "Failed to update prayer request" }, { status: 500 });
  }
}

/** DELETE: Remove a prayer request. */
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  try {
    await query("DELETE FROM prayer_requests WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[prayer-requests DELETE]", e);
    return NextResponse.json({ error: "Failed to delete prayer request" }, { status: 500 });
  }
}
