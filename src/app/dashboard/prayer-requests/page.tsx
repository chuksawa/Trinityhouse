"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Heart, CheckCircle2, Trash2, X } from "lucide-react";
import Modal from "@/components/modal";
import { cn, formatDate } from "@/lib/utils";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type PrayerRequest = {
  id: string;
  personName: string;
  request: string;
  requestDate: string;
  status: string;
  prayerCount: number;
};

const STATUS_TABS = [
  { value: "active", label: "Active" },
  { value: "answered", label: "Answered" },
  { value: "all", label: "All" },
];

export default function PrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ personName: "", request: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetch(`${BASE_PATH}/api/prayer-requests`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { prayerRequests: [] }))
      .then((data) => {
        if (Array.isArray(data.prayerRequests)) setRequests(data.prayerRequests);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const tabCounts = useMemo(() => ({
    active: requests.filter((r) => r.status === "active").length,
    answered: requests.filter((r) => r.status === "answered").length,
    all: requests.length,
  }), [requests]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.personName.trim() || !form.request.trim()) {
      setError("Name and prayer request are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/prayer-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ personName: form.personName.trim(), request: form.request.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create");
        return;
      }
      setCreateOpen(false);
      setForm({ personName: "", request: "" });
      load();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePray(id: string) {
    await fetch(`${BASE_PATH}/api/prayer-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ incrementPrayer: true }),
    }).catch(() => {});
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, prayerCount: r.prayerCount + 1 } : r))
    );
  }

  async function handleMarkAnswered(id: string) {
    await fetch(`${BASE_PATH}/api/prayer-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "answered" }),
    }).catch(() => {});
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "answered" } : r))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this prayer request?")) return;
    await fetch(`${BASE_PATH}/api/prayer-requests/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {});
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
          <p className="text-sm text-gray-500">Track and pray for community needs.</p>
        </div>
        <button type="button" onClick={() => { setError(""); setCreateOpen(true); }} className="btn-primary whitespace-nowrap">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <>
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
                  {tabCounts[tab.value as keyof typeof tabCounts] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-gray-500">
              {activeTab === "active" ? "No active prayer requests." : "No prayer requests found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((pr) => (
                <div key={pr.id} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("badge", pr.status === "active" ? "badge-purple" : "badge-green")}>
                      {pr.status === "active" ? "Active" : "Answered"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(pr.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">{pr.personName}</p>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-3">{pr.request}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatDate(pr.requestDate)}</p>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => handlePray(pr.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      Pray ({pr.prayerCount})
                    </button>
                    {pr.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handleMarkAnswered(pr.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        Answered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Prayer Request">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Who needs prayer?</label>
            <input
              type="text"
              value={form.personName}
              onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))}
              className="input"
              placeholder="e.g. John Doe"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Enter the name of the person you&apos;d like us to pray for.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Prayer Request</label>
            <textarea
              value={form.request}
              onChange={(e) => setForm((f) => ({ ...f, request: e.target.value }))}
              className="input min-h-[100px]"
              rows={4}
              placeholder="Describe the prayer need…"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Create Request"}
            </button>
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
