import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAppUserId(email: string): Promise<number | null> {
  const { rows } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [email]);
  return rows[0]?.id ?? null;
}

/** PATCH: Mark a message as read (recipient only). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myId = await getAppUserId(payload.email);
    if (!myId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (body.read !== true) {
      return NextResponse.json({ error: "Expected { read: true }" }, { status: 400 });
    }

    const { rowCount } = await query(
      "UPDATE staff_messages SET read_at = NOW() WHERE id = $1 AND recipient_id = $2",
      [id, myId]
    );
    if (rowCount === 0) {
      return NextResponse.json({ error: "Not found or not recipient" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[messages PATCH]", e);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}
