import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/** GET: Role hierarchy config. Superuser only. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "superuser") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { rows: orderRows } = await query<{ role: string; rank: number }>(
      "SELECT role, rank FROM people_role_hierarchy ORDER BY rank ASC"
    );
    const { rows: scopeRows } = await query<{ app_role: string; editable_people_roles: string[] }>(
      "SELECT app_role, editable_people_roles FROM app_role_edit_scope ORDER BY app_role"
    );

    return NextResponse.json({
      peopleRoleOrder: orderRows.map((r) => ({ role: r.role, rank: r.rank })),
      appRoleEditScope: Object.fromEntries(scopeRows.map((s) => [s.app_role, s.editable_people_roles ?? []])),
    });
  } catch (e) {
    console.error("[admin/hierarchy GET]", e);
    return NextResponse.json({ error: "Failed to load hierarchy" }, { status: 500 });
  }
}

/** PATCH: Update role hierarchy config. Superuser only. Body: { peopleRoleOrder?: { role, rank }[], appRoleEditScope?: Record<string, string[]> } */
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "superuser") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    if (body.peopleRoleOrder && Array.isArray(body.peopleRoleOrder)) {
      for (const item of body.peopleRoleOrder as { role: string; rank: number }[]) {
        if (item.role && typeof item.rank === "number") {
          await query(
            "INSERT INTO people_role_hierarchy (role, rank) VALUES ($1, $2) ON CONFLICT (role) DO UPDATE SET rank = $2",
            [item.role, item.rank]
          );
        }
      }
    }

    if (body.appRoleEditScope && typeof body.appRoleEditScope === "object") {
      for (const [appRole, roles] of Object.entries(body.appRoleEditScope)) {
        const arr = Array.isArray(roles) ? (roles as string[]) : [];
        await query(
          "INSERT INTO app_role_edit_scope (app_role, editable_people_roles) VALUES ($1, $2) ON CONFLICT (app_role) DO UPDATE SET editable_people_roles = $2",
          [appRole, arr]
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/hierarchy PATCH]", e);
    return NextResponse.json({ error: "Failed to update hierarchy" }, { status: 500 });
  }
}
