"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Calendar, Clock, MapPin, Users, UserCheck, Globe, Trash2, X } from "lucide-react";
import Modal from "@/components/modal";
import { cn, formatDate } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Attendee = { id: number; name: string };

type EventType = "service" | "event" | "conference" | "meeting";
type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

type DashboardEvent = {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  capacity: number;
  registered: number;
  checkedIn: number;
  description?: string;
  teams: string[];
  showPublic: boolean;
  recurrenceType: RecurrenceType;
  recurrenceEndDate?: string;
};

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const TYPE_TABS: { value: "all" | EventType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "service", label: "Services" },
  { value: "event", label: "Events" },
  { value: "conference", label: "Conferences" },
  { value: "meeting", label: "Meetings" },
];

function getTypeBadgeClass(type: string): string {
  switch (type) {
    case "service": return "badge-purple";
    case "event": return "badge-blue";
    case "conference": return "badge-green";
    case "meeting": return "badge-gray";
    default: return "badge-gray";
  }
}

function formatEventType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Parse stored time (e.g. "9:00 AM", "09:00") to HH:mm for <input type="time">. */
function parseTimeForInput(s: string | undefined): string {
  if (!s || !s.trim()) return "";
  const t = s.trim();
  const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/);
  if (!match) return "";
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = match[3]?.toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

const emptyForm = {
  title: "",
  type: "event" as EventType,
  date: "",
  time: "09:00",
  endTime: "",
  location: "",
  capacity: 0,
  description: "",
  showPublic: true,
  recurrenceType: "none" as RecurrenceType,
  recurrenceEndDate: "",
};

