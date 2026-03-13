import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await query<{ id: number; email: string; role: string; created_at: string }>(
      "SELECT id, email, role, created_at::text FROM app_users ORDER BY created_at DESC"
    );
    return NextResponse.json({
      users: rows.map((r) => ({ id: r.id, email: r.email, role: r.role, createdAt: r.created_at })),
      currentUserEmail: payload.email,
      currentUserRole: payload.role,
    });
  } catch (e) {
    console.error("[settings/roles GET]", e);
    return NextResponse.json({ error: "Failed to load roles" }, { status: 500 });
  }
}
