import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/** GET: Return nav visibility config for all roles. Auth required. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let rows: { nav_visibility_by_role: Record<string, string[]> }[] = [];
    try {
      const result = await query<{ nav_visibility_by_role: Record<string, string[]> }>(
        "SELECT nav_visibility_by_role FROM church_profile WHERE id = 1"
      );
      rows = result.rows;
    } catch {
      // Column may not exist before migration 011; use default
    }

    const raw = rows[0]?.nav_visibility_by_role;
    const navVisibility =
      raw && typeof raw === "object" && !Array.isArray(raw)
        ? (raw as Record<string, string[]>)
        : { user: ["/home", "/dashboard", "/dashboard/groups", "/dashboard/communication"] };

    return NextResponse.json({ navVisibility });
  } catch (e) {
    console.error("[settings/nav-visibility GET]", e);
    return NextResponse.json({ error: "Failed to load nav visibility" }, { status: 500 });
  }
}

/** PATCH: Update nav visibility (admin/superuser only). */
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = payload.role as string;
    if (role !== "superuser" && role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Only admins can change nav visibility." }, { status: 403 });
    }

    const body = await req.json();
    const navVisibility = body.navVisibility;
    if (!navVisibility || typeof navVisibility !== "object" || Array.isArray(navVisibility)) {
      return NextResponse.json({ error: "navVisibility must be an object (e.g. { user: [...] })" }, { status: 400 });
    }

    const sanitized: Record<string, string[]> = {};
    for (const [roleKey, hrefs] of Object.entries(navVisibility)) {
      if (typeof roleKey !== "string" || !Array.isArray(hrefs)) continue;
      sanitized[roleKey] = hrefs.filter((h: unknown) => typeof h === "string" && h.startsWith("/"));
    }

    await query(
      "UPDATE church_profile SET nav_visibility_by_role = $1, updated_at = NOW() WHERE id = 1",
      [JSON.stringify(sanitized)]
    );
    return NextResponse.json({ ok: true, navVisibility: sanitized });
  } catch (e) {
    console.error("[settings/nav-visibility PATCH]", e);
    return NextResponse.json({ error: "Failed to save nav visibility" }, { status: 500 });
  }
}
