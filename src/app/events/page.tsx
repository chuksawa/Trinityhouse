"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Calendar, Clock, MapPin, ArrowLeft, UserPlus, CheckCircle2, X, UserMinus } from "lucide-react";
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

function regKey(eventId: string, date: string): string {
  const base = eventId.replace(/-\d{4}-\d{2}-\d{2}$/, "");
  return `th_reg_${base}_${date}`;
}

function saveReg(eventId: string, date: string, email: string) {
  try { localStorage.setItem(regKey(eventId, date), email); } catch { /* noop */ }
}

function clearReg(eventId: string, date: string) {
  try { localStorage.removeItem(regKey(eventId, date)); } catch { /* noop */ }
}

function getSavedRegEmail(eventId: string, date: string): string | null {
  try { return localStorage.getItem(regKey(eventId, date)); } catch { return null; }
}

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

function RegistrationModal({
  event,
  onClose,
  onSuccess,
  alreadyRegistered,
}: {
  event: PublicEvent;
  onClose: () => void;
  onSuccess: () => void;
  alreadyRegistered: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(() => getSavedRegEmail(event.id, event.date) ?? "");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const baseEventId = event.id.replace(/-\d{4}-\d{2}-\d{2}$/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/public/events/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: baseEventId,
          instanceDate: event.date,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      saveReg(event.id, event.date, email.trim().toLowerCase());
      setDone(true);
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnregister = async () => {
    const savedEmail = getSavedRegEmail(event.id, event.date);
    if (!savedEmail) {
      setError("Enter the email you registered with to unregister.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/public/events/register`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: baseEventId,
          instanceDate: event.date,
          email: savedEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to unregister.");
        return;
      }
      clearReg(event.id, event.date);
      setCancelled(true);
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {cancelled ? (
          <div className="flex flex-col items-center py-6 text-center">
            <UserMinus className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Registration cancelled</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your registration for <span className="font-medium">{event.title}</span> on{" "}
              {formatDate(event.date)} has been removed.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">You&apos;re registered!</h3>
            <p className="mt-2 text-sm text-gray-600">
              We&apos;ll see you at <span className="font-medium">{event.title}</span> on{" "}
              {formatDate(event.date)} at {event.time}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        ) : alreadyRegistered ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">You&apos;re registered</h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">{event.title}</span> &middot; {formatDate(event.date)} at {event.time}
            </p>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button
              onClick={handleUnregister}
              disabled={submitting}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <UserMinus className="h-4 w-4" />
              {submitting ? "Cancelling…" : "Cancel registration"}
            </button>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">Register for event</h3>
            <p className="mb-5 text-sm text-gray-500">{event.title} &middot; {formatDate(event.date)}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">First name</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Last name</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="+234 800 000 0000"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? "Registering…" : "Register"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onRegister, isRegistered }: { event: PublicEvent; onRegister: (e: PublicEvent) => void; isRegistered: boolean }) {
  const isFull = event.capacity > 0 && event.registered >= event.capacity;
  const spotsText =
    event.capacity > 0
      ? `${event.registered}/${event.capacity} registered`
      : event.registered > 0
        ? `${event.registered} registered`
        : null;

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-2">
        <span className={`badge w-fit ${getTypeBadgeClass(event.type)}`}>
          {event.type}
        </span>
        {spotsText && (
          <span className={`text-xs font-medium ${isFull ? "text-red-500" : "text-gray-500"}`}>
            {spotsText}
          </span>
        )}
      </div>
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
      <div className="mt-auto pt-4">
        {isRegistered ? (
          <button
            onClick={() => onRegister(event)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            <CheckCircle2 className="h-4 w-4" />
            Registered
          </button>
        ) : (
          <button
            onClick={() => onRegister(event)}
            disabled={isFull}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            <UserPlus className="h-4 w-4" />
            {isFull ? "Event Full" : "Register"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PublicEventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerEvent, setRegisterEvent] = useState<PublicEvent | null>(null);
  const [regVersion, setRegVersion] = useState(0);

  const loadEvents = useCallback(() => {
    fetch(`${BASE_PATH}/api/public/events/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        if (Array.isArray(data.events)) setEvents(data.events);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const isEventRegistered = useCallback((e: PublicEvent) => {
    void regVersion;
    return !!getSavedRegEmail(e.id, e.date);
  }, [regVersion]);

  const handleRegSuccess = useCallback(() => {
    loadEvents();
    setRegVersion((v) => v + 1);
  }, [loadEvents]);

  const weekendEvents = events.filter((e) => isWeekend(e.date));
  const otherUpcoming = events.filter((e) => !isWeekend(e.date));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PublicHeader />

      {registerEvent && (
        <RegistrationModal
          event={registerEvent}
          onClose={() => setRegisterEvent(null)}
          onSuccess={handleRegSuccess}
          alreadyRegistered={isEventRegistered(registerEvent)}
        />
      )}

      <main className="mx-auto flex-1 w-full max-w-6xl px-4 py-12 sm:py-16">
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
                    <EventCard key={event.id} event={event} onRegister={setRegisterEvent} isRegistered={isEventRegistered(event)} />
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
                  <EventCard key={event.id} event={event} onRegister={setRegisterEvent} isRegistered={isEventRegistered(event)} />
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
