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

    const { rows: users } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [payload.email]);
    const appUserId = users[0]?.id;
    if (!appUserId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { rows: prefs } = await query<{ email_enabled: boolean; sms_enabled: boolean; push_enabled: boolean }>(
      "SELECT email_enabled, sms_enabled, push_enabled FROM notification_preferences WHERE app_user_id = $1",
      [appUserId]
    );
    const p = prefs[0];
    return NextResponse.json({
      emailEnabled: p?.email_enabled ?? true,
      smsEnabled: p?.sms_enabled ?? false,
      pushEnabled: p?.push_enabled ?? true,
    });
  } catch (e) {
    console.error("[settings/notifications GET]", e);
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows: users } = await query<{ id: number }>("SELECT id FROM app_users WHERE email = $1", [payload.email]);
    const appUserId = users[0]?.id;
    if (!appUserId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const emailEnabled = Boolean(body.emailEnabled);
    const smsEnabled = Boolean(body.smsEnabled);
    const pushEnabled = Boolean(body.pushEnabled);

    await query(
      `INSERT INTO notification_preferences (app_user_id, email_enabled, sms_enabled, push_enabled, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (app_user_id) DO UPDATE SET
         email_enabled = EXCLUDED.email_enabled,
         sms_enabled = EXCLUDED.sms_enabled,
         push_enabled = EXCLUDED.push_enabled,
         updated_at = NOW()`,
      [appUserId, emailEnabled, smsEnabled, pushEnabled]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[settings/notifications POST]", e);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
