"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function NotificationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/settings/notifications/`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (cancelled) return;
        setEmailEnabled(data.emailEnabled !== false);
        setSmsEnabled(data.smsEnabled === true);
        setPushEnabled(data.pushEnabled !== false);
      } catch {
        if (!cancelled) setMessage({ type: "error", text: "Failed to load preferences" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`${BASE_PATH}/api/settings/notifications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailEnabled, smsEnabled, pushEnabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to save" });
        setSaving(false);
        return;
      }
      setMessage({ type: "success", text: "Preferences saved." });
    } catch {
      setMessage({ type: "error", text: "Failed to save" });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/settings" className="text-sm font-medium text-gray-500 hover:text-gray-700">← Settings</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Configure email, SMS, and push notification preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-xl space-y-6 p-6">
        {message && (
          <div className={`rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">Email notifications</span>
            <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
          </label>
          <p className="text-xs text-gray-500">Receive updates and reminders by email.</p>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">SMS notifications</span>
            <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
          </label>
          <p className="text-xs text-gray-500">Receive text messages for urgent updates (when enabled by your church).</p>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-700">Push notifications</span>
            <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
          </label>
          <p className="text-xs text-gray-500">Receive push notifications in the browser or app.</p>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save preferences"}</button>
          <Link href="/dashboard/settings" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
