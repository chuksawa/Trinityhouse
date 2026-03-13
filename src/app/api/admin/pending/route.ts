import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/** GET: List pending registration requests. Superuser only. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "superuser") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let rows: { id: number; email: string; created_at: string; registration_type?: string }[];
    try {
      const result = await query<{ id: number; email: string; created_at: string; registration_type: string }>(
        "SELECT id, email, created_at::text, COALESCE(registration_type, 'staff') AS registration_type FROM app_users WHERE COALESCE(status, 'active') = 'pending' ORDER BY created_at ASC"
      );
      rows = result.rows;
    } catch {
      const result = await query<{ id: number; email: string; created_at: string }>(
        "SELECT id, email, created_at::text FROM app_users WHERE COALESCE(status, 'active') = 'pending' ORDER BY created_at ASC"
      );
      rows = result.rows.map((r) => ({ ...r, registration_type: undefined }));
    }
    return NextResponse.json({
      pending: rows.map((r) => ({ id: r.id, email: r.email, requestedAt: r.created_at, registrationType: r.registration_type })),
    });
  } catch (e) {
    console.error("[admin/pending GET]", e);
    return NextResponse.json({ error: "Failed to load pending requests" }, { status: 500 });
  }
}
