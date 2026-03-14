import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getAppUserId(email: string): Promise<number | null> {
  const { rows } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [email]);
  return rows[0]?.id ?? null;
}

/** POST: Mark all messages to the current user as read. */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myId = await getAppUserId(payload.email);
    if (!myId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await query(
      "UPDATE staff_messages SET read_at = NOW() WHERE recipient_id = $1 AND read_at IS NULL",
      [myId]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[messages mark-read POST]", e);
    return NextResponse.json({ error: "Failed to mark messages read" }, { status: 500 });
  }
}
