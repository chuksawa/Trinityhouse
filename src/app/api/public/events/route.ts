import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public list of events (no auth). Only future events with show_public = true. */
export async function GET() {
  try {
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
      show_public: boolean;
    }>(
      `SELECT id, title, type, date::text, time, end_time, location, capacity, registered, description, show_public
       FROM events
       WHERE date >= CURRENT_DATE AND (show_public IS NULL OR show_public = true)
       ORDER BY date ASC, time ASC`
    );
    const events = rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      date: r.date,
      time: r.time,
      endTime: r.end_time ?? undefined,
      location: r.location ?? "",
      capacity: r.capacity,
      registered: r.registered,
      description: r.description ?? undefined,
    }));
    return NextResponse.json({ events });
  } catch (e) {
    console.error("[public/events GET]", e);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}
