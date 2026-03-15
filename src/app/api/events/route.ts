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

/** List all events (dashboard). */
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    type Row = {
      id: string;
      title: string;
      type: string;
      date: string;
      time: string;
      end_time: string | null;
      location: string | null;
      capacity: number;
      registered: number;
      checked_in: number;
      description: string | null;
      teams: string[];
      show_public: boolean | null;
      recurrence_type?: string | null;
      recurrence_end_date?: string | null;
    };
    let rows: Row[];
    try {
      const result = await query<Row>(
        `SELECT e.id, e.title, e.type, e.date::text, e.time, e.end_time, e.location, e.capacity,
                COALESCE(r.cnt, 0)::int AS registered,
                e.checked_in, e.description,
                COALESCE(e.teams, '{}') AS teams, e.show_public,
                e.recurrence_type, e.recurrence_end_date::text
         FROM events e
         LEFT JOIN (SELECT event_id, COUNT(*) AS cnt FROM event_registrations GROUP BY event_id) r ON r.event_id = e.id
         ORDER BY e.date ASC, e.time ASC`
      );
      rows = result.rows;
    } catch (colErr: unknown) {
      const m = colErr instanceof Error ? colErr.message : String(colErr);
      if (m.includes("recurrence_type") || m.includes("recurrence_end_date") || m.includes("event_registrations") || m.includes("does not exist")) {
        try {
          const result = await query<Row>(
            `SELECT e.id, e.title, e.type, e.date::text, e.time, e.end_time, e.location, e.capacity,
                    COALESCE(r.cnt, 0)::int AS registered,
                    e.checked_in, e.description,
                    COALESCE(e.teams, '{}') AS teams, e.show_public
             FROM events e
             LEFT JOIN (SELECT event_id, COUNT(*) AS cnt FROM event_registrations GROUP BY event_id) r ON r.event_id = e.id
             ORDER BY e.date ASC, e.time ASC`
          );
          rows = result.rows;
        } catch {
          const result = await query<Row>(
            `SELECT id, title, type, date::text, time, end_time, location, capacity, registered, checked_in, description,
                    COALESCE(teams, '{}') AS teams, show_public
             FROM events ORDER BY date ASC, time ASC`
          );
          rows = result.rows;
        }
      } else {
        throw colErr;
      }
    }
    const events = rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      date: r.date,
      time: r.time,
      endTime: r.end_time ?? undefined,
      location: r.location ?? "",
      capacity: r.capacity,
      registered: r.registered,
      checkedIn: r.checked_in,
      description: r.description ?? undefined,
      teams: Array.isArray(r.teams) ? r.teams : [],
      showPublic: r.show_public !== false,
      recurrenceType: (r.recurrence_type ?? "none") as string,
      recurrenceEndDate: r.recurrence_end_date ?? undefined,
    }));
    return NextResponse.json({ events });
  } catch (e) {
    console.error("[events GET]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load events" }, { status: 500 });
  }
}

/** Create event (dashboard). */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const id = (body.id ?? `e-${Date.now()}`).toString().trim() || `e-${Date.now()}`;
    const title = (body.title ?? "").toString().trim();
    const type = (body.type ?? "event").toString().trim();
    const date = (body.date ?? "").toString().trim();
    const time = (body.time ?? "").toString().trim();
    const endTime = (body.endTime ?? body.end_time ?? "").toString().trim() || null;
    const location = (body.location ?? "").toString().trim() || null;
    const capacity = Math.max(0, parseInt(String(body.capacity), 10) || 0);
    const description = (body.description ?? "").toString().trim() || null;
    const teams = Array.isArray(body.teams) ? body.teams : [];
    const showPublic = body.showPublic !== false;
    const recurrenceType = (body.recurrenceType ?? body.recurrence_type ?? "none").toString().trim() || "none";
    const recurrenceEndDate = (body.recurrenceEndDate ?? body.recurrence_end_date ?? "").toString().trim() || null;

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Title, date, and time are required" }, { status: 400 });
    }

    const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Failed to save event");

    try {
      await query(
        `INSERT INTO events (id, title, type, date, time, end_time, location, capacity, description, teams, show_public, recurrence_type, recurrence_end_date, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title, type = EXCLUDED.type, date = EXCLUDED.date, time = EXCLUDED.time,
           end_time = EXCLUDED.end_time, location = EXCLUDED.location, capacity = EXCLUDED.capacity,
           description = EXCLUDED.description, teams = EXCLUDED.teams, show_public = EXCLUDED.show_public,
           recurrence_type = EXCLUDED.recurrence_type, recurrence_end_date = EXCLUDED.recurrence_end_date, updated_at = NOW()`,
        [id, title, type, date, time, endTime, location, capacity, description, teams, showPublic, recurrenceType, recurrenceEndDate]
      );
      return NextResponse.json({ ok: true, id });
    } catch (first: unknown) {
      const msg = errMsg(first);
      if (typeof msg === "string" && (msg.includes("recurrence_type") || msg.includes("recurrence_end_date") || msg.includes("does not exist"))) {
        try {
          await query(
            `INSERT INTO events (id, title, type, date, time, end_time, location, capacity, description, teams, show_public, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title, type = EXCLUDED.type, date = EXCLUDED.date, time = EXCLUDED.time,
               end_time = EXCLUDED.end_time, location = EXCLUDED.location, capacity = EXCLUDED.capacity,
               description = EXCLUDED.description, teams = EXCLUDED.teams, show_public = EXCLUDED.show_public, updated_at = NOW()`,
            [id, title, type, date, time, endTime, location, capacity, description, teams, showPublic]
          );
          return NextResponse.json({ ok: true, id });
        } catch (second: unknown) {
          console.error("[events POST]", second);
          return NextResponse.json({ error: errMsg(second) }, { status: 500 });
        }
      }
      console.error("[events POST]", first);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (e) {
    console.error("[events POST]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to save event" }, { status: 500 });
  }
}
