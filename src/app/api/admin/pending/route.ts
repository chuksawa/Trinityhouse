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

    const { rows } = await query<{ id: number; email: string; created_at: string }>(
      "SELECT id, email, created_at::text FROM app_users WHERE COALESCE(status, 'active') = 'pending' ORDER BY created_at ASC"
    );
    return NextResponse.json({
      pending: rows.map((r) => ({ id: r.id, email: r.email, requestedAt: r.created_at })),
    });
  } catch (e) {
    console.error("[admin/pending GET]", e);
    return NextResponse.json({ error: "Failed to load pending requests" }, { status: 500 });
  }
}
