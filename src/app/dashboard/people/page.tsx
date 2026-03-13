"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Users, Pencil, Save } from "lucide-react";
import Modal from "@/components/modal";
import { cn, formatCurrency, formatDate, timeAgo, getInitials } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type MemberStatus = "active" | "inactive" | "at_risk" | "new";

type PersonFromApi = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  joinDate: string;
  status: string;
  lastAttendance: string | null;
  givingTotal: number;
  avatarColor: string;
};

const STATUS_TABS: { value: MemberStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "new", label: "New" },
  { value: "at_risk", label: "At Risk" },
  { value: "inactive", label: "Inactive" },
];

const PEOPLE_ROLES = ["senior_pastor", "senior_staff", "staff", "member"];

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "active": return "badge-green";
    case "new": return "badge-blue";
    case "at_risk": return "badge-yellow";
    case "inactive": return "badge-gray";
    default: return "badge-gray";
  }
}

function formatRole(role: string): string {
  return role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonFromApi[]>([]);
  const [currentUserEditableRoles, setCurrentUserEditableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MemberStatus | "all">("all");
  const [selectedPerson, setSelectedPerson] = useState<PersonFromApi | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PersonFromApi>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE_PATH}/api/people/`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { people: [], currentUserEditableRoles: [] })
      .then((data) => {
        if (!cancelled) {
          setPeople(data.people ?? []);
          setCurrentUserEditableRoles(data.currentUserEditableRoles ?? []);
        }
      })
      .catch(() => { if (!cancelled) setPeople([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch = !searchQuery ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || p.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [people, searchQuery, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: people.length };
    people.forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1; });
    return counts;
  }, [people]);

  function canEdit(person: PersonFromApi) {
    return currentUserEditableRoles.includes(person.role);
  }

  function openEdit() {
    if (selectedPerson) {
      setEditForm({
        firstName: selectedPerson.firstName,
        lastName: selectedPerson.lastName,
        email: selectedPerson.email,
        phone: selectedPerson.phone,
        role: selectedPerson.role,
        status: selectedPerson.status,
      });
      setEditing(true);
      setError("");
    }
  }

  async function saveEdit() {
    if (!selectedPerson) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_PATH}/api/people/${selectedPerson.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      setPeople((prev) =>
        prev.map((p) => (p.id === selectedPerson.id ? { ...p, ...editForm } : p))
      );
      setSelectedPerson((p) => (p && p.id === selectedPerson.id ? { ...p, ...editForm } : p));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">People & Care</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchOpen ? (
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                autoFocus
                type="search"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setSearchOpen(false)}
                className="input pl-9"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search by name"
              className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <button type="button" className="btn-primary whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Add Person
          </button>
        </div>
      </div>

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
            <span className={cn("ml-2", activeTab === tab.value ? "text-brand-600" : "text-gray-400")}>
              {tabCounts[tab.value] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="px-4 py-8 text-gray-500 text-center">Loading people…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPeople.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-cell text-center text-gray-500 py-8">
                      {people.length === 0 ? "No members yet. Add people to your database to see them here." : "No people match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredPeople.map((person) => (
                    <tr
                      key={person.id}
                      onClick={() => { setSelectedPerson(person); setEditing(false); setError(""); }}
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
                          <span className="font-medium text-gray-900">{person.firstName} {person.lastName}</span>
                        </div>
                      </td>
                      <td className="table-cell text-gray-600">{person.email}</td>
                      <td className="table-cell">
                        <span className="badge-purple">{formatRole(person.role)}</span>
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadgeClass(person.status)}>{formatRole(person.status)}</span>
                      </td>
                      <td className="table-cell text-gray-600">
                        {person.lastAttendance ? timeAgo(person.lastAttendance) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!selectedPerson}
        onClose={() => { setSelectedPerson(null); setEditing(false); setError(""); }}
        title={selectedPerson ? `${selectedPerson.firstName} ${selectedPerson.lastName}` : "Person"}
        wide
      >
        {selectedPerson && (
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input
                      type="text"
                      value={editForm.firstName ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <input
                      type="text"
                      value={editForm.lastName ?? ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editForm.role ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                    className="input"
                  >
                    {PEOPLE_ROLES.map((r) => (
                      <option key={r} value={r}>{formatRole(r)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="new">New</option>
                    <option value="at_risk">At Risk</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={saveEdit} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white",
                        selectedPerson.avatarColor
                      )}
                    >
                      {getInitials(selectedPerson.firstName, selectedPerson.lastName)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="badge-purple">{formatRole(selectedPerson.role)}</span>
                        <span className={getStatusBadgeClass(selectedPerson.status)}>{formatRole(selectedPerson.status)}</span>
                      </div>
                      <p className="mt-2 text-gray-600">{selectedPerson.email}</p>
                      <p className="text-gray-600">{selectedPerson.phone || "—"}</p>
                    </div>
                  </div>
                  {canEdit(selectedPerson) && (
                    <button type="button" onClick={openEdit} className="btn-primary inline-flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Join date</h3>
                  <p className="text-gray-900">{formatDate(selectedPerson.joinDate)}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Giving total</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedPerson.givingTotal)}</p>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
