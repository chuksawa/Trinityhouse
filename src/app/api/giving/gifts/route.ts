import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  person_id: string | null;
  amount: string;
  date: string;
  fund: string;
  method: string;
  recurring: boolean;
  first_name: string | null;
  last_name: string | null;
};

/** GET: List gifts from DB for the giving dashboard. Auth required. */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows } = await query<Row>(
      `SELECT g.id, g.person_id, g.amount::text, g.date::text, g.fund, g.method, g.recurring,
              p.first_name, p.last_name
       FROM gifts g
       LEFT JOIN people p ON p.id = g.person_id
       ORDER BY g.date DESC, g.created_at DESC
       LIMIT 500`
    );

    const gifts = rows.map((r) => {
      const personName =
        r.person_id && (r.first_name || r.last_name)
          ? [r.first_name, r.last_name].filter(Boolean).join(" ").trim()
          : r.person_id
            ? "Unknown"
            : "Guest";
      return {
        id: r.id,
        personId: r.person_id ?? null,
        personName,
        amount: parseFloat(r.amount) || 0,
        date: r.date,
        fund: r.fund as "tithe" | "offering" | "missions" | "building_fund" | "benevolence",
        method: r.method as "online" | "text" | "cash" | "check",
        recurring: !!r.recurring,
      };
    });

    return NextResponse.json({ gifts });
  } catch (e) {
    console.error("[giving/gifts GET]", e);
    return NextResponse.json({ error: "Failed to load gifts" }, { status: 500 });
  }
}
