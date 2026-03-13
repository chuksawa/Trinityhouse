import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type RecurrenceType = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Generate instance dates for a recurring event from start until endDate or maxMonths. */
function expandRecurrence(
  startDateStr: string,
  recurrenceType: RecurrenceType,
  endDateStr: string | null,
  maxMonths: number = 12
): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const cutoff = new Date(start);
  cutoff.setMonth(cutoff.getMonth() + maxMonths);
  const end = endDateStr ? new Date(endDateStr) : cutoff;
  const limit = end > cutoff ? cutoff : end;
  let current = new Date(start);
  while (current <= limit && dates.length < 365) {
    dates.push(toDateStr(current));
    switch (recurrenceType) {
      case "daily":
        current = addDays(current, 1);
        break;
      case "weekly":
        current = addDays(current, 7);
        break;
      case "biweekly":
        current = addDays(current, 14);
        break;
      case "monthly":
        current = addMonths(current, 1);
        break;
      case "yearly":
        current = addYears(current, 1);
        break;
      default:
        return dates;
    }
  }
  return dates;
}

/** Public list of events (no auth). Only future events with show_public = true. Recurring events expanded. */
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
      recurrence_type: string | null;
      recurrence_end_date: string | null;
    }>(
      `SELECT id, title, type, date::text, time, end_time, location, capacity, registered, description, show_public,
              recurrence_type, recurrence_end_date::text
       FROM events
       WHERE date >= CURRENT_DATE AND (show_public IS NULL OR show_public = true)
       ORDER BY date ASC, time ASC`
    );
    const today = toDateStr(new Date());
    const instances: { id: string; title: string; type: string; date: string; time: string; endTime?: string; location: string; capacity: number; registered: number; description?: string }[] = [];
    for (const r of rows) {
      const recur = (r.recurrence_type ?? "none").toString().toLowerCase();
      const endDate = (r.recurrence_end_date ?? "").trim() || null;
      if (recur !== "none" && ["daily", "weekly", "biweekly", "monthly", "yearly"].includes(recur)) {
        const dateStrs = expandRecurrence(r.date, recur as RecurrenceType, endDate);
        for (const d of dateStrs) {
          if (d >= today) {
            instances.push({
              id: `${r.id}-${d}`,
              title: r.title,
              type: r.type,
              date: d,
              time: r.time,
              endTime: r.end_time ?? undefined,
              location: r.location ?? "",
              capacity: r.capacity,
              registered: r.registered,
              description: r.description ?? undefined,
            });
          }
        }
      } else {
        instances.push({
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
        });
      }
    }
    instances.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    return NextResponse.json({ events: instances });
  } catch (e) {
    console.error("[public/events GET]", e);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}
