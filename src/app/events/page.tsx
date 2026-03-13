"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import PublicHeader from "@/components/public-header";
import { SiteFooterMinimal } from "@/components/site-footer";
import { formatDate, formatDateShort } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type PublicEvent = {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  capacity: number;
  registered: number;
  description?: string;
};

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case "service":
      return "badge-purple";
    case "event":
      return "badge-blue";
    case "conference":
      return "badge-green";
    case "meeting":
      return "badge-gray";
    default:
      return "badge-gray";
  }
}

export default function PublicEventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/public/events/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.events)) setEvents(data.events);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const weekendEvents = events.filter((e) => isWeekend(e.date));
  const otherUpcoming = events.filter((e) => !isWeekend(e.date));

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <Link href="/home" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Events & Weekends
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Services, events, and ways to get connected. No account needed.
          </p>
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading events…</p>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-600">No upcoming events at the moment.</p>
            <p className="mt-2 text-sm text-gray-500">Check back later or visit us on a Sunday.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {weekendEvents.length > 0 && (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">This weekend</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {weekendEvents.map((event) => (
                    <div
                      key={event.id}
                      className="card flex flex-col p-5"
                    >
                      <span className={`badge w-fit ${getTypeBadgeClass(event.type)}`}>
                        {event.type}
                      </span>
                      <h3 className="mt-3 font-semibold text-gray-900">{event.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {formatDate(event.date)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="h-4 w-4 shrink-0" />
                        {event.time}
                        {event.endTime ? ` – ${event.endTime}` : ""}
                      </p>
                      {event.location && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 shrink-0" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-3">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                {weekendEvents.length > 0 ? "More upcoming" : "Upcoming events"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(weekendEvents.length > 0 ? otherUpcoming : events).map((event) => (
                  <div key={event.id} className="card flex flex-col p-5">
                    <span className={`badge w-fit ${getTypeBadgeClass(event.type)}`}>
                      {event.type}
                    </span>
                    <h3 className="mt-3 font-semibold text-gray-900">{event.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 shrink-0" />
                      {formatDateShort(event.date)} · {event.time}
                    </p>
                    {event.location && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-3">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <SiteFooterMinimal />
    </div>
  );
}
