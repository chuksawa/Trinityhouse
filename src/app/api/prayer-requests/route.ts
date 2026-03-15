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

let tableReady = false;

async function ensureColumns() {
  if (tableReady) return;
  try {
    await query("ALTER TABLE prayer_requests ALTER COLUMN person_id DROP NOT NULL");
  } catch { /* already nullable or doesn't exist */ }
  try {
    await query("ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS person_name TEXT");
  } catch { /* already exists */ }
  tableReady = true;
}

type Row = {
  id: string;
  person_name: string | null;
  person_id: string | null;
  request: string;
  request_date: string;
  status: string;
  prayer_count: number;
  first_name: string | null;
  last_name: string | null;
};

/** GET: List prayer requests. */
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    await ensureColumns();
    const { rows } = await query<Row>(
      `SELECT pr.id, pr.person_name, pr.person_id, pr.request, pr.request_date::text, pr.status, pr.prayer_count,
              p.first_name, p.last_name
       FROM prayer_requests pr
       LEFT JOIN people p ON p.id = pr.person_id
       ORDER BY pr.created_at DESC
       LIMIT 200`
    );
    const prayerRequests = rows.map((r) => ({
      id: r.id,
      personName: r.person_name || [r.first_name, r.last_name].filter(Boolean).join(" ") || "Unknown",
      request: r.request,
      requestDate: r.request_date,
      status: r.status,
      prayerCount: r.prayer_count,
    }));
    return NextResponse.json({ prayerRequests });
  } catch (e) {
    console.error("[prayer-requests GET]", e);
    return NextResponse.json({ error: "Failed to load prayer requests" }, { status: 500 });
  }
}

/** POST: Create a prayer request. */
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    await ensureColumns();
    const body = await req.json();
    const personName = (body.personName ?? "").toString().trim();
    const request = (body.request ?? "").toString().trim();
    if (!personName || !request) {
      return NextResponse.json({ error: "Name and request text are required." }, { status: 400 });
    }
    const id = `pr-${Date.now()}`;
    const date = new Date().toISOString().slice(0, 10);
    await query(
      `INSERT INTO prayer_requests (id, person_id, person_name, request, request_date, status, prayer_count)
       VALUES ($1, NULL, $2, $3, $4::date, 'active', 0)`,
      [id, personName, request, date]
    );
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[prayer-requests POST]", e);
    return NextResponse.json({ error: "Failed to create prayer request" }, { status: 500 });
  }
}
