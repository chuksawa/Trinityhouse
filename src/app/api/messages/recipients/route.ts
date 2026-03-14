import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: List other app users (active) that the current user can message. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows: me } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [payload.email]);
    const myId = me[0]?.id;
    if (!myId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { rows } = await query<{ id: number; email: string }>(
      "SELECT id, email FROM app_users WHERE id != $1 AND COALESCE(status, 'active') = 'active' ORDER BY email",
      [myId]
    );
    return NextResponse.json({
      recipients: rows.map((r) => ({ id: r.id, email: r.email, label: r.email })),
    });
  } catch (e) {
    console.error("[messages/recipients GET]", e);
    return NextResponse.json({ error: "Failed to load recipients" }, { status: 500 });
  }
}
