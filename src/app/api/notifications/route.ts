import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Live list: empty until we have a notifications table. Dot is off when empty.
    const notifications: NotificationItem[] = [];
    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("[notifications GET]", e);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}
