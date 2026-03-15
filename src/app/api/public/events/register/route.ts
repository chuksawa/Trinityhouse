import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id            SERIAL PRIMARY KEY,
      event_id      TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      instance_date DATE,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      email         TEXT NOT NULL,
      phone         TEXT,
      registered_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  try { await query("ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS instance_date DATE"); } catch { /* already exists */ }
  try { await query("CREATE UNIQUE INDEX IF NOT EXISTS idx_event_reg_instance ON event_registrations(event_id, COALESCE(instance_date, '1970-01-01'), email)"); } catch { /* already exists */ }
  tableEnsured = true;
}

/** DELETE: Unregister from an event (public, no auth — requires email match). */
export async function DELETE(req: Request) {
  try {
    await ensureTable();

    const body = await req.json();
    const eventId = (body.eventId ?? "").toString().trim();
    const instanceDate = (body.instanceDate ?? "").toString().trim() || null;
    const email = (body.email ?? "").toString().trim().toLowerCase();

    if (!eventId || !email) {
      return NextResponse.json({ error: "Event ID and email are required." }, { status: 400 });
    }

    const { rowCount } = await query(
      instanceDate
        ? "DELETE FROM event_registrations WHERE event_id = $1 AND email = $2 AND instance_date = $3::date"
        : "DELETE FROM event_registrations WHERE event_id = $1 AND email = $2 AND instance_date IS NULL",
      instanceDate ? [eventId, email, instanceDate] : [eventId, email]
    );

    if (!rowCount || rowCount === 0) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "Registration cancelled." });
  } catch (e) {
    console.error("[public/events/register DELETE]", e);
    return NextResponse.json({ error: "Failed to unregister. Please try again." }, { status: 500 });
  }
}

/** POST: Register for an event (public, no auth). */
export async function POST(req: Request) {
  try {
    await ensureTable();

    const body = await req.json();
    const eventId = (body.eventId ?? "").toString().trim();
    const instanceDate = (body.instanceDate ?? "").toString().trim() || null;
    const firstName = (body.firstName ?? "").toString().trim();
    const lastName = (body.lastName ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const phone = (body.phone ?? "").toString().trim() || null;

    if (!eventId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Event ID, first name, last name, and email are required." }, { status: 400 });
    }

    const { rows: eventRows } = await query<{ id: string; capacity: number }>(
      "SELECT id, capacity FROM events WHERE id = $1",
      [eventId]
    );
    if (eventRows.length === 0) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const event = eventRows[0];

    if (event.capacity > 0) {
      const { rows: countRows } = await query<{ cnt: string }>(
        instanceDate
          ? "SELECT COUNT(*)::text AS cnt FROM event_registrations WHERE event_id = $1 AND instance_date = $2::date"
          : "SELECT COUNT(*)::text AS cnt FROM event_registrations WHERE event_id = $1 AND instance_date IS NULL",
        instanceDate ? [eventId, instanceDate] : [eventId]
      );
      const currentCount = parseInt(countRows[0]?.cnt ?? "0", 10);
      if (currentCount >= event.capacity) {
        return NextResponse.json({ error: "This event is full." }, { status: 409 });
      }
    }

    try {
      await query(
        `INSERT INTO event_registrations (event_id, instance_date, first_name, last_name, email, phone)
         VALUES ($1, $2::date, $3, $4, $5, $6)`,
        [eventId, instanceDate, firstName, lastName, email, phone]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unique") || msg.includes("duplicate")) {
        return NextResponse.json({ error: "You are already registered for this event." }, { status: 409 });
      }
      throw e;
    }

    return NextResponse.json({ ok: true, message: "Registration successful!" });
  } catch (e) {
    console.error("[public/events/register POST]", e);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
