import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/** PATCH: Set a user's role (admin | senior_staff | staff | user). Superuser only. Cannot modify superuser. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "superuser") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId < 1) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const role = (body.role ?? "").toString().toLowerCase();
    const allowedRoles = ["admin", "senior_staff", "staff", "user"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Role must be one of: admin, senior_staff, staff, user" }, { status: 400 });
    }

    const { rows: target } = await query<{ role: string }>(
      "SELECT role FROM app_users WHERE id = $1",
      [userId]
    );
    if (target.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target[0].role === "superuser") {
      return NextResponse.json({ error: "Superuser cannot be modified" }, { status: 403 });
    }

    await query("UPDATE app_users SET role = $1, updated_at = NOW() WHERE id = $2", [role, userId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/users/[id]/role PATCH]", e);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
