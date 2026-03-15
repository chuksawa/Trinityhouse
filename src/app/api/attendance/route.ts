import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id            SERIAL PRIMARY KEY,
      event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      person_id     TEXT REFERENCES people(id) ON DELETE SET NULL,
      guest_name    TEXT,
      checked_in_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (event_id, person_id)
    )
  `);
  try {
    await query("CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance_records(event_id)");
    await query("CREATE INDEX IF NOT EXISTS idx_attendance_person ON attendance_records(person_id)");
  } catch {
    // indexes may already exist
  }
  tableEnsured = true;
}

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return payload;
}

/** GET: Attendance summary — weekly totals for the trend chart, plus per-event counts. */
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId");

  try {
    await ensureTable();

    if (eventId) {
      const { rows } = await query<{ id: number; person_id: string | null; guest_name: string | null; first_name: string | null; last_name: string | null; checked_in_at: string }>(
        `SELECT a.id, a.person_id, a.guest_name, p.first_name, p.last_name, a.checked_in_at::text
         FROM attendance_records a
         LEFT JOIN people p ON p.id = a.person_id
         WHERE a.event_id = $1
         ORDER BY a.checked_in_at DESC`,
        [eventId]
      );
      const attendees = rows.map((r) => ({
        id: r.id,
        personId: r.person_id,
        name: r.person_id ? [r.first_name, r.last_name].filter(Boolean).join(" ") : r.guest_name || "Guest",
        checkedInAt: r.checked_in_at,
      }));
      return NextResponse.json({ attendees, count: attendees.length });
    }

    // Weekly attendance trend (last 12 weeks)
    const { rows: trend } = await query<{ week: string; count: string }>(
      `SELECT TO_CHAR(DATE_TRUNC('week', a.checked_in_at), 'YYYY-MM-DD') AS week,
              COUNT(*)::text AS count
       FROM attendance_records a
       WHERE a.checked_in_at >= NOW() - INTERVAL '12 weeks'
       GROUP BY DATE_TRUNC('week', a.checked_in_at)
       ORDER BY week ASC`
    );

    const weeklyTrend = trend.map((r) => ({
      week: r.week,
      attendance: parseInt(r.count, 10),
    }));

    return NextResponse.json({ weeklyTrend });
  } catch (e) {
    console.error("[attendance GET]", e);
    return NextResponse.json({ error: "Failed to load attendance" }, { status: 500 });
  }
}

/** POST: Self-check-in — the logged-in user checks themselves into an event. */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    await ensureTable();

    const body = await req.json();
    const eventId = (body.eventId ?? "").toString().trim();

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    const email = auth.email as string;

    try {
      await query(
        `INSERT INTO attendance_records (event_id, person_id, guest_name)
         VALUES ($1, NULL, $2)`,
        [eventId, email]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unique") || msg.includes("duplicate")) {
        return NextResponse.json({ error: "You are already checked in." }, { status: 409 });
      }
      throw e;
    }

    await query(
      "UPDATE events SET checked_in = (SELECT COUNT(*) FROM attendance_records WHERE event_id = $1) WHERE id = $1",
      [eventId]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[attendance POST]", e);
    return NextResponse.json({ error: "Check-in failed." }, { status: 500 });
  }
}