function CheckInModal({
  event,
  onClose,
  onCheckedIn,
}: {
  event: DashboardEvent;
  onClose: () => void;
  onCheckedIn: () => void;
}) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [busy, setBusy] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [err, setErr] = useState("");

  const loadAttendees = useCallback(() => {
    fetch(`${BASE_PATH}/api/attendance?eventId=${encodeURIComponent(event.id)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { attendees: [] }))
      .then((d) => { if (Array.isArray(d.attendees)) setAttendees(d.attendees); })
      .catch(() => {});
  }, [event.id]);

  useEffect(() => { loadAttendees(); }, [loadAttendees]);

  async function handleCheckIn() {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventId: event.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) { setCheckedIn(true); }
        else { setErr(data.error || "Failed"); }
        return;
      }
      setCheckedIn(true);
      loadAttendees();
      onCheckedIn();
    } catch { setErr("Failed to check in"); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <p className="mb-5 text-sm text-gray-500">{formatDate(event.date)} · {event.time}</p>

        {checkedIn ? (
          <div className="flex flex-col items-center rounded-lg bg-green-50 py-5 text-center">
            <UserCheck className="mb-2 h-8 w-8 text-green-500" />
            <p className="font-medium text-green-700">You&apos;re checked in!</p>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={handleCheckIn}
            className="w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? "Checking in…" : "Check In"}
          </button>
        )}

        {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

        <div className="mt-5 border-t border-gray-200 pt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Checked in ({attendees.length})
          </h4>
          {attendees.length === 0 ? (
            <p className="text-sm text-gray-400">No one checked in yet.</p>
          ) : (
            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {attendees.map((a) => (
                <li key={a.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700">
                  <UserCheck className="h-3.5 w-3.5 text-green-500" />
                  {a.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | EventType>("all");
  const [selectedEvent, setSelectedEvent] = useState<DashboardEvent | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [checkInEvent, setCheckInEvent] = useState<DashboardEvent | null>(null);

  function loadEvents() {
    setLoading(true);
    fetch(`${BASE_PATH}/api/events/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then((data) => {
        setEvents(Array.isArray(data.events) ? data.events : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (activeTab === "all") return sorted;
    return sorted.filter((e) => e.type === activeTab);
  }, [events, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    events.forEach((e) => {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
    });
    return counts;
  }, [events]);

  function openCreate() {
    setForm(emptyForm);
    setError("");
    setCreateOpen(true);
  }

  function openEdit(event: DashboardEvent) {
    setSelectedEvent(null);
    setForm({
      title: event.title,
      type: event.type,
      date: event.date,
      time: parseTimeForInput(event.time) || "09:00",
      endTime: parseTimeForInput(event.endTime) ?? "",
      location: event.location ?? "",
      capacity: event.capacity,
      description: event.description ?? "",
      showPublic: event.showPublic,
      recurrenceType: (event.recurrenceType ?? "none") as RecurrenceType,
      recurrenceEndDate: event.recurrenceEndDate ?? "",
    });
    setSelectedEvent(event);
    setError("");
  }

  function closeModal() {
    setCreateOpen(false);
    setSelectedEvent(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      type: form.type,
      date: form.date,
      time: form.time,
      endTime: form.endTime.trim() || undefined,
      location: form.location.trim() || undefined,
      capacity: form.capacity,
      description: form.description.trim() || undefined,
      showPublic: form.showPublic,
      recurrenceType: form.recurrenceType,
      recurrenceEndDate: form.recurrenceType !== "none" && form.recurrenceEndDate ? form.recurrenceEndDate : undefined,
    };
    if (!payload.title || !payload.date || !payload.time) {
      setError("Title, date, and time are required.");
      setSaving(false);
      return;
    }
    try {
      if (createOpen) {
        const res = await fetch(`${BASE_PATH}/api/events/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...payload, id: `e-${Date.now()}` }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Failed to create event");
          setSaving(false);
          return;
        }
        closeModal();
        loadEvents();
      } else if (selectedEvent) {
        const res = await fetch(`${BASE_PATH}/api/events/${encodeURIComponent(selectedEvent.id)}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Failed to update event");
          setSaving(false);
          return;
        }
        closeModal();
        loadEvents();
      }
    } catch {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!selectedEvent) return;
    if (!confirm(`Delete "${selectedEvent.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${BASE_PATH}/api/events/${encodeURIComponent(selectedEvent.id)}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        closeModal();
        loadEvents();
      } else {
        setError("Failed to delete event");
      }
    } catch {
      setError("Failed to delete event");
    }
  }

  const isEdit = !!selectedEvent && !createOpen;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Weekends</h1>
          <p className="text-sm text-gray-500">Manage events. Toggle “Show on public site” to control what appears for visitors (no login).</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading events…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === tab.value
                    ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {tab.label}
                <span className={cn("ml-2", activeTab === tab.value ? "text-brand-600" : "text-gray-400")}>
                  {tabCounts[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const regPct = event.capacity > 0 ? Math.min(100, (event.registered / event.capacity) * 100) : event.registered > 0 ? 100 : 0;
              return (
                <div
                  key={event.id}
                  className="card flex flex-col items-stretch gap-4 p-5 text-left transition-all hover:border-brand-200 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    className="flex flex-col items-stretch gap-4 text-left focus:outline-none"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={cn("badge shrink-0", getTypeBadgeClass(event.type))}>
                        {formatEventType(event.type)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {event.showPublic && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700" title="Shown on public site">
                            <Globe className="h-3 w-3 inline" />
                          </span>
                        )}
                        {(event.recurrenceType ?? "none") !== "none" && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800" title="Recurring">
                            Repeats {RECURRENCE_OPTIONS.find((o) => o.value === (event.recurrenceType ?? "none"))?.label?.toLowerCase() ?? event.recurrenceType}
                          </span>
                        )}
                        {event.checkedIn > 0 && (
                          <span className="badge badge-green flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />
                            {event.checkedIn}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.time}
                          {event.endTime ? ` – ${event.endTime}` : ""}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    {event.showPublic && (event.registered > 0 || event.capacity > 0) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-600">
                            <Users className="mr-1 inline h-3 w-3" />
                            {event.registered} / {event.capacity} registered
                          </span>
                          {event.capacity > 0 && <span className="text-gray-400">{Math.round(regPct)}%</span>}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn("h-full rounded-full transition-all", regPct >= 100 ? "bg-amber-500" : "bg-brand-500")}
                            style={{ width: `${regPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckInEvent(event)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Check In
                  </button>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <p className="py-12 text-center text-gray-500">No events yet. Create one to show on the public site.</p>
          )}
        </>
      )}

      {checkInEvent && (
        <CheckInModal
          event={checkInEvent}
          onClose={() => setCheckInEvent(null)}
          onCheckedIn={loadEvents}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={createOpen || isEdit}
        onClose={closeModal}
        title={createOpen ? "Create Event" : "Edit Event"}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input"
              placeholder="e.g. Sunday Worship Service"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EventType }))}
                className="input"
              >
                {TYPE_TABS.filter((t) => t.value !== "all").map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <input
                type="checkbox"
                id="show-public"
                checked={form.showPublic}
                onChange={(e) => setForm((f) => ({ ...f, showPublic: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
              />
              <label htmlFor="show-public" className="text-sm text-gray-700">Show on public site</label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="input"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeats</label>
              <select
                value={form.recurrenceType}
                onChange={(e) => setForm((f) => ({ ...f, recurrenceType: e.target.value as RecurrenceType }))}
                className="input"
              >
                {RECURRENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {form.recurrenceType !== "none" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ends (optional)</label>
                <input
                  type="date"
                  value={form.recurrenceEndDate}
                  onChange={(e) => setForm((f) => ({ ...f, recurrenceEndDate: e.target.value }))}
                  className="input"
                  placeholder="Leave empty for no end"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="input"
              placeholder="Main Sanctuary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (0 = no limit)</label>
            <input
              type="number"
              min={0}
              value={form.capacity || ""}
              onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value, 10) || 0 }))}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create event"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger inline-flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
