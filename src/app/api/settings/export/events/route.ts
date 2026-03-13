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

    const { rows } = await query<{
      id: string;
      title: string;
      type: string;
      date: string;
      time: string;
      end_time: string | null;
      location: string | null;
      capacity: number;
      registered: number;
      description: string | null;
    }>("SELECT id, title, type, date::text, time, end_time, location, capacity, registered, description FROM events ORDER BY date DESC, time");

    const headers = ["id", "title", "type", "date", "time", "end_time", "location", "capacity", "registered", "description"];
    const escape = (v: string | number | null) => (v == null ? "" : String(v).includes(",") || String(v).includes('"') ? `"${String(v).replace(/"/g, '""')}"` : v);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as Record<string, string | number | null>)[h])).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"trinityhouse-events.csv\"",
      },
    });
  } catch (e) {
    console.error("[settings/export/events]", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
