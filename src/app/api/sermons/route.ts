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

/** POST: Create a new sermon. Auth required. */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = (body.title ?? "").toString().trim();
    const speaker = (body.speaker ?? "").toString().trim();
    const series = (body.series ?? "").toString().trim();
    const dateStr = (body.date ?? "").toString().trim();
    const duration = (body.duration ?? "").toString().trim();
    const description = (body.description ?? "").toString().trim();

    if (!title || !speaker || !series || !dateStr) {
      return NextResponse.json(
        { error: "Title, speaker, series, and date are required" },
        { status: 400 }
      );
    }
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const dateOnly = date.toISOString().slice(0, 10);

    const id = crypto.randomUUID();
    await query(
      `INSERT INTO sermons (id, title, speaker, series, date, duration, views, description)
       VALUES ($1, $2, $3, $4, $5::date, $6, 0, $7)`,
      [id, title, speaker, series, dateOnly, duration || null, description || null]
    );
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error("[sermons POST]", e);
    return NextResponse.json({ error: "Failed to create sermon" }, { status: 500 });
  }
}
