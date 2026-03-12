"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Users } from "lucide-react";
import Modal from "@/components/modal";
import { cn, formatCurrency, formatDate, timeAgo, getInitials } from "@/lib/utils";
import { people, getPersonById, getGroupById } from "@/lib/data";
import type { Person, MemberStatus } from "@/lib/data";

const STATUS_TABS: { value: MemberStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "at_risk", label: "At Risk" },
  { value: "inactive", label: "Inactive" },
];

function getStatusBadgeClass(status: MemberStatus): string {
  switch (status) {
    case "active":
      return "badge-green";
    case "new":
      return "badge-blue";
    case "at_risk":
      return "badge-yellow";
    case "inactive":
      return "badge-gray";
    default:
      return "badge-gray";
  }
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MemberStatus | "all">("all");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab =
        activeTab === "all" || p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: people.length };
    people.forEach((p) => {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">People & Care</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          <button type="button" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Add Person
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {STATUS_TABS.map((tab) => (
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

      {/* People Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Status</th>
                <th className="table-header">Last Seen</th>
                <th className="table-header">Groups</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-gray-500">
                    No people match your filters.
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => (
                  <tr
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                            person.avatarColor
                          )}
                        >
                          {getInitials(person.firstName, person.lastName)}
                        </div>
                        <span className="font-medium text-gray-900">
                          {person.firstName} {person.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">{person.email}</td>
                    <td className="table-cell">
                      <span className="badge-purple">
                        {formatRole(person.role)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={getStatusBadgeClass(person.status)}>
                        {formatRole(person.status)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {timeAgo(person.lastAttendance)}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        {person.groups.length}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        title={selectedPerson ? `${selectedPerson.firstName} ${selectedPerson.lastName}` : "Person"}
        wide
      >
        {selectedPerson && (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className={cn(
                  "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white",
                  selectedPerson.avatarColor
                )}
              >
                {getInitials(selectedPerson.firstName, selectedPerson.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-purple">{formatRole(selectedPerson.role)}</span>
                  <span className={getStatusBadgeClass(selectedPerson.status)}>
                    {formatRole(selectedPerson.status)}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{selectedPerson.email}</p>
                <p className="text-gray-600">{selectedPerson.phone}</p>
              </div>
            </div>

            {/* Milestones */}
            {selectedPerson.milestones.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Milestones
                </h3>
                <div className="space-y-2">
                  {selectedPerson.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-gray-900">{m.label}</span>
                      <span className="text-sm text-gray-500">{formatDate(m.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups */}
            {selectedPerson.groups.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Groups
                </h3>
                <ul className="space-y-2">
                  {selectedPerson.groups.map((gId) => {
                    const g = getGroupById(gId);
                    return g ? (
                      <li key={gId} className="text-sm text-gray-700">
                        {g.name}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}

            {/* Serving teams */}
            {selectedPerson.servingTeams.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Serving Teams
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPerson.servingTeams.map((team) => (
                    <span key={team} className="badge-blue">
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Care notes */}
            {selectedPerson.careNotes.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Care Notes
                </h3>
                <div className="space-y-3">
                  {selectedPerson.careNotes.map((note, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3"
                    >
                      <p className="text-sm text-gray-800">{note.note}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(note.date)} — {note.by}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Giving total */}
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Giving Total
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(selectedPerson.givingTotal)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
