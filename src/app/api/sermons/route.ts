import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { id: string; title: string; speaker: string; series: string; date: string; duration: string | null; views: number; description: string | null; show_public: boolean | null };

/** GET: List all sermons for dashboard (auth required). */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let rows: Row[];
    try {
      const result = await query<Row>(
        `SELECT id, title, speaker, series, date::text, duration, COALESCE(views, 0) AS views, description, show_public
         FROM sermons ORDER BY date DESC`
      );
      rows = result.rows;
    } catch (colErr: unknown) {
      const m = colErr instanceof Error ? colErr.message : String(colErr);
      if (m.includes("show_public") || m.includes("does not exist")) {
        const result = await query<Row>(
          `SELECT id, title, speaker, series, date::text, duration, COALESCE(views, 0) AS views, description, NULL::boolean AS show_public
           FROM sermons ORDER BY date DESC`
        );
        rows = result.rows;
      } else {
        throw colErr;
      }
    }
    const sermons = rows.map((r) => ({
      id: r.id,
      title: r.title,
      speaker: r.speaker,
      series: r.series,
      date: r.date,
      duration: r.duration ?? "",
      views: r.views,
      description: r.description ?? "",
      showPublic: r.show_public ?? true,
    }));
    return NextResponse.json({ sermons });
  } catch (e) {
    console.error("[sermons GET]", e);
    return NextResponse.json({ error: "Failed to load sermons" }, { status: 500 });
  }
}
