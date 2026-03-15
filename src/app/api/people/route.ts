import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { getEditablePeopleRoles } from "@/lib/hierarchy";

type PersonRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  join_date: string;
  status: string;
  last_attendance: string | null;
  giving_total: string;
  avatar_color: string | null;
  funnel_stage: string | null;
};

/** GET: List all people (members) from DB. Auth required. Returns people + currentUserEditableRoles for UI. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let rows: PersonRow[];
    try {
      const result = await query<PersonRow>(
        `SELECT id, first_name, last_name, email, phone, role, join_date::text, status,
                last_attendance::text, COALESCE(giving_total, 0)::text AS giving_total, avatar_color,
                funnel_stage
         FROM people ORDER BY last_name, first_name`
      );
      rows = result.rows;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("funnel_stage") || msg.includes("does not exist")) {
        const result = await query<PersonRow>(
          `SELECT id, first_name, last_name, email, phone, role, join_date::text, status,
                  last_attendance::text, COALESCE(giving_total, 0)::text AS giving_total, avatar_color,
                  NULL AS funnel_stage
           FROM people ORDER BY last_name, first_name`
        );
        rows = result.rows;
      } else {
        throw e;
      }
    }

    const editableRoles = await getEditablePeopleRoles(payload.role);

    return NextResponse.json({
      people: rows.map((r) => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone ?? "",
        role: r.role,
        joinDate: r.join_date,
        status: r.status,
        lastAttendance: r.last_attendance ?? null,
        givingTotal: parseFloat(r.giving_total) || 0,
        avatarColor: r.avatar_color ?? "bg-brand-500",
        funnelStage: r.funnel_stage ?? "visitor",
      })),
      currentUserEditableRoles: editableRoles,
    });
  } catch (e) {
    console.error("[people GET]", e);
    return NextResponse.json({ error: "Failed to load people" }, { status: 500 });
  }
}
