import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  /** When "message", id is staff_message id; click marks read and goes to Messages. */
  type?: "message";
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications: NotificationItem[] = [];

    try {
      const { rows: userRows } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [payload.email]);
      const myId = userRows[0]?.id;
      if (myId) {
        const { rows: msgRows } = await query<{ id: string; body: string; created_at: string; sender_email: string }>(
          `SELECT m.id, m.body, m.created_at::text, u.email AS sender_email
           FROM staff_messages m
           JOIN app_users u ON u.id = m.sender_id
           WHERE m.recipient_id = $1 AND m.read_at IS NULL
           ORDER BY m.created_at DESC
           LIMIT 20`,
          [myId]
        );
        for (const r of msgRows) {
          notifications.push({
            id: r.id,
            title: `New message from ${r.sender_email}`,
            body: r.body.length > 80 ? r.body.slice(0, 80) + "…" : r.body,
            read: false,
            createdAt: r.created_at,
            type: "message",
          });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("staff_messages") && !msg.includes("does not exist")) {
        console.error("[notifications GET] staff_messages", e);
      }
    }

    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("[notifications GET]", e);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
