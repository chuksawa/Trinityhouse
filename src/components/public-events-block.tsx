"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type PublicEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  registered: number;
  capacity: number;
};

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case "service": return "badge-purple";
    case "event": return "badge-blue";
    case "conference": return "badge-green";
    case "meeting": return "badge-gray";
    default: return "badge-gray";
  }
}

export default function PublicEventsBlock() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/public/events/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.events)) setEvents(data.events.slice(0, 8));
      })
      .catch(() => { if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="events" className="scroll-mt-20 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What&apos;s Happening
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Services, events, and ways to get connected.
            </p>
          </div>
          <Link
            href="/events"
            className="btn-secondary inline-flex shrink-0 items-center gap-2"
          >
            View all events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <p className="mt-10 text-center text-gray-500">Loading events…</p>
        ) : events.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">No upcoming events right now. Check back soon.</p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href="/events"
                className="card group flex flex-col p-5 transition-shadow hover:shadow-md"
              >
                <span className={`badge w-fit ${getTypeBadgeClass(event.type)}`}>
                  {event.type}
                </span>
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-brand-600">
                  {event.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {formatDateShort(event.date)} · {event.time}
                </p>
                {event.registered > 0 && event.capacity > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    {event.registered} registered
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
