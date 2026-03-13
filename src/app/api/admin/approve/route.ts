import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

/** POST: Approve a pending registration. Superuser only. Body: { userId: number } */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "superuser") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const userId = Number(body.userId);
    if (!Number.isInteger(userId) || userId < 1) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const { rows: target } = await query<{ role: string; status: string }>(
      "SELECT role, COALESCE(status, 'active') AS status FROM app_users WHERE id = $1",
      [userId]
    );
    if (target.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target[0].role === "superuser") {
      return NextResponse.json({ error: "Cannot modify superuser" }, { status: 403 });
    }
    if (target[0].status !== "pending") {
      return NextResponse.json({ error: "User is not pending approval" }, { status: 400 });
    }

    await query("UPDATE app_users SET status = $1, updated_at = NOW() WHERE id = $2", ["active", userId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/approve POST]", e);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}
