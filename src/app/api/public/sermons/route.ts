import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { id: string; title: string; speaker: string; series: string; date: string; duration: string | null; views: number; description: string | null };

/** Public list of sermons (no auth). Only sermons with show_public = true. */
export async function GET() {
  try {
    let rows: Row[];
    try {
      const result = await query<Row>(
        `SELECT id, title, speaker, series, date::text, duration, COALESCE(views, 0) AS views, description
         FROM sermons
         WHERE COALESCE(show_public, true) = true
         ORDER BY date DESC`
      );
      rows = result.rows;
    } catch (colErr: unknown) {
      const m = colErr instanceof Error ? colErr.message : String(colErr);
      if (m.includes("show_public") || m.includes("does not exist")) {
        const result = await query<Row>(
          `SELECT id, title, speaker, series, date::text, duration, COALESCE(views, 0) AS views, description
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
    }));
    return NextResponse.json({ sermons });
  } catch (e) {
    console.error("[public/sermons GET]", e);
    return NextResponse.json({ error: "Failed to load sermons" }, { status: 500 });
  }
}
