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

/** Update event (dashboard). */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Event id required" }, { status: 400 });
  try {
    const b = await req.json();
    const title = (b.title ?? "").toString().trim();
    const type = (b.type ?? "event").toString().trim();
    const date = (b.date ?? "").toString().trim();
    const time = (b.time ?? "").toString().trim();
    const endTime = (b.endTime ?? b.end_time ?? "").toString().trim() || null;
    const location = (b.location ?? "").toString().trim() || null;
    const capacity = Math.max(0, parseInt(String(b.capacity), 10) || 0);
    const description = (b.description ?? "").toString().trim() || null;
    const teams = Array.isArray(b.teams) ? b.teams : [];
    const showPublic = b.showPublic !== false;
    const recurrenceType = (b.recurrenceType ?? b.recurrence_type ?? "none").toString().trim() || "none";
    const recurrenceEndDate = (b.recurrenceEndDate ?? b.recurrence_end_date ?? "").toString().trim() || null;

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Title, date, and time are required" }, { status: 400 });
    }

    await query(
      `UPDATE events SET title = $1, type = $2, date = $3, time = $4, end_time = $5, location = $6,
        capacity = $7, description = $8, teams = $9, show_public = $10, recurrence_type = $11, recurrence_end_date = $12, updated_at = NOW()
       WHERE id = $13`,
      [title, type, date, time, endTime, location, capacity, description, teams, showPublic, recurrenceType, recurrenceEndDate, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[events PATCH]", e);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

/** Delete event (dashboard). */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Event id required" }, { status: 400 });
  try {
    await query("DELETE FROM events WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[events DELETE]", e);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
