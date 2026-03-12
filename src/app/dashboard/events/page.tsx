"use client";

import { useState, useMemo } from "react";
import { Plus, Calendar, Clock, MapPin, Users, UserCheck } from "lucide-react";
import Modal from "@/components/modal";
import { cn, formatDate } from "@/lib/utils";
import { events } from "@/lib/data";
import type { ChurchEvent } from "@/lib/data";

type EventTypeFilter = "all" | ChurchEvent["type"];

const TYPE_TABS: { value: EventTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "service", label: "Services" },
  { value: "event", label: "Events" },
  { value: "conference", label: "Conferences" },
  { value: "meeting", label: "Meetings" },
];

function getTypeBadgeClass(type: ChurchEvent["type"]): string {
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

function formatEventType(type: ChurchEvent["type"]): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventTypeFilter>("all");
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  const filteredEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (activeTab === "all") return sorted;
    return sorted.filter((e) => e.type === activeTab);
  }, [activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: events.length };
    events.forEach((e) => {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events & Weekends</h1>
          <p className="text-sm text-gray-500">Manage services, events, and conferences</p>
        </div>
        <button type="button" className="btn-primary whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Filter Tabs */}
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
            <span
              className={cn(
                "ml-2",
                activeTab === tab.value ? "text-brand-600" : "text-gray-400"
              )}
            >
              {tabCounts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const regPct =
            event.capacity > 0
              ? Math.min(100, (event.registered / event.capacity) * 100)
              : event.registered > 0
                ? 100
                : 0;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedEvent(event)}
              className="card flex flex-col items-stretch gap-4 p-5 text-left transition-all hover:border-brand-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn("badge shrink-0", getTypeBadgeClass(event.type))}>
                  {formatEventType(event.type)}
                </span>
                {event.checkedIn > 0 && (
                  <span className="badge badge-green flex items-center gap-1">
                    <UserCheck className="h-3 w-3" />
                    {event.checkedIn} checked in
                  </span>
                )}
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
                    {event.endTime && ` – ${event.endTime}`}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {event.location}
                  </span>
                </div>
              </div>

              {(event.registered > 0 || event.capacity > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      <Users className="mr-1 inline h-3 w-3" />
                      {event.registered} / {event.capacity} registered
                    </span>
                    {event.capacity > 0 && (
                      <span className="text-gray-400">{Math.round(regPct)}%</span>
                    )}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        regPct >= 100 ? "bg-amber-500" : "bg-brand-500"
                      )}
                      style={{ width: `${regPct}%` }}
                    />
                  </div>
                </div>
              )}

              {event.teams.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {event.teams.map((team) => (
                    <span
                      key={team}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <p className="py-12 text-center text-gray-500">
          No events match your filter.
        </p>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title ?? "Event Details"}
        wide
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("badge", getTypeBadgeClass(selectedEvent.type))}>
                {formatEventType(selectedEvent.type)}
              </span>
              {selectedEvent.checkedIn > 0 && (
                <span className="badge badge-green">
                  {selectedEvent.checkedIn} checked in
                </span>
              )}
            </div>

            {selectedEvent.description && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Description
                </h3>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Date & Time
                </h3>
                <p className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(selectedEvent.date)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {selectedEvent.time}
                  {selectedEvent.endTime && ` – ${selectedEvent.endTime}`}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Location
                </h3>
                <p className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {selectedEvent.location}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Registration
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {selectedEvent.registered} registered
                    </span>
                    <span className="text-gray-500">
                      of {selectedEvent.capacity} capacity
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        selectedEvent.capacity > 0 &&
                          selectedEvent.registered >= selectedEvent.capacity
                          ? "bg-amber-500"
                          : "bg-brand-500"
                      )}
                      style={{
                        width: `${
                          selectedEvent.capacity > 0
                            ? Math.min(
                                100,
                                (selectedEvent.registered / selectedEvent.capacity) * 100
                              )
                            : selectedEvent.registered > 0
                              ? 100
                              : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              {selectedEvent.checkedIn > 0 && (
                <p className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                  {selectedEvent.checkedIn} checked in
                </p>
              )}
            </div>

            {selectedEvent.teams.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Assigned Teams
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.teams.map((team) => (
                    <span key={team} className="badge badge-blue">
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Run Sheet
              </h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                    <span>Setup & doors open</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                    <span>Welcome & announcements</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                    <span>Worship</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                    <span>Message</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                    <span>Benediction & dismissal</span>
                  </li>
                </ul>
                <p className="mt-3 text-xs text-gray-400">
                  Placeholder run sheet. Customize per event.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
