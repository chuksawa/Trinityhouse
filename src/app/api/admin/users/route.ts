import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/** GET: List all app users (id, email, role, status). Superuser only. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "superuser") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { rows } = await query<{ id: number; email: string; role: string; status: string; created_at: string }>(
      "SELECT id, email, role, COALESCE(status, 'active') AS status, created_at::text FROM app_users ORDER BY created_at DESC"
    );
    return NextResponse.json({
      users: rows.map((r) => ({
        id: r.id,
        email: r.email,
        role: r.role,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    console.error("[admin/users GET]", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
