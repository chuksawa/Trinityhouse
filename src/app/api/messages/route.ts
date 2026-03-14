import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type MessageRow = {
  id: string;
  sender_id: number;
  recipient_id: number;
  body: string;
  created_at: string;
  read_at: string | null;
  sender_email: string;
  recipient_email: string;
};

async function getAppUserId(email: string): Promise<number | null> {
  const { rows } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [email]);
  return rows[0]?.id ?? null;
}

/** GET: List messages for the current user (sent and received). */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myId = await getAppUserId(payload.email);
    if (!myId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { rows } = await query<MessageRow>(
      `SELECT m.id, m.sender_id, m.recipient_id, m.body, m.created_at::text, m.read_at::text,
              s.email AS sender_email, r.email AS recipient_email
       FROM staff_messages m
       JOIN app_users s ON s.id = m.sender_id
       JOIN app_users r ON r.id = m.recipient_id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY m.created_at DESC
       LIMIT 200`,
      [myId]
    );
    const messages = rows.map((r) => ({
      id: r.id,
      senderId: r.sender_id,
      recipientId: r.recipient_id,
      body: r.body,
      createdAt: r.created_at,
      readAt: r.read_at ?? undefined,
      senderEmail: r.sender_email,
      recipientEmail: r.recipient_email,
      isFromMe: r.sender_id === myId,
    }));
    return NextResponse.json({ messages });
  } catch (e) {
    console.error("[messages GET]", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("staff_messages") && msg.includes("does not exist")) {
      return NextResponse.json({ messages: [] });
    }
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

/** POST: Send a new message. */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myId = await getAppUserId(payload.email);
    if (!myId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const recipientId = typeof body.recipientId === "number" ? body.recipientId : parseInt(String(body.recipientId ?? ""), 10);
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!recipientId || Number.isNaN(recipientId)) {
      return NextResponse.json({ error: "recipientId is required" }, { status: 400 });
    }
    if (!text) return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    if (recipientId === myId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO staff_messages (id, sender_id, recipient_id, body) VALUES ($1, $2, $3, $4)`,
      [id, myId, recipientId, text]
    );
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[messages POST]", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("staff_messages") && msg.includes("does not exist")) {
      return NextResponse.json({ error: "Messaging is not set up yet. Run the database migration (017_staff_messages.sql)." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
