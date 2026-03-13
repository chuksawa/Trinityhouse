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
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      role: string;
      join_date: string;
      status: string;
    }>("SELECT id, first_name, last_name, email, phone, role, join_date::text, status FROM people ORDER BY last_name, first_name");

    const headers = ["id", "first_name", "last_name", "email", "phone", "role", "join_date", "status"];
    const escape = (v: string | null) => (v == null ? "" : String(v).includes(",") || String(v).includes('"') ? `"${String(v).replace(/"/g, '""')}"` : v);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape((r as Record<string, string | null>)[h])).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"trinityhouse-people.csv\"",
      },
    });
  } catch (e) {
    console.error("[settings/export/people]", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
